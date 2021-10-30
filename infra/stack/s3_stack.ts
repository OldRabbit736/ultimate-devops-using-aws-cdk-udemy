import {
  Stack,
  StackProps,
  aws_s3,
  RemovalPolicy,
  Aws,
  aws_ssm,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class S3Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const prj_name = this.node.tryGetContext("project_name");
    const env_name = this.node.tryGetContext("env");

    const lambda_bucket = new aws_s3.Bucket(this, "lambda-bucket", {
      accessControl: aws_s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      encryption: aws_s3.BucketEncryption.S3_MANAGED,
      bucketName: `${Aws.ACCOUNT_ID}-${env_name}-lambda-deploy-packages`,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new aws_ssm.StringParameter(this, "ssm-lambda-bucket", {
      parameterName: `/${env_name}/lambda-s3-bucket`,
      stringValue: lambda_bucket.bucketName,
    });
  }
}
