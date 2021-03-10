

#
# updateData Lambda Function
#
module "lambda-updateData" {
  source = "../lambda"

  function_name = "updateData"
  description = "Initiate a path command on s3 bucket file upload"
  handler = "lambda_function.lambda_handler"
  runtime = "python3.6"
  memory_size = 2048
  timeout = 88
  policy = {
    json = data.aws_iam_policy_document.lambda-updateData.json
  }
  source_path = "${path.module}/lambda/updateData"


  environment = {
    variables = {
      BEACON_URL = var.beacon_api_url
    }
  }
}
