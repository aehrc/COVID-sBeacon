#
# updateData Lambda Function
#
resource aws_lambda_permission S3updateData {
  statement_id = "Allow3updateDataInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-updateData.function_name
  principal = "s3.amazonaws.com"
  source_arn = var.bucket-name
}
