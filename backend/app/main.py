import os
import boto3
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlmodel import select
from .db import init_db, engine
from .models import Profile, Video
from sqlmodel import Session
from botocore.exceptions import BotoCoreError, ClientError
from io import BytesIO

app = FastAPI(title="Video Netflix Starter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount('/media', StaticFiles(directory=os.path.join(os.getcwd(), 'media')), name='media')

# Initialize S3 client once
_s3_client = None
def get_s3_client():
    global _s3_client
    if not _s3_client:
        region = os.environ.get('S3_BUCKET_REGION') or 'eu-north-1'
        # Configure boto3 to use region-specific endpoint for signature matching
        # This is required for presigned URLs in non-us-east-1 regions
        _s3_client = boto3.client(
            's3',
            region_name=region,
            aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
            endpoint_url=f'https://s3.{region}.amazonaws.com' if region != 'us-east-1' else None,
        )
    return _s3_client


@app.get('/api/presign')
def presign_object(key: str):
    """Return a presigned GET URL for an S3 object."""
    bucket = os.environ.get('S3_BUCKET')
    region = os.environ.get('S3_BUCKET_REGION') or 'eu-north-1'
    if not bucket:
        raise HTTPException(status_code=500, detail='S3_BUCKET not configured')

    try:
        s3 = get_s3_client()
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': key},
            ExpiresIn=3600,
        )
        return {'url': url, 'region': region}
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=f'error generating presigned url: {e}')


@app.get('/api/video/{key:path}')
def stream_video(key: str):
    """Stream video from S3 bucket with CORS headers."""
    bucket = os.environ.get('S3_BUCKET')
    if not bucket:
        raise HTTPException(status_code=500, detail='S3_BUCKET not configured')
    
    try:
        s3 = get_s3_client()
        # Head request to check if object exists and get its size
        head = s3.head_object(Bucket=bucket, Key=key)
        size = head['ContentLength']
        content_type = head.get('ContentType', 'video/mp4')
        
        # Get the object
        response = s3.get_object(Bucket=bucket, Key=key)
        
        # Stream the video with proper headers
        return StreamingResponse(
            response['Body'].iter_chunks(chunk_size=1024*1024),
            media_type=content_type,
            headers={
                'Content-Length': str(size),
                'Accept-Ranges': 'bytes',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': '*',
            }
        )
    except s3.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail=f'video not found: {key}')
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=f'error streaming video: {e}')


@app.on_event('startup')
def on_startup():
    init_db()
    # seed minimal data if empty
    with Session(engine) as session:
        profiles = session.exec(select(Profile)).all()
        # If no profiles exist, create one named "US <3" and attach the new media if present.
        media_source = '/media/You+Me.mp4'
        if not profiles:
            p = Profile(name='US <3', description='A demo profile with your uploaded video')
            session.add(p)
            session.commit()
            session.refresh(p)
            v = Video(title='You+Me', source=media_source, thumbnail=None, profile_id=p.id)
            session.add(v)
            session.commit()
        else:
            # Rename the first existing profile to "US <3" and ensure it has the video
            p = profiles[0]
            if p.name != 'US <3':
                p.name = 'US <3'
                session.add(p)
                session.commit()
            # Add the media to this profile if not already present
            exists = session.exec(select(Video).where(Video.profile_id == p.id).where(Video.source == media_source)).first()
            if not exists:
                v = Video(title='You+Me', source=media_source, thumbnail=None, profile_id=p.id)
                session.add(v)
                session.commit()


@app.get('/api/profiles')
def list_profiles():
    with Session(engine) as session:
        return session.exec(select(Profile)).all()


@app.get('/api/profiles/{profile_id}')
def get_profile(profile_id: int):
    with Session(engine) as session:
        p = session.get(Profile, profile_id)
        if not p:
            raise HTTPException(status_code=404, detail='profile not found')
        return p


@app.get('/api/profiles/{profile_id}/videos')
def list_videos_for_profile(profile_id: int):
    with Session(engine) as session:
        q = select(Video).where(Video.profile_id == profile_id)
        return session.exec(q).all()


@app.get('/api/videos')
def list_videos():
    with Session(engine) as session:
        return session.exec(select(Video)).all()
