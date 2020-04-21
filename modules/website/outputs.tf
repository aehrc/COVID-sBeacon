output cloudfront_domain_name {
    value = "https://${aws_cloudfront_distribution.platform_distribution.domain_name}"
    description = "URL for website hosted by cloudfront."
}
