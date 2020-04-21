output api_url {
  value = module.beacon_api.api_url
}

output website_url {
  value = module.beacon_website.cloudfront_domain_name
}
