import {
  aws_cognito,
  aws_ssm,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const prj_name = this.node.tryGetContext("project_name");
    const env_name = this.node.tryGetContext("env");

    const user_pool = new aws_cognito.UserPool(this, "userpool", {
      signInAliases: {
        email: true,
        phone: true,
        preferredUsername: true,
        username: true,
      },
      userPoolName: `${prj_name}-user-pool`,
      customAttributes: {
        param1: new aws_cognito.StringAttribute({
          mutable: true,
        }),
      },
      passwordPolicy: {
        minLength: 10,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
        requireUppercase: true,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const user_pool_client = new aws_cognito.UserPoolClient(
      this,
      "userpoolclient",
      {
        userPool: user_pool,
        userPoolClientName: `${env_name}-app-client`,
      }
    );

    const identity_pool = new aws_cognito.CfnIdentityPool(
      this,
      "identitypool",
      {
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: user_pool_client.userPoolClientId,
            providerName: user_pool.userPoolProviderName,
          },
        ],
        identityPoolName: `${prj_name}-identity-pool`,
      }
    );

    new aws_ssm.StringParameter(this, "app-client-id", {
      parameterName: `/${env_name}/cognito-app-client-id`,
      stringValue: user_pool_client.userPoolClientId,
    });
    new aws_ssm.StringParameter(this, "user-pool-id", {
      parameterName: `/${env_name}/cognito-user-pool-id`,
      stringValue: user_pool.userPoolId,
    });
    new aws_ssm.StringParameter(this, "identity-pool-id", {
      parameterName: `/${env_name}/cognito-identity-pool-id`,
      stringValue: identity_pool.ref,
    });
  }
}
