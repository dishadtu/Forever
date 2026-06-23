from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from .db import init_db, engine
from .models import Profile, Video
from sqlmodel import Session
import os

app = FastAPI(title="Video Netflix Starter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount('/media', StaticFiles(directory=os.path.join(os.getcwd(), 'media')), name='media')


@app.on_event('startup')
def on_startup():
    init_db()
    # seed minimal data if empty
    with Session(engine) as session:
        profiles = session.exec(select(Profile)).all()
        if not profiles:
            p = Profile(name='Default', description='A sample theme')
            session.add(p)
            session.commit()
            session.refresh(p)
            v = Video(title='Sample Video', source='/media/sample.mp4', thumbnail=None, profile_id=p.id)
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
