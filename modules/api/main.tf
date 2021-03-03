data "aws_region" "current" {}

locals {
  api_version = "v1.0.0"
  cache_days = 1
  cache_expiry_key = "expires"
  cache_key = "cacheString"
  cache_loc = "s3Location"
  sample_metadata_suffix = "sample_metadata.json"
}

locals {
  cache_env_vars = {
    CACHE_DAYS = local.cache_days
    CACHE_EXPIRY_KEY = local.cache_expiry_key
    CACHE_KEY = local.cache_key
    CACHE_LOC = local.cache_loc
    CACHE_BUCKET = aws_s3_bucket.cache.bucket
    CACHE_TABLE = aws_dynamodb_table.cache.name
  }
}

#
# submitDataset Lambda Function
#
module lambda-submitDataset {
  source = "../lambda"

  function_name = "submitDataset"
  description = "Creates or updates a dataset and triggers summariseVcf."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.6"
  memory_size = 2048
  timeout = 29
  policy = {
    json = data.aws_iam_policy_document.lambda-submitDataset.json
  }
  source_path = "${path.module}/lambda/submitDataset"
  tags = var.common-tags

  environment = {
    variables = {
      DATASETS_TABLE = aws_dynamodb_table.datasets.name
      FLUSH_CACHE_SNS_TOPIC_ARN = aws_sns_topic.flushCache.arn
      SUMMARISE_DATASET_SNS_TOPIC_ARN = aws_sns_topic.summariseDataset.arn
    }
  }
}

#
# summariseDataset Lambda Function
#
module "lambda-summariseDataset" {
  source = "../lambda"

  function_name = "summariseDataset"
  description = "Calculates summary counts for a dataset."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.6"
  memory_size = 2048
  timeout = 10
  policy = {
    json = data.aws_iam_policy_document.lambda-summariseDataset.json
  }
  source_path = "${path.module}/lambda/summariseDataset"
  tags = var.common-tags

  environment = {
    variables = {
      DATASETS_TABLE = aws_dynamodb_table.datasets.name
      SUMMARISE_SAMPLE_METADATA_SNS_TOPIC_ARN = aws_sns_topic.summariseSampleMetadata.arn
      SUMMARISE_VCF_SNS_TOPIC_ARN = aws_sns_topic.summariseVcf.arn
      VCF_SUMMARIES_TABLE = aws_dynamodb_table.vcf_summaries.name
    }
  }
}

#
# summariseVcf Lambda Function
#
module "lambda-summariseVcf" {
  source = "../lambda"

  function_name = "summariseVcf"
  description = "Calculates information in a vcf and saves it in datasets dynamoDB."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.6"
  memory_size = 2048
  timeout = 60
  policy = {
    json = data.aws_iam_policy_document.lambda-summariseVcf.json
  }
  source_path = "${path.module}/lambda/summariseVcf"
  tags = var.common-tags

  environment = {
    variables = {
      SUMMARISE_SLICE_SNS_TOPIC_ARN = aws_sns_topic.summariseSlice.arn
      VCF_SUMMARIES_TABLE = aws_dynamodb_table.vcf_summaries.name
    }
  }
}

#
# summariseSlice Lambda Function
#
module "lambda-summariseSlice" {
  source = "../lambda"

  function_name = "summariseSlice"
  description = "Counts calls and variants in region of a vcf."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.6"
  memory_size = 2048
  timeout = 210
  policy = {
    json = data.aws_iam_policy_document.lambda-summariseSlice.json
  }
  source_path = "${path.module}/lambda/summariseSlice"
  tags = var.common-tags

  environment = {
    variables = {
      ASSEMBLY_GSI = [for gsi in aws_dynamodb_table.datasets.global_secondary_index : gsi.name][0]
      DATASETS_TABLE = aws_dynamodb_table.datasets.name
      SUMMARISE_DATASET_SNS_TOPIC_ARN = aws_sns_topic.summariseDataset.arn
      SUMMARISE_SLICE_SNS_TOPIC_ARN = aws_sns_topic.summariseSlice.arn
      VCF_SUMMARIES_TABLE = aws_dynamodb_table.vcf_summaries.name
    }
  }
}

#
# flushCache Lambda Function
#
module "lambda-flushCache" {
  source = "../lambda"

  function_name = "flushCache"
  description = "Deletes cached responses for a dataset."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.8"
  memory_size = 128
  timeout = 60
  policy = {
    json = data.aws_iam_policy_document.lambda-flushCache.json
  }
  source_path = "${path.module}/lambda/flushCache"
  tags = var.common-tags

  environment = {
    variables = merge(
      {
        CACHE_KEY = local.cache_key
        CACHE_LOC = local.cache_loc
        CACHE_BUCKET = aws_s3_bucket.cache.bucket
        CACHE_TABLE = aws_dynamodb_table.cache.name
      }
    )
  }
}

#
# getInfo Lambda Function
#
module "lambda-getInfo" {
  source = "../lambda"

