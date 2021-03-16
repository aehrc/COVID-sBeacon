terraform {
  backend "s3" {
    bucket = "terraform-pathsbeacon-prod"
    key = "terraform.tfstate"
    region = "ap-southeast-2"
    dynamodb_table = "terraform-state-locks"
  }
}
