export const handler = async (event: any) => {
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: `Hello, CDK! You have hit ${event.path}`,
  };

  return JSON.stringify(response);
};
