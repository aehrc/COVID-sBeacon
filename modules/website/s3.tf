locals {
  config_file = "assets/config.json"
  config_file_content = "{\n \"apiBaseUrl\" : \"${var.beacon_api_url}\" \n \"login\" : ${var.login} }"
  content_types = {
    "css" = "text/css; charset=utf-8"
    "eot" = "application/vnd.ms-fontobject"
    "geojson" = "geojson/geojson; charset=utf-8"
    "gif" = "image/gif"
    "html" = "text/html; charset=utf-8"
    "ico" = "text/json; charset=utf-8"
    "json" = "text/html; charset=utf-8"
    "jpg" = "image/jpeg"
    "js" = "application/javascript"
    "map" = "application/javascript"
    "otf" = "font/otf"
    "png" = "image/png"
    "svg" = "image/svg"
    "ttf" = "font/ttf"
    "woff" = "font/woff"
  }
}

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

resource aws_s3_bucket_object website_config_file {
  bucket = aws_s3_bucket.website_bucket.id
  content_type = local.content_types[regex("[^.]*$", local.config_file)]
  key = local.config_file
  content = local.config_file_content
  etag = md5(local.config_file_content)
}

resource aws_s3_bucket_object website_files {
  for_each = fileset("${path.module}/beaconApp/dist/beaconApp", "**")
  bucket = aws_s3_bucket.website_bucket.id
  content_type = local.content_types[regex("[^.]*$", each.value)]
  key = each.value
  source = "${path.module}/beaconApp/dist/beaconApp/${each.value}"
  etag = filemd5("${path.module}/beaconApp/dist/beaconApp/${each.value}")
}

resource aws_s3_bucket_policy cloudfront_access {
  bucket = aws_s3_bucket.website_bucket.id
  policy = data.aws_iam_policy_document.cloudfront_website_access.json
}
