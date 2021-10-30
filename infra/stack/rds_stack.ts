import {
  aws_ec2,
  aws_kms,
  aws_rds,
  aws_secretsmanager,
  aws_ssm,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { AuroraMysqlEngineVersion } from "aws-cdk-lib/lib/aws-rds";
import { Construct } from "constructs";

export class RDSStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    vpc: aws_ec2.Vpc,
    lambdasg: aws_ec2.SecurityGroup,
    bastionsg: aws_ec2.SecurityGroup,
    kmskey: aws_kms.Key,
    props?: StackProps
  ) {
    super(scope, id, props);

    const prj_name = this.node.tryGetContext("project_name");
    const env_name = this.node.tryGetContext("env");

    const db_creds = new aws_secretsmanager.Secret(this, "db-secret", {
      secretName: `${env_name}/rds-secret`,
      generateSecretString: {
        includeSpace: false,
        passwordLength: 12,
        generateStringKey: "password",
        excludePunctuation: true,
        secretStringTemplate: JSON.stringify({
          username: "admin",
        }),
      },
    });

    const db_mysql = new aws_rds.DatabaseCluster(this, "mysql", {
      defaultDatabaseName: `${prj_name}${env_name}`,
      engine: aws_rds.DatabaseClusterEngine.auroraMysql({
        version: AuroraMysqlEngineVersion.VER_5_7_12,
      }),
      credentials: {
        username: "admin",
        password: db_creds.secretValueFromJson("password"),
      },
      instanceProps: {
        vpc,
        vpcSubnets: { subnetType: aws_ec2.SubnetType.PRIVATE_ISOLATED },
        instanceType: aws_ec2.InstanceType.of(
          aws_ec2.InstanceClass.T3,
          aws_ec2.InstanceSize.SMALL
        ),
      },
      instances: 1,
      storageEncryptionKey: kmskey,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    db_mysql.connections.allowDefaultPortFrom(
      lambdasg,
      "Access from Lambda functions"
    );
    db_mysql.connections.allowDefaultPortFrom(
      bastionsg,
      "Access from bastion host"
    );

    new aws_ssm.StringParameter(this, "db-host", {
      parameterName: `/${env_name}/db-host`,
      stringValue: db_mysql.clusterEndpoint.hostname,
    });
  }
}
