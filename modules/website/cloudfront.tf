resource aws_cloudfront_origin_access_identity oai {
}

resource aws_cloudfront_distribution platform_distribution {

  aliases = var.production == true ? [
    var.domain_name,
    "www.${var.domain_name}",
  ] : []

  origin {
    domain_name = aws_s3_bucket.website_bucket.bucket_regional_domain_name
    origin_id = aws_s3_bucket.website_bucket.id

    custom_header {
      name = "API_URL"
      value = var.beacon_api_url
    }

    custom_header {
      name = "LARGE_RESPONSE_DOMAIN"
      value = var.response_bucket_domain
    }

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled = true
  is_ipv6_enabled = true

  default_root_object = "index.html"

  web_acl_id = aws_cloudformation_stack.website_waf_acl.outputs["WebAclArn"]

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.website_bucket.id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    lambda_function_association {
      event_type = "origin-response"
      lambda_arn = module.lambda_cloudfrontEdgeSecurity.function_qualified_arn
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl = 0
    default_ttl = var.production == true ? 86400 : 0
    max_ttl = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  custom_error_response {
    error_code = 404
    response_code = 200
    response_page_path = "/index.html"
  }

  viewer_certificate {
    cloudfront_default_certificate = var.production == true ? false : true
    acm_certificate_arn = var.production == true ? data.aws_acm_certificate.cert[0].arn : ""
    minimum_protocol_version = var.production == true ? "TLSv1.2_2018" : "TLSv1"
    ssl_support_method = "sni-only"
  }
}
