data "aws_acm_certificate" "cert" {
  count = var.production == true ? 1 : 0
  provider = aws.useast1
  domain = var.domain_name
  most_recent = true
}
