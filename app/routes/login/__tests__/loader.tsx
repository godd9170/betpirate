import { loader } from "..";

describe("login loader", () => {
  it("should return a response", async () => {
    const response = await loader({
      request: new Request("http://app.com/path"),
      params: {},
      context: {},
    });

    expect(response).toBeInstanceOf(Response);
  });
});
