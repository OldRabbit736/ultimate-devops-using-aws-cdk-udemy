import { aws_ec2, Stack, StackProps, aws_iam, aws_ssm } from "aws-cdk-lib";
import { Construct } from "constructs";

export class SecurityStack extends Stack {
  public bastion_sg: aws_ec2.SecurityGroup;
  public lambda_sg: aws_ec2.SecurityGroup;

  constructor(
    scope: Construct,
    id: string,
    vpc: aws_ec2.Vpc,
    props?: StackProps
  ) {
    super(scope, id, props);

    const prj_name = this.node.tryGetContext("project_name");
    const env_name = this.node.tryGetContext("env");

    this.lambda_sg = new aws_ec2.SecurityGroup(this, "lambdasg", {
      securityGroupName: "lambda-sg",
      vpc,
      description: "SG for lambda function",
      allowAllOutbound: true,
    });

    this.bastion_sg = new aws_ec2.SecurityGroup(this, "bastionsg", {
      securityGroupName: "bastion-sg",
      vpc,
      description: "SG for Bastion Host",
      allowAllOutbound: true,
    });

    this.bastion_sg.addIngressRule(
      aws_ec2.Peer.anyIpv4(),
      aws_ec2.Port.tcp(22),
      "SSH Access"
    );

    const lambda_role = new aws_iam.Role(this, "lambdarole", {
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "lambda-role",
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    lambda_role.addToPolicy(
      new aws_iam.PolicyStatement({
        actions: ["s3:*", "rds:*"],
        resources: ["*"],
      })
    );

    // SSM Parameters
    new aws_ssm.StringParameter(this, "lambdasg-params", {
      parameterName: `/${env_name}/lambda-sg`,
      stringValue: this.lambda_sg.securityGroupId,
    });
    new aws_ssm.StringParameter(this, "lambdarole-param-arn", {
      parameterName: `/${env_name}/lambda-role-arn`,
      stringValue: lambda_role.roleArn,
    });
    new aws_ssm.StringParameter(this, "lambdarole-param-name", {
      parameterName: `/${env_name}/lambda-role-name`,
      stringValue: lambda_role.roleName,
    });
  }
}
