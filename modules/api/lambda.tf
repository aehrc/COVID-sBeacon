#
# submitDataset Lambda Function
#
resource aws_lambda_permission APISubmitDataset {
  statement_id = "AllowAPISubmitDatasetInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-submitDataset.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.BeaconApi.execution_arn}/*/*/${aws_api_gateway_resource.submit.path_part}"
}

#
# summariseDataset Lambda Function
#
resource aws_lambda_permission SNSSummariseDataset {
  statement_id = "AllowSNSSummariseDatasetInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-summariseDataset.function_name
  principal = "sns.amazonaws.com"
  source_arn = aws_sns_topic.summariseDataset.arn
}

#
# summariseSampleMetadata Lambda Function
#
resource aws_lambda_permission SNSSummariseSampleMetadata {
  statement_id = "AllowSNSSummariseSampleMetadataInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-summariseSampleMetadata.function_name
  principal = "sns.amazonaws.com"
  source_arn = aws_sns_topic.summariseSampleMetadata.arn
}

#
# summariseVcf Lambda Function
#
resource aws_lambda_permission SNSSummariseVcf {
  statement_id = "AllowSNSSummariseVcfInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-summariseVcf.function_name
  principal = "sns.amazonaws.com"
  source_arn = aws_sns_topic.summariseVcf.arn
}

#
# summariseSlice Lambda Function
#
resource aws_lambda_permission SNSSummariseSlice {
  statement_id = "AllowSNSSummariseSliceInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-summariseSlice.function_name
  principal = "sns.amazonaws.com"
  source_arn = aws_sns_topic.summariseSlice.arn
}

#
# flushCache Lambda Function
#
resource aws_lambda_permission SNSFlushCache {
  statement_id = "AllowSNSFlushCacheInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-flushCache.function_name
  principal = "sns.amazonaws.com"
  source_arn = aws_sns_topic.flushCache.arn
}

#
# getInfo Lambda Function
#
resource aws_lambda_permission APIGetInfo {
  statement_id = "AllowAPIGetInfoInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-getInfo.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.BeaconApi.execution_arn}/*/*/"
}

#
# queryDatasets Lambda Function
#
resource aws_lambda_permission APIQueryDatasets {
  statement_id = "AllowAPIQueryDatasetsInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-queryDatasets.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.BeaconApi.execution_arn}/*/*/${aws_api_gateway_resource.query.path_part}"
}

#
# collateQueries Lambda Function
#
resource aws_lambda_permission QueryDatasetsLambdaCollateQueries {
  statement_id = "AllowQueryDatasetsLambdaCollateQueriesInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-collateQueries.function_name
  principal = "lambda.amazonaws.com"
  source_arn = module.lambda-queryDatasets.function_arn
}

#
# splitQuery Lambda Function
#
resource aws_lambda_permission QueryDatasetsLambdaSplitQuery {
  statement_id = "AllowQueryDatasetsLambdaSplitQueryInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-splitQuery.function_name
  principal = "lambda.amazonaws.com"
  source_arn = module.lambda-collateQueries.function_arn
}

#
# performQuery Lambda Function
#
resource aws_lambda_permission SplitQueryLambdaPerformQuery {
  statement_id = "AllowSplitQueryLambdaPerformQueryInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-performQuery.function_name
  principal = "lambda.amazonaws.com"
  source_arn = module.lambda-splitQuery.function_arn
}

#
# getAnnotations Lambda Function
#
resource aws_lambda_permission CollateQueriesLambdaGetAnnotations {
  statement_id = "AllowCollateQueriesLambdaGetAnnotationsInvoke"
  action = "lambda:InvokeFunction"
  function_name = module.lambda-getAnnotations.function_name
  principal = "lambda.amazonaws.com"
  source_arn = module.lambda-collateQueries.function_arn
}
