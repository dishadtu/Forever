const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const crypto = require('crypto')
const querystring = require('querystring')

module.exports = async (req, res) => {
  const key = req.query.key || (req.body && req.body.key)
  if (!key) return res.status(400).json({ error: 'missing key' })

  const bucket = process.env.S3_BUCKET
  if (!bucket) return res.status(500).json({ error: 'S3_BUCKET not set' })

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  if (!accessKeyId || !secretAccessKey) {
    return res.status(500).json({ error: 'AWS credentials not set in environment' })
  }

  // Use explicit S3 region, or default to eu-north-1
  const region = process.env.S3_BUCKET_REGION || 'eu-north-1'

  try {
    // Try SDK presign first, but strip problematic query params
    const client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })
    let url = await getSignedUrl(client, cmd, { expiresIn: 3600 })
    
    // Remove problematic query parameters added by AWS SDK v3
    // (x-amz-checksum-mode, x-id) that break signature validation
    url = url.replace(/&x-amz-checksum-mode=[^&]*/g, '')
              .replace(/&x-id=[^&]*/g, '')
    
    // add STS client to fetch caller identity for debugging
    const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts')
    const sts = new STSClient({ region, credentials: { accessKeyId, secretAccessKey } })
    const who = await sts.send(new GetCallerIdentityCommand({}))

    return res.json({ url, region, bucket, key, caller: who })
  } catch (err) {
    console.error('Presign error:', {
      bucket,
      key,
      region,
      error: err.message,
      code: err.code,
      credentialsSet: !!(accessKeyId && secretAccessKey),
    })
    return res.status(500).json({ 
      error: String(err.message || err),
      details: {
        bucket,
        region,
        credentialsSet: !!(accessKeyId && secretAccessKey),
      }
    })
  }
}
