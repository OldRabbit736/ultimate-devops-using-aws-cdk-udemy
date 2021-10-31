import { Aws, aws_apigateway, aws_ssm, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class APIGWStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const prj_name = this.node.tryGetContext("project_name");
    const env_name = this.node.tryGetContext("env");

    // const account_id = Aws.ACCOUNT_ID;
    const region = Aws.REGION;

    const api_gateway = new aws_apigateway.RestApi(this, "restapi", {
      endpointTypes: [aws_apigateway.EndpointType.REGIONAL],
      restApiName: `${prj_name}-service`,
    });

    api_gateway.root.addMethod("ANY");

    new aws_ssm.StringParameter(this, "api-gw", {
      parameterName: `/${env_name}/api-gw-url`,
      stringValue: `https://${api_gateway.restApiId}.execute-api.${region}.amazonaws.com/`,
    });
    new aws_ssm.StringParameter(this, "api-gw-id", {
      parameterName: `/${env_name}/api-gw-id`,
      stringValue: `${api_gateway.restApiId}`,
    });
  }
}
