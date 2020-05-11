terraform {
  backend "s3" {
    bucket = "terraform-covid19-beacon"
    key = "terraform.tfstate"
    region = "ap-southeast-2"
    dynamodb_table = "terraform-state-locks"
  }
}
