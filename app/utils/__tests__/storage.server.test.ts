const setEnv = () => {
  process.env.S3_BUCKET_NAME = "test-bucket";
  process.env.S3_PUBLIC_BASE_URL = "https://cdn.example.com/";
  process.env.AWS_ACCESS_KEY_ID = "test-key";
  process.env.AWS_SECRET_ACCESS_KEY = "test-secret";
  process.env.AWS_REGION = "us-east-1";
  process.env.AWS_ENDPOINT_URL_S3 = "https://s3.amazonaws.com";
};

const loadStorage = async () => {
  jest.resetModules();
  setEnv();
  return await import("../storage.server");
};

describe("storage.server", () => {
  it("builds public urls from the configured base", async () => {
    const { getPublicUrl } = await loadStorage();
    expect(getPublicUrl("images/example.jpg")).toBe(
      "https://cdn.example.com/images/example.jpg",
    );
  });

  it("creates presigned upload urls with a public url", async () => {
    const { createPresignedUploadUrl } = await loadStorage();
    const result = await createPresignedUploadUrl({
      key: "images/example.jpg",
      contentType: "image/webp",
    });

    expect(result.publicUrl).toBe("https://cdn.example.com/images/example.jpg");
    expect(result.uploadUrl).toContain("X-Amz-Algorithm");
  });
});
