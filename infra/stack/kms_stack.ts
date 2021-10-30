import { Stack, StackProps, aws_kms, aws_ssm } from "aws-cdk-lib";
import { Construct } from "constructs";

export class KMSStack extends Stack {
  public kms_rds: aws_kms.Key;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const prj_name = this.node.tryGetContext("project_name");
    const env_name = this.node.tryGetContext("env");

    this.kms_rds = new aws_kms.Key(this, "rdskey", {
      description: `${prj_name}-key-rds`,
      enableKeyRotation: true,
    });
    this.kms_rds.addAlias(`alias/${prj_name}-key-rds`);

    new aws_ssm.StringParameter(this, "rdskey-param", {
      stringValue: this.kms_rds.keyId,
      parameterName: `/${env_name}/rds-kms-key`,
    });
  }
}
