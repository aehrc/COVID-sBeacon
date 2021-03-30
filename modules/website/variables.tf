variable beacon_api_url {
  type = string
}

variable domain_name {
  description = "Domain name at which the website should be accessed. Does not include the https:// prefix."
}

variable max_web_requests_per_ip_in_five_minutes {
  type = number
  default = 300
}

variable production {
  type = bool
}

variable login {
  type = bool
  default = true
}

variable response_bucket_domain {
  type = string
  description = "Domain used to access responses that are too large to be served by the API gateway. Does not include the https:// prefix."
}
