const { S3Client, GetObjectCommand, GetBucketLocationCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

module.exports = async (req, res) => {
  const key = req.query.key || (req.body && req.body.key)
  if (!key) return res.status(400).json({ error: 'missing key' })

  let region = process.env.S3_BUCKET_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
  const bucket = process.env.S3_BUCKET
  if (!bucket) return res.status(500).json({ error: 'S3_BUCKET not set' })

  try {
    // If region not provided via env, attempt to detect via GetBucketLocation
    if (!region) {
      const probeClient = new S3Client({ region: 'us-east-1', credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } })
      const loc = await probeClient.send(new GetBucketLocationCommand({ Bucket: bucket }))
      const lc = loc.LocationConstraint
      if (!lc) region = 'us-east-1'
      else if (lc === 'EU') region = 'eu-west-1'
      else region = lc
    }

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
