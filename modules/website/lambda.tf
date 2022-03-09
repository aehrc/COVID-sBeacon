resource aws_lambda_permission s3_refreshCloudfront {
  statement_id = "AllowExecutionFromS3Bucket"
  action = "lambda:InvokeFunction"
  function_name = module.lambda_refreshCloudfront.function_name
  principal = "s3.amazonaws.com"
  source_arn = aws_s3_bucket.website_bucket.arn
}
