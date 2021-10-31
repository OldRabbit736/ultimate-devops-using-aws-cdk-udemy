import {
  Stack,
  StackProps,
  aws_kms,
  aws_ec2,
  aws_elasticache,
  aws_ssm,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class RedisStack extends Stack {
  public kms_rds: aws_kms.Key;

  constructor(
    scope: Construct,
    id: string,
    vpc: aws_ec2.Vpc,
    redissg: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    const prj_name = this.node.tryGetContext("project_name");
    const env_name = this.node.tryGetContext("env");

    const subnets = vpc.privateSubnets.map((subnet) => subnet.subnetId);

    const subnet_group = new aws_elasticache.CfnSubnetGroup(
      this,
      "redis-subnet-group",
      {
        subnetIds: subnets,
        description: "subnet group for redis",
      }
    );

    const redis_cluster = new aws_elasticache.CfnCacheCluster(this, "redis", {
      cacheNodeType: "cache.t2.small",
      engine: "redis",
      numCacheNodes: 1,
      clusterName: `${prj_name}-redis-${env_name}`,
      cacheSubnetGroupName: subnet_group.ref,
      vpcSecurityGroupIds: [redissg],
      autoMinorVersionUpgrade: true,
    });
    redis_cluster.addDependsOn(subnet_group); // subnet_group is created before redis_cluster is created

    new aws_ssm.StringParameter(this, "redis-endpoint", {
      parameterName: `/${env_name}/redis-endpoint`,
      stringValue: redis_cluster.attrRedisEndpointAddress,
    });

    new aws_ssm.StringParameter(this, "redis-port", {
      parameterName: `/${env_name}/redis-port`,
      stringValue: redis_cluster.attrRedisEndpointPort,
    });
  }
}
