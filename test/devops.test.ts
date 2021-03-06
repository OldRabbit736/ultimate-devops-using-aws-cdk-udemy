import * as cdk from "aws-cdk-lib";
import * as Devops from "../infra/stack/devops-stack";

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Devops.DevopsStack(app, "MyTestStack");
  // THEN
  const actual = app.synth().getStackArtifact(stack.artifactId).template;
  expect(actual.Resources ?? {}).toEqual({});
});
