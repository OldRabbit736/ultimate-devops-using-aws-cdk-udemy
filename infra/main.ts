import { CognitoStack } from "./stack/cognito_stack";
import { RedisStack } from "./stack/redis_stack";
import { RDSStack } from "./stack/rds_stack";
import * as cdk from "aws-cdk-lib";

import { KMSStack } from "./stack/kms_stack";
import { BastionStack } from "./stack/bastion_stack";
import { SecurityStack } from "./stack/security_stack";
import { VPCStack } from "./stack/vpc_stack";
import { S3Stack } from "./stack/s3_stack";
import { APIGWStack } from "./stack/apigw_stack";
import { LambdaStack } from "./stack/lambda_stack";

const app = new cdk.App();

const vpcStack = new VPCStack(app, "VPCStack");
const securityStack = new SecurityStack(app, "SecurityStack", vpcStack.vpc);
const bastionStack = new BastionStack(
  app,
  "BastionStack",
  vpcStack.vpc,
  securityStack.bastion_sg
);
const kmsStack = new KMSStack(app, "KMSStack");
new S3Stack(app, "S3Stack");
new RDSStack(
  app,
  "RDSStack",
  vpcStack.vpc,
  securityStack.lambda_sg,
  securityStack.bastion_sg,
  kmsStack.kms_rds
);
new RedisStack(
  app,
  "RedisStack",
  vpcStack.vpc,
  securityStack.redis_sg
  // Fn.importValue("redis-sg-export") // explicit import
);
new CognitoStack(app, "CognitoStack");
new APIGWStack(app, "APIGWStack");
new LambdaStack(app, "LambdaStack");
