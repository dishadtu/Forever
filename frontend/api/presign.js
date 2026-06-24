const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

module.exports = async (req, res) => {
  const key = req.query.key || (req.body && req.body.key)
  if (!key) return res.status(400).json({ error: 'missing key' })

  const bucket = process.env.S3_BUCKET
  if (!bucket) return res.status(500).json({ error: 'S3_BUCKET not set' })

  // Use explicit region env var, or default to eu-north-1
  const region = process.env.S3_BUCKET_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'eu-north-1'

  try {
    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })

    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })
    const url = await getSignedUrl(client, cmd, { expiresIn: 3600 })
    return res.json({ url, region })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
