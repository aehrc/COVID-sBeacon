variable beacon-id {
  type = string
  description = "Unique identifier of the beacon. Use reverse domain name notation."
}

variable beacon-name {
  type = string
  description = "Human readable name of the beacon."
}

variable domain_name {
  description = "Domain name at which the website should be accessed. Does not include the https:// prefix."
}

variable max_api_requests_per_ip_in_five_minutes {
  type = number
  default = 300
}

variable max_website_requests_per_ip_in_five_minutes {
  type = number
  default = 300
}

variable organisation-id {
  type = string
  description = "Unique identifier of the organization providing the beacon."
}

variable organisation-name {
  type = string
  description = "Name of the organization providing the beacon."
}

variable assembly-contig-sizes {
  type = map(map(number))
  description = "A map of assemblies to maps of maximum contig sizes in nucleotides."
}

variable production {
  type = bool
  default = false
}

variable login {
  type = bool
  description = "Require login credentials to access the website."
  default = true
}

variable bucket-name{
  type = string
}

variable okta_domain {
  type = string
  description = "Base url okta uses for authentication. In the form 'example.okta.com'."
}

variable okta_client_id {
  type = string
}
