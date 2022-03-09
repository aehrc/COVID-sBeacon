resource aws_s3_bucket cache {
  bucket_prefix = "beacon-cache"
  force_destroy = true
  tags = var.common-tags
  lifecycle_rule {
    enabled = true
    expiration {
      days = local.cache_days
    }
  }
}

resource aws_s3_bucket dataset_artifacts {
  bucket_prefix = "beacon-dataset-artifacts"
  force_destroy = true
  tags = var.common-tags
}

resource aws_s3_bucket large_response_bucket {
  bucket_prefix = "beacon-large-responses"
  force_destroy = true
  tags = var.common-tags

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }

  lifecycle_rule {
    enabled = true
      expiration {
      days = 1
    }
  }
}
