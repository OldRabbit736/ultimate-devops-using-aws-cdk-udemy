import {
  aws_lambda_nodejs,
  aws_apigateway,
  aws_ssm,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/lib/aws-lambda";
import { Construct } from "constructs";

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const prj_name = this.node.tryGetContext("project_name");
    const env_name = this.node.tryGetContext("env");

    const lambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      "HelloWorldFunction",
      {
        runtime: Runtime.NODEJS_14_X,
        handler: "handler",
        entry: "./lambda/hello.ts",
      }
    );

    new aws_apigateway.LambdaRestApi(this, "helloworld", {
      handler: lambda,
      restApiName: "mylambdaapi",
    });
  }
}
