# COVID sBeacon

A serverless architecture for presenting SARS-CoV-2 genomes and population statistics for rapid querying.

## Requirements
Python

NodeJS

npm

Terraform

AWS

## Setting up
### Backend
Set the backend.tf file to your desired Terraform backend type. The current configuration is an example that uses S3 to
store the state and dynamodb to store the state lock, but other options are available (see
[https://www.terraform.io/docs/language/settings/backends/index.html](https://www.terraform.io/docs/language/settings/backends/index.html)
for more information).

### Variables
Ensure `terraform.tvars` has the correct settings. `beacon-id`, `beacon-name`, `organisation-id` and `organisation-name`
are only used in the return values for some API calls to the beacon, and are not particularly important if you are not
planning to link to a larger beacon network. `domain_name` is only important if you are using a custom domain, for which
you have a certificate that is loaded into AWS Certificate Manager. If and only if that is the case, `production` should
be set to `true`. `bucket-name` is used for automated updates to a dataset (configured separately) and should typically
be set to the s3 bucket that will contain the VCF gzip files.

### Building the infrastructure
Ensure suitable credentials are available to terraform (see
[https://registry.terraform.io/providers/hashicorp/aws/latest/docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
for more information), then run
```bash
terraform init
terraform apply
```
and confirm the changes are as expected.

### Adding a dataset
A dataset needs bgzipped and indexed (csi or tbi) VCF files, and each VCF file should have a sample metadata CSV, with
samples in the same order as the VCF. These VCFs should not contain many more than 10000 samples each, to enable rapid
querying, so a dataset may contain hundreds of individual VCFs. The CSV should contain at least the columns
`AccessionID` (e.g. EPI_ISL_123456), `RelatedID` (comma separated list of other accession numbers used for the same
sample), `SampleCollectionDate` (e.g. 2021-03-25), `Location` (e.g. Australia / New South Wales), and `OriginatingLab`
(freeform). These files should all have the same name, with only the suffix changing from .vcf.gz to .vcf.gz.csi/tbi to
.csv. In addition there should be an annotation TSV, with at least the columns `Variant` (e.g. A23403G, or
ATACATG21764A) and `SIFT_score` (e.g. 0.33). This can be referenced by multiple datasets. In both CSVs and TSVs, fields
can be left empty if the value is not known.

The output of `terraform apply` will include a field `api_url`, which has a `/submit` endpoint (which would then be
something like `https://8bgp0g24m2.execute-api.ap-southeast-2.amazonaws.com/prod/submit`). An authenticated POST request
should be made to this endpoint with the body in the following format:
```json
{
    "id": "dataset_name",
    "name": "Dataset Friendly Name",
    "vcfLocations": [
        "s3://bucket/prefix/file1.vcf.gz",
        "s3://bucket/prefix/file2.vcf.gz"
    ],
    "annotationLocation": "s3://bucket2/prefix2/variant_annotation_file.tsv",
    "assemblyId":"hCoV-19",
    "description" : "A friendly description of the dataset."
}
```
Often the simplest way of providing this is through the test functionality of AWS API Gateway, which then handles all
the authentication.

### Updating a dataset
Updating a dataset is required when the component VCFs or metadata files are changed. This is done through a PATCH
request to the `/submit` endpoint, with the same format as the POST request, including the `id` field and any fields
that need to be updated. The `vcfLocations` field is a single entity, so when it is used it must list all the files in
the dataset. For example, to add another file to the above dataset, the PATCH request would have the body:
```json
{
    "id": "dataset_name",
    "vcfLocations": [
        "s3://bucket/prefix/file1.vcf.gz",
        "s3://bucket/prefix/file2.vcf.gz",
        "s3://bucket3/prefix3/file3.vcf.gz"
    ],
}
```
If the files have changed, but their locations and number remain the  same, simply list them again to force any
associated artifacts to be rebuilt.

### Frontend
Building an authenticated or non-authenticated webpage is controlled via variables. When building an authenticated webpage additional OKTA specific variables must be created from OKTA admin console and then updated in the app.module.ts. This is a one time change allowing user management for this webpage via OKTA admin console. Default OKTA settings goes to default developer admin console which cannot be used for user management.

### Variables
Webpage needs access to beacon_api_url variable to make queries to backend and cloudfront url variable to re-route users to home after OKTA authentication. The production variable and login variable are by default set to true. If user wants to set-up a webpage without authentication setting the default value can be set to false in variables.tf within website module.

### Setting up authentication
Setting up authentication on this webpage is a simple three step process. Detailed documentation to interact with console and add new users can be found here - [Documentaion](https://developer.okta.com/docs/guides/quickstart/cli/create-org/)

#### Step 1 - OKTA sign-up
The admin of the website should sign-up to OKTA [here](https://developer.okta.com/signup/). These login details will be needed later to onboard new users to this webpage. User will activate the email after signin-up. Activation will take the user to the new okta url - If user signed-up with new email then they will need to set-up a paasword using "forget password". If user signed up using existing email then use the credentials to login to your admin OKTA console.

#### Step 2 - Hook OKTA authenticaiton variables to webpage
After logging to your admin console, use the side navigation bar to expand Applications drop-down and click on `Applications`. Click on `Create App Integration` on this page. In there we want to create OpenID connect service, select `OIDC - OpenID Connect`, select `Single-Page Application` as application type and click next.

On `New Single-Page App Integration` menu give your application a name, select `Authorization code and implicit` on grant type.  and add the cloudfront url followed by `/implicit/callback` to `Sign-in redirect URIs` field for example https://abcd.cloudfront.net//implicit/callback. Add cloudfront url to `Sign-out redirect URIs` and `Trusted Origins Base URIs`. Explore the Assignments settings based on requirements and click save.

After the above steps, Admin needs to update the OKTA authentication variables to `modules/website/beaconApp/src/app/app.module.ts`. Update line 60 with the new client ID just generated and visible on the applications page under general tab. Update Line 58 to new issuer url which can be found Under `Security` dropdown on the left navigation bar under API.

#### Step 3 - New users onboarding
With first two steps authenticated webpage is now ready to use but will only be accessible to admin via admin credentials. Perform a quick test with admin credentials. Once the authentication is working its now time to onboard new users. In the console navigate to `Directory` drop down in side navigation bar and click people. On the people page click `Add person` or `more actions` and select `import users from CSV` to import multiple users. On the Add person dialog box fill in the necessary details and select `Send user activation email now` and click save. This will trigger the end user an email to sign-up to your application and if the Assignments settings in step 2 was set to `all users` then they will have immediate access to your cloudfront webpage after signing-up. More detailed documentaion is available [here](https://help.okta.com/en/prod/Content/Topics/Apps/Apps_App_Integration_Wizard_OIDC.htm)

## Usage
Go to the website listed as `website_url` in the terraform output, and you should be able to search for individual
mutations, as well as strain profiles. The similarity search function allows for finding more common profiles that
contain a subset of the requested mutations, useful if the specific set of mutations being searched for doesn't have
many hits.

## Troubleshooting
#### Creating/updating a dataset says files are not accessible
Ensure the files are named correctly (`s3://bucket_name/vcf/with/optional/prefix.vcf.gz`, with associated .csi or .tbi
and .csv files), and that they are correctly formatted, bgzipped and indexed (using for example `bcftools index`). Check
that the account in which the architecture is built has access to the files.

#### Creating/Updating a dataset times out, or returns some other ambiguous error after 28 seconds
This likely means the submitDataset function has timed out, and is caused when there are many files in a dataset, such
that checking them all for validity takes longer than API Gateway's maximum timeout of 30 seconds. The work-around is to
increase the timeout for submitDataset to allow for all files to be checked, or to skip the checking, if you trust the
files to be present and correct. The former can be updated using `modules/api/main.tf` to increase the timeout, or the
checking can be skipped by including a field `skipCheck` (the value is not important) in the body of the request. If the
timeout is increased, the call to `/submit` will still timeout because of API Gateway, but the submitDataset lambda
function invocation can be inspected in CloudWatch to ensure it completed successfully and returned a `200` response.

#### Searching takes a long time, and I have to search multiple times to get a hit
This is because the data takes longer than API Gateway's maximum timeout (30s) to produce, especially for queries that
return a large number of samples. The result is cached when it finishes, so future queries that start after the first
one completes in the background (typically the third attempt) will return this cached result. Currently the only fix
for this for the user is to wait a few seconds after the query times out before trying again, to hopefully hit the
cached result on the second try.

In the backend this can often be fixed by increasing the number of concurrent lambda functions that are able to run.
This can first be done by increasing the account maximum concurrency, then by finding ways to increase the burst
capacity in the region or even increasing provisioned capacity for the offending functions (although this approach can
be expensive). Another approach can be to increase the memory allocated to the slow lambda function, although this has
diminishing returns past 1536MB.

#### Searching times out, and trying again even a few minutes later still leads to a timeout.
Check that the dynamoDB table VcfSummaries has the updated values for the VCFs. If it doesn't, the problem lies in the
submission pipeline. If the call to `/submit` was successful, this might indicate that the data files may be to large or
numerous for part of the pipeline. Check CloudWatch or the lambda console for the functions starting with "summarise"
(except summariseSampleMetadata, which is triggered later) to see if any hit their timeout or memory limits. Increasing
the timeout or memory allocation to the stressed functions can be configured in `modules/api/main.tf` and pushed using
`terraform apply`.

If the VCFs are updated in dynamoDB, check if any of the other functions (including
summariseSampleMetadata) have similarly hit their limits, and adjust if necessary. Note that increasing the timeout of
query functions will still lead to a timeout on the website for the initial search, but should allow future searches,
conducted after the backend function has completed, to succeed.
