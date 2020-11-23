

resource aws_s3_bucket website_bucket {
  bucket_prefix = "covid19-beacon-website"

  versioning {
    enabled = true
  }
}

resource aws_s3_bucket_notification refreshCloudfront {
  bucket = aws_s3_bucket.website_bucket.id

  lambda_function {
    lambda_function_arn = module.lambda_refreshCloudfront.function_arn
    events = [
      "s3:ObjectCreated:*",
    ]
  }

  depends_on = [aws_lambda_permission.s3_refreshCloudfront]
}

data external hash {
  program = ["/bin/bash", "hash.sh"]
  working_dir = path.module
}

resource null_resource upload {

  triggers = {
    command_hash = filesha256("${path.module}/upload.sh")
    src_hash = lookup(data.external.hash.result, "hash")
  }
  provisioner local-exec {
      command = "./upload.sh ${aws_s3_bucket.website_bucket.id}  ${aws_cloudfront_distribution.platform_distribution.id} ${var.beacon_api_url} ${var.login}"
      working_dir = path.module
    }

  depends_on = [
    aws_s3_bucket.website_bucket
  ]
}

resource aws_s3_bucket_policy cloudfront_access {
  bucket = aws_s3_bucket.website_bucket.id
  policy = data.aws_iam_policy_document.cloudfront_website_access.json
}
