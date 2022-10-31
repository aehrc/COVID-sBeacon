resource aws_s3_bucket cache {
  bucket_prefix = "beacon-cache"
  force_destroy = true
  tags = var.common-tags
}

resource aws_s3_bucket_lifecycle_configuration cache {
  bucket = aws_s3_bucket.cache.id
  rule {
    id = "${aws_s3_bucket.cache.id}_lifecycle_rule"
    status = "Enabled"
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
}

resource aws_s3_bucket_cors_configuration datasets_artifacts {
  bucket = aws_s3_bucket.dataset_artifacts.id
  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}

resource aws_s3_bucket_lifecycle_configuration datasets_artifacts {
  bucket = aws_s3_bucket.dataset_artifacts.id
  rule {
    id = "${aws_s3_bucket.dataset_artifacts.id}_lifecycle_rule"
    status = "Enabled"
    expiration {
      days = 1
    }
  }
}
