resource aws_s3_bucket cache {
  bucket_prefix = "beacon-cache"
  tags = var.common-tags
}
