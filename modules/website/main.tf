terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.31.0"
      configuration_aliases = [
        aws.useast1
      ]
    }
  }
}

module lambda_cloudfrontEdgeSecurity {
  source = "../lambda"

  function_name = "cloudfrontEdgeSecurity"
  description = "Adds security headers to cloudfront requests."
  memory_size = 128
  runtime = "python3.8"
  timeout = 2
  source_path = "${path.module}/lambda/cloudfrontEdgeSecurity/source"
  handler = "function.lambda_handler"
  lambda_at_edge = true

  providers = {
    aws = aws.useast1
  }
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
