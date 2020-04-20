resource aws_cloudformation_stack api_waf_acl {
  name = "ApiWafAcl"
  template_body = file("${path.module}/waf_cf.yaml")
  on_failure = "DELETE"

  parameters = {
    //noinspection HILUnresolvedReference
    "resourceArn" = "${aws_api_gateway_rest_api.BeaconApi.arn}/stages/${local.stage_name}"
    "maxRequestsPerFiveMinutes" = var.max_api_requests_per_ip_in_five_minutes
  }

  depends_on = [aws_api_gateway_deployment.BeaconApi]
}
