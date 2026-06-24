const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

module.exports = async (req, res) => {
  const key = req.query.key || (req.body && req.body.key)
  if (!key) return res.status(400).json({ error: 'missing key' })

  const region = process.env.S3_BUCKET_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
  const bucket = process.env.S3_BUCKET
  if (!bucket || !region) return res.status(500).json({ error: 'S3_BUCKET or AWS_REGION not set' })

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })

  try {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })
    const url = await getSignedUrl(client, cmd, { expiresIn: 3600 })
    return res.json({ url, region })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