  function_name = "getInfo"
  description = "Returns basic information about the beacon and the datasets."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.6"
  memory_size = 2048
  timeout = 28
  policy = {
    json = data.aws_iam_policy_document.lambda-getInfo.json
  }
  source_path = "${path.module}/lambda/getInfo"
  tags = var.common-tags

  environment = {
    variables = {
      BEACON_API_VERSION = local.api_version
      BEACON_ID = var.beacon-id
      BEACON_NAME = var.beacon-name
      DATASETS_TABLE = aws_dynamodb_table.datasets.name
      ORGANISATION_ID = var.organisation-id
      ORGANISATION_NAME = var.organisation-name
    }
  }
}

#
# queryDatasets Lambda Function
#
module "lambda-queryDatasets" {
  source = "../lambda"

  function_name = "queryDatasets"
  description = "Invokes splitQuery for each dataset and returns result."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.6"
  memory_size = 2048
  timeout = 123
  policy = {
    json = data.aws_iam_policy_document.lambda-queryDatasets.json
  }
  source_path = "${path.module}/lambda/queryDatasets"
  tags = var.common-tags

  environment = {
    variables = merge(
    {
      BEACON_ID = var.beacon-id
      DATASETS_TABLE = aws_dynamodb_table.datasets.name
      RESPONSE_BUCKET = aws_s3_bucket.large_response_bucket.bucket
      COLLATE_QUERIES_LAMBDA = module.lambda-collateQueries.function_name
    },
    local.cache_env_vars,
    )
  }
}

#
# collateQueries Lambda Function
#
module "lambda-collateQueries" {
  source = "../lambda"

  function_name = "collateQueries"
  description = "Calls splitQuery for each component query, and assigns metadata."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.8"
  memory_size = 2048
  timeout = 122
  policy = {
    json = data.aws_iam_policy_document.lambda-collateQueries.json
  }
  source_path = "${path.module}/lambda/collateQueries"
  tags = var.common-tags

  environment = {
    variables = merge(
      {
        ARTIFACT_BUCKET = aws_s3_bucket.dataset_artifacts.bucket
        GET_ANNOTATIONS_LAMBDA = module.lambda-getAnnotations.function_name
        SAMPLE_METADATA_SUFFIX = local.sample_metadata_suffix
        SPLIT_QUERY_LAMBDA = module.lambda-splitQuery.function_name
      },
      local.cache_env_vars,
    )
  }
}


#
# splitQuery Lambda Function
#
module "lambda-splitQuery" {
  source = "../lambda"

  function_name = "splitQuery"
  description = "Splits a dataset into smaller slices of VCFs and invokes performQuery on each."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.6"
  memory_size = 2048
  timeout = 121
  policy = {
    json = data.aws_iam_policy_document.lambda-splitQuery.json
  }
  source_path = "${path.module}/lambda/splitQuery"
  tags = var.common-tags

  environment = {
    variables = merge(
      {
        PERFORM_QUERY_LAMBDA = module.lambda-performQuery.function_name
        SPLIT_SIZE = 1500
      },
      local.cache_env_vars,
    )
  }
}

#
# performQuery Lambda Function
#
module "lambda-performQuery" {
  source = "../lambda"

  function_name = "performQuery"
  description = "Queries a slice of a vcf for a specified variant."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.6"
  memory_size = 2048
  timeout = 121
  policy = {
    json = data.aws_iam_policy_document.lambda-performQuery.json
  }
  source_path = "${path.module}/lambda/performQuery"
  tags = var.common-tags

  environment = {
    variables = local.cache_env_vars
  }
}

#
# summariseSampleMetadata Lambda Function
#
module "lambda-summariseSampleMetadata" {
  source = "../lambda"

  function_name = "summariseSampleMetadata"
  description = "Summarises metadata of all samples in a dataset."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.8"
  memory_size = 2048
  timeout = 120
  policy = {
    json = data.aws_iam_policy_document.lambda-summariseSampleMetadata.json
  }
  source_path = "${path.module}/lambda/summariseSampleMetadata"
  tags = var.common-tags

  environment = {
    variables = {
      ARTIFACT_BUCKET = aws_s3_bucket.dataset_artifacts.bucket
      SAMPLE_FIELDS = join("&",
        [
          "SampleCollectionDate",
          "Location",
          "State",
          "Location_SampleCollectionDate",
          "State_SampleCollectionDate",
          "ID",
        ]
      )
      SAMPLE_METADATA_SUFFIX = local.sample_metadata_suffix
    }
  }
}

#
# getAnnotations Lambda Function
#
module "lambda-getAnnotations" {
  source = "../lambda"

  function_name = "getAnnotations"
  description = "Collects desired annotation fields of all variants in a dataset."
  handler = "lambda_function.lambda_handler"
  runtime = "python3.8"
  memory_size = 2048
  timeout = 27
  policy = {
    json = data.aws_iam_policy_document.lambda-getAnnotations.json
  }
  source_path = "${path.module}/lambda/getAnnotations"
  tags = var.common-tags

  environment = {
    variables = local.cache_env_vars
  }
}
