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
  default = false
}
