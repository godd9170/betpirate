import { readLatestSheet } from "~/models/sheet.server";
import { loader } from "../route";

jest.mock("~/models/sheet.server", () => ({
  readLatestSheet: jest.fn(),
}));

describe("login loader", () => {
  it("should return a response", async () => {
    const mockReadLatestSheet = readLatestSheet as jest.MockedFunction<
      typeof readLatestSheet
    >;
    mockReadLatestSheet.mockResolvedValue(null);
    const response = await loader({
      request: new Request("http://app.com/path"),
      params: {},
      context: {},
    });

    expect(response).toBeInstanceOf(Response);
  });
});
