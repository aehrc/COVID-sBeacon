#
# Generic policy documents
#
data aws_iam_policy_document main-apigateway {
  statement {
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
  }
}

#
# submitDataset Lambda Function
#
data aws_iam_policy_document lambda-submitDataset {
  statement {
    actions = [
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
    ]
    resources = [
      aws_dynamodb_table.datasets.arn,
    ]
  }

  statement {
    actions = [
      "SNS:Publish",
    ]
    resources = [
      aws_sns_topic.flushCache.arn,
      aws_sns_topic.summariseDataset.arn,
    ]
  }

  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = ["*"]
  }
}

#
#
# summariseDataset Lambda Function
#
data aws_iam_policy_document lambda-summariseDataset {
  statement {
    actions = [
      "dynamodb:UpdateItem",
      "dynamodb:Query",
    ]
    resources = [
      aws_dynamodb_table.datasets.arn,
    ]
  }

  statement {
    actions = [
      "dynamodb:BatchGetItem",
    ]
    resources = [
      aws_dynamodb_table.vcf_summaries.arn,
    ]
  }

  statement {
    actions = [
      "SNS:Publish",
    ]
    resources = [
      aws_sns_topic.summariseVcf.arn,
      aws_sns_topic.summariseSampleMetadata.arn,
    ]
  }

  statement {
    actions = [
      "s3:GetObject",
    ]
    resources = ["*"]
  }
}

#
# summariseVcf Lambda Function
#
data aws_iam_policy_document lambda-summariseVcf {
  statement {
    actions = [
      "dynamodb:UpdateItem",
    ]
    resources = [
      aws_dynamodb_table.vcf_summaries.arn,
    ]
  }

  statement {
    actions = [
      "SNS:Publish",
    ]
    resources = [
      aws_sns_topic.summariseSlice.arn,
    ]
  }

  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = ["*"]
  }
}

#
# summariseSlice Lambda Function
#
data aws_iam_policy_document lambda-summariseSlice {
  statement {
    actions = [
      "dynamodb:UpdateItem",
    ]
    resources = [
      aws_dynamodb_table.datasets.arn,
      aws_dynamodb_table.vcf_summaries.arn,
    ]
  }

  statement {
    actions = [
      "SNS:Publish",
    ]
    resources = [
      aws_sns_topic.summariseDataset.arn,
      aws_sns_topic.summariseSlice.arn,
    ]
  }

  statement {
    actions = [
      "dynamodb:Scan",
    ]
    resources = [
      aws_dynamodb_table.datasets.arn,
      "${aws_dynamodb_table.datasets.arn}/index/*",
    ]
  }

  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = ["*"]
  }
}

#
# flushCache Lambda Function
#
data aws_iam_policy_document lambda-flushCache {
  statement {
    actions = [
      "dynamodb:BatchWriteItem",
      "dynamodb:Scan",
    ]
    resources = [
      aws_dynamodb_table.cache.arn,
    ]
  }

  statement {
    actions = [
      "s3:DeleteObject",
    ]
    resources = [
      "${aws_s3_bucket.cache.arn}/*",
    ]
  }
}

#
# getInfo Lambda Function
#
data aws_iam_policy_document lambda-getInfo {
  statement {
    actions = [
      "dynamodb:Scan",
    ]
    resources = [
      aws_dynamodb_table.datasets.arn,
    ]
  }
}

#
# queryDatasets Lambda Function
#
data aws_iam_policy_document lambda-queryDatasets {
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",  # for presigning the url
    ]
    resources = [
      "${aws_s3_bucket.large_response_bucket.arn}/${module.lambda-queryDatasets.function_name}/*",
    ]
  }

  statement {
    actions = [
      "dynamodb:Query",
    ]
    resources = [
      "${aws_dynamodb_table.datasets.arn}/index/*",
    ]
  }

  statement {
    actions = [
      "lambda:InvokeFunction",
    ]
    resources = [
      module.lambda-collateQueries.function_arn,
    ]
  }

  statement {
    actions = [
      "dynamodb:GetItem",
    ]
    resources = [
      aws_dynamodb_table.cache.arn,
    ]
  }

  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = ["*"]
  }
}

#
# collateQueries Lambda Function
#
data aws_iam_policy_document lambda-collateQueries {
  statement {
    actions = [
      "lambda:InvokeFunction",
    ]
    resources = [
      module.lambda-getAnnotations.function_arn,
      module.lambda-performQuery.function_arn,
    ]
  }

  statement {
    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
    ]
    resources = [
      aws_dynamodb_table.cache.arn,
    ]
  }

  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
    ]
    resources = [
      "${aws_s3_bucket.cache.arn}/*",
    ]
  }

  statement {
    actions = [
      "s3:GetObject",
    ]
    resources = [
      "${aws_s3_bucket.dataset_artifacts.arn}/*",
    ]
  }
}

#
# performQuery Lambda Function
#
data aws_iam_policy_document lambda-performQuery {
  statement {
    actions = [
      "lambda:InvokeFunction",
    ]
    resources = [
      module.lambda-performQuery.function_arn,
    ]
  }

  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
    ]
    resources = [
      "${aws_s3_bucket.cache.arn}/*",
    ]
  }

  statement {
    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
    ]
    resources = [
      aws_dynamodb_table.cache.arn,
    ]
  }

  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = ["*"]
  }
}

#
# strepifunQuery Lambda Function
#
data aws_iam_policy_document lambda-strepifunQuery {
  statement {
    actions = [
      "lambda:InvokeFunction",
    ]
    resources = [
      module.lambda-strepifunQuery.function_arn,
    ]
  }

  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
    ]
    resources = [
      "${aws_s3_bucket.cache.arn}/*",
    ]
  }

  statement {
    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
    ]
    resources = [
      aws_dynamodb_table.cache.arn,
    ]
  }

  statement {
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = ["*"]
  }
}

#
# summariseSampleMetadata Lambda Function
#
data aws_iam_policy_document lambda-summariseSampleMetadata {
  statement {
    actions = [
      "s3:PutObject",
    ]
    resources = [
      "${aws_s3_bucket.dataset_artifacts.arn}/*",
    ]
  }

  statement {
    actions = [
      "s3:GetObject",
    ]
    resources = ["*"]
  }
}

#
# getAnnotations Lambda Function
#
data aws_iam_policy_document lambda-getAnnotations {
  statement {
    actions = [
      "s3:PutObject",
    ]
    resources = [
      "${aws_s3_bucket.cache.arn}/*",
    ]
  }

  statement {
    actions = [
      "dynamodb:PutItem",
    ]
    resources = [
      aws_dynamodb_table.cache.arn,
    ]
  }

  statement {
    actions = [
      "s3:GetObject",
    ]
    resources = ["*"]
  }
}




#
# API: / GET
#
resource aws_iam_role api-root-get {
  name = "apiRootGetRole"
  assume_role_policy = data.aws_iam_policy_document.main-apigateway.json
  tags = var.common-tags
}

resource aws_iam_role_policy_attachment api-root-get {
  role = aws_iam_role.api-root-get.name
  policy_arn = aws_iam_policy.api-root-get.arn
}

resource aws_iam_policy api-root-get {
  name_prefix = "api-root-get"
  policy = data.aws_iam_policy_document.api-root-get.json
}

data aws_iam_policy_document api-root-get {
  statement {
    actions = [
      "dynamodb:Scan",
    ]
    resources = [
      aws_dynamodb_table.datasets.arn,
    ]
  }
}
