import * as cdk from "aws-cdk-lib";

import { SecurityStack } from "./stack/security_stack";
import { VPCStack } from "./stack/vpc_stack";

const app = new cdk.App();

const vpcStack = new VPCStack(app, "VPCStack");
new SecurityStack(app, "SecurityStack", vpcStack.vpc);
