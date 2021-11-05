import {
  aws_codepipeline,
  aws_codepipeline_actions,
  aws_codebuild,
  aws_cognito,
  aws_ssm,
  aws_secretsmanager,
  RemovalPolicy,
  Stack,
  StackProps,
  aws_s3,
  Aws,
  SecretValue,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class CodePipelineBackendStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    artifactBucketName: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    const prj_name = this.node.tryGetContext("project_name");
    const env_name = this.node.tryGetContext("env");

    const artifact_bucket = aws_s3.Bucket.fromBucketName(
      this,
      "artifactbucket",
      artifactBucketName
    );

    const github_token = SecretValue.secretsManager(
      `${env_name}/github-token`,
      {
        jsonField: "github-token",
      }
    );

    const pipeline = new aws_codepipeline.Pipeline(this, "backend-pipeline", {
      pipelineName: `${env_name}-${prj_name}-backend-pipeline`,
      artifactBucket: artifact_bucket,
      restartExecutionOnUpdate: false,
    });

    const sourceOutput = new aws_codepipeline.Artifact("source");
    const buildOutput = new aws_codepipeline.Artifact("build");

    pipeline.addStage({
      stageName: "Source",
      actions: [
        new aws_codepipeline_actions.GitHubSourceAction({
          oauthToken: github_token,
          output: sourceOutput,
          repo: "devops",
          branch: "main",
          owner: "oldrabbit736",
          actionName: "GitHubSource",
        }),
      ],
    });
  }
}
