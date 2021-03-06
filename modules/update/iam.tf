#
# updateData Lambda Function
#
data aws_iam_policy_document lambda-updateData {
  statement {
    effect  = "Allow"
    actions = [
      "execute-api:Invoke",
    ]
    resources = [
      "*",
    ]
  }
  statement {
    effect  = "Allow"
    actions = [
    "kms:Decrypt"
    ]
    resources = [
      "*"
    ]
  }
  statement {
    effect  = "Allow"
    actions = [
    "s3:ListBucket"
    ]
    resources = [
      local.bucket_arn
    ]
  }
}
