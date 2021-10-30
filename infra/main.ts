import * as cdk from "aws-cdk-lib";

import { KMSStack } from "./stack/kms_stack";
import { BastionStack } from "./stack/bastion_stack";
import { SecurityStack } from "./stack/security_stack";
import { VPCStack } from "./stack/vpc_stack";
import { S3Stack } from "./stack/s3_stack";

const app = new cdk.App();

const vpcStack = new VPCStack(app, "VPCStack");
const securityStack = new SecurityStack(app, "SecurityStack", vpcStack.vpc);
const bastionStack = new BastionStack(
  app,
  "BastionStack",
  vpcStack.vpc,
  securityStack.bastionsg
);
const kmsStack = new KMSStack(app, "KMSStack");
new S3Stack(app, "S3Stack");
