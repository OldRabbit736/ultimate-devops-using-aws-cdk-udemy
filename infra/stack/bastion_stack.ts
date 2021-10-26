import { aws_ec2, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class BastionStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    vpc: aws_ec2.Vpc,
    sg: aws_ec2.SecurityGroup,
    props?: StackProps
  ) {
    super(scope, id, props);

    const bastionHost = new aws_ec2.Instance(this, "bastion-host", {
      instanceType: new aws_ec2.InstanceType("t2.micro"),
      machineImage: new aws_ec2.AmazonLinuxImage({
        edition: aws_ec2.AmazonLinuxEdition.STANDARD,
        virtualization: aws_ec2.AmazonLinuxVirt.HVM,
        storage: aws_ec2.AmazonLinuxStorage.GENERAL_PURPOSE,
      }),
      vpc: vpc,
      vpcSubnets: {
        subnetType: aws_ec2.SubnetType.PUBLIC,
      },
      securityGroup: sg,
      keyName: "devops",
    });
  }
}
