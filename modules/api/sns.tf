resource aws_sns_topic summariseDataset {
  name = "summariseDataset"
}

resource aws_sns_topic_subscription summariseDataset {
  topic_arn = aws_sns_topic.summariseDataset.arn
  protocol = "lambda"
  endpoint = module.lambda-summariseDataset.function_arn
}

resource aws_sns_topic summariseSampleMetadata {
  name = "summariseSampleMetadata"
}

resource aws_sns_topic_subscription summariseSampleMetadata {
  topic_arn = aws_sns_topic.summariseSampleMetadata.arn
  protocol  = "lambda"
  endpoint  = module.lambda-summariseSampleMetadata.function_arn
}

resource aws_sns_topic summariseVcf {
  name = "summariseVcf"
}

resource aws_sns_topic_subscription summariseVcf {
  topic_arn = aws_sns_topic.summariseVcf.arn
  protocol  = "lambda"
  endpoint  = module.lambda-summariseVcf.function_arn
}

resource aws_sns_topic summariseSlice {
  name = "summariseSlice"
}

resource aws_sns_topic_subscription summariseSlice {
  topic_arn = aws_sns_topic.summariseSlice.arn
  protocol = "lambda"
  endpoint = module.lambda-summariseSlice.function_arn
}

resource aws_sns_topic flushCache {
  name = "flushCache"
}

resource aws_sns_topic_subscription flushCache {
  topic_arn = aws_sns_topic.flushCache.arn
  protocol = "lambda"
  endpoint = module.lambda-flushCache.function_arn
}
