import { aws_ec2, Stack, StackProps, aws_ssm } from "aws-cdk-lib";
import { Construct } from "constructs";

export class VPCStack extends Stack {
  public vpc: aws_ec2.Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const prj_name = this.node.tryGetContext("project_name");
    const env_name = this.node.tryGetContext("env");

    this.vpc = new aws_ec2.Vpc(this, "devVPC", {
      cidr: "172.32.0.0/16",
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: "Public",
          subnetType: aws_ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "Private",
          subnetType: aws_ec2.SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24,
        },
        {
          name: "Isolated",
          subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
      natGateways: 1,
    });

    this.vpc.privateSubnets
      .map((subnet) => subnet.subnetId)
      .forEach((id, index) => {
        const name = `private-subnet-${index + 1}`;
        new aws_ssm.StringParameter(this, name, {
          stringValue: id,
          parameterName: `/${env_name}/${name}`,
        });
      });
  }
}
