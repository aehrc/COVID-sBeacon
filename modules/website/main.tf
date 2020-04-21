provider aws {
    alias = "useast1"
}

module lambda_refreshCloudfront {
  source = "../lambda"

  function_name = "refreshCloudfront"
  description = "Refreshes Cloudfront when s3 object content changes."
  memory_size = 128
  runtime = "python3.8"
  timeout = 10
  source_path = "${path.module}/lambda/refreshCloudfront/source"
  handler = "function.lambda_handler"

  policy = {
    json = data.aws_iam_policy_document.lambda_refreshCloudfront.json
  }

  environment = {
    variables = {
      DISTRIBUTION_ID = aws_cloudfront_distribution.platform_distribution.id
    }
  }
}
