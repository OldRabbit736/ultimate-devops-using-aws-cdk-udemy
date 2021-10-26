import { BastionStack } from "./stack/bastion_stack";
import * as cdk from "aws-cdk-lib";

import { SecurityStack } from "./stack/security_stack";
import { VPCStack } from "./stack/vpc_stack";

const app = new cdk.App();

const vpcStack = new VPCStack(app, "VPCStack");
const securityStack = new SecurityStack(app, "SecurityStack", vpcStack.vpc);
const bastionStack = new BastionStack(
  app,
  "BastionStack",
  vpcStack.vpc,
  securityStack.bastionsg
);
