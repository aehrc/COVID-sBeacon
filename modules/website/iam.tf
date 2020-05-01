data aws_iam_policy_document cloudfront_website_access {
  statement {
    actions = [
      "s3:GetObject",
    ]
    resources = [
      "${aws_s3_bucket.website_bucket.arn}/*",
    ]
    principals {
      type = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
    }
  }

  statement {
    actions = [
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.website_bucket.arn,
    ]
    principals {
      type = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
    }
  }
}

data aws_iam_policy_document lambda_refreshCloudfront {
  statement {
    actions = [
      "cloudfront:CreateInvalidation",
    ]
    resources = [
      "*"
    ]
  }
}
