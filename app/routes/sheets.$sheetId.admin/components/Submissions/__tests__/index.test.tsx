/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Submissions from "../index";

// Mock Remix hooks
jest.mock("@remix-run/react", () => ({
  Form: ({
    children,
    ...props
  }: React.PropsWithChildren<{ method?: string; className?: string }>) => (
    <form {...props}>{children}</form>
  ),
  useNavigation: () => ({ state: "idle", location: undefined }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

// Mock the SubmissionRow component
jest.mock("../SubmissionRow", () => {
  return function MockSubmissionRow({
    submission,
  }: {
    submission: { id: string; sailor: { username: string } };
  }) {
    return (
      <tr data-testid={`row-${submission.id}`}>
        <td>{submission.sailor.username}</td>
      </tr>
    );
  };
});

const createSubmission = (
  id: string,
  overrides: Partial<{
    isPaid: boolean;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
  }> = {}
) => ({
  id,
  isPaid: overrides.isPaid ?? false,
  createdAt: "2024-01-15T10:30:00Z",
  sheetId: "sheet-1",
  sailor: {
    username: overrides.username ?? `user${id}`,
    firstName: overrides.firstName ?? `First${id}`,
    lastName: overrides.lastName ?? `Last${id}`,
    phone: overrides.phone ?? `+1555000${id.padStart(4, "0")}`,
  },
});

const createPagination = (
  overrides: Partial<{
    page: number;
    pageSize: number;
    total: number;
    paidCount: number;
    totalPages: number;
    search: string;
  }> = {}
) => ({
  page: overrides.page ?? 1,
  pageSize: overrides.pageSize ?? 25,
  total: overrides.total ?? 0,
  paidCount: overrides.paidCount ?? 0,
  totalPages: overrides.totalPages ?? 1,
  search: overrides.search ?? "",
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Submissions", () => {
  describe("stats display", () => {
    it("shows total submissions count", () => {
      const submissions = [createSubmission("1"), createSubmission("2")];
      const pagination = createPagination({ total: 2 });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      expect(screen.getByText("Total Submissions")).toBeInTheDocument();
      const totalLabel = screen.getByText("Total Submissions");
      const totalStat = totalLabel.closest(".stat");
      expect(totalStat?.querySelector(".stat-value")).toHaveTextContent("2");
    });

    it("shows paid/unpaid breakdown", () => {
      const submissions = [
        createSubmission("1", { isPaid: true }),
        createSubmission("2", { isPaid: true }),
        createSubmission("3", { isPaid: false }),
      ];
      const pagination = createPagination({ total: 3, paidCount: 2 });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      const paidLabels = screen.getAllByText("Paid");
      const paidStatTitle = paidLabels.find((el) =>
        el.classList.contains("stat-title")
      );
      expect(paidStatTitle).toBeInTheDocument();

      const unpaidLabel = screen.getByText("Unpaid");
      expect(unpaidLabel).toBeInTheDocument();

      const paidStat = paidStatTitle?.closest(".stat");
      expect(paidStat?.querySelector(".stat-value")).toHaveTextContent("2");

      const unpaidStat = unpaidLabel.closest(".stat");
      expect(unpaidStat?.querySelector(".stat-value")).toHaveTextContent("1");
    });
  });

  describe("search functionality", () => {
    it("renders search input", () => {
      const submissions = [createSubmission("1")];
      const pagination = createPagination({ total: 1 });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      const searchInput = screen.getByPlaceholderText(
        "Search by name, phone, or status..."
      );
      expect(searchInput).toBeInTheDocument();
    });

    it("shows clear button when search is active", () => {
      const submissions = [createSubmission("1", { username: "alice" })];
      const pagination = createPagination({ total: 1, search: "alice" });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton).toBeInTheDocument();
    });

    it("shows result count when search is active", () => {
      const submissions = [createSubmission("1", { username: "alice" })];
      const pagination = createPagination({ total: 1, search: "alice" });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      expect(
        screen.getByText(/Showing 1 result for "alice"/)
      ).toBeInTheDocument();
    });

    it("shows empty state when no results match", () => {
      const submissions: ReturnType<typeof createSubmission>[] = [];
      const pagination = createPagination({ total: 0, search: "xyz" });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      expect(
        screen.getByText("No submissions match your search.")
      ).toBeInTheDocument();
    });
  });

  describe("pagination", () => {
    it("shows pagination when items exceed page size", () => {
      const submissions = Array.from({ length: 25 }, (_, i) =>
        createSubmission(String(i + 1))
      );
      const pagination = createPagination({
        total: 30,
        pageSize: 25,
        totalPages: 2,
      });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      expect(screen.getByText("Showing 1-25 of 30")).toBeInTheDocument();
      expect(screen.getByLabelText("Next page")).toBeInTheDocument();
      expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    });

    it("does not show pagination controls when items fit on one page", () => {
      const submissions = Array.from({ length: 10 }, (_, i) =>
        createSubmission(String(i + 1))
      );
      const pagination = createPagination({
        total: 10,
        pageSize: 25,
        totalPages: 1,
      });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      expect(screen.queryByLabelText("Next page")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Previous page")).not.toBeInTheDocument();
    });

    it("disables previous button on first page", () => {
      const submissions = Array.from({ length: 25 }, (_, i) =>
        createSubmission(String(i + 1))
      );
      const pagination = createPagination({
        page: 1,
        total: 30,
        pageSize: 25,
        totalPages: 2,
      });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      const prevButton = screen.getByLabelText("Previous page");
      expect(prevButton).toHaveClass("btn-disabled");
    });

    it("disables next button on last page", () => {
      const submissions = Array.from({ length: 5 }, (_, i) =>
        createSubmission(String(i + 26))
      );
      const pagination = createPagination({
        page: 2,
        total: 30,
        pageSize: 25,
        totalPages: 2,
      });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      const nextButton = screen.getByLabelText("Next page");
      expect(nextButton).toHaveClass("btn-disabled");
    });

    it("shows correct range on second page", () => {
      const submissions = Array.from({ length: 5 }, (_, i) =>
        createSubmission(String(i + 26))
      );
      const pagination = createPagination({
        page: 2,
        total: 30,
        pageSize: 25,
        totalPages: 2,
      });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      expect(screen.getByText("Showing 26-30 of 30")).toBeInTheDocument();
    });

    it("highlights current page", () => {
      const submissions = Array.from({ length: 25 }, (_, i) =>
        createSubmission(String(i + 1))
      );
      const pagination = createPagination({
        page: 1,
        total: 50,
        pageSize: 25,
        totalPages: 2,
      });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      const page1Button = screen.getByLabelText("Page 1");
      expect(page1Button).toHaveClass("btn-active");
      expect(page1Button).toHaveAttribute("aria-current", "page");
    });
  });

  describe("empty states", () => {
    it("shows empty message when no submissions", () => {
      const pagination = createPagination({ total: 0 });
      renderWithRouter(<Submissions submissions={[]} pagination={pagination} />);

      expect(screen.getByText("No submissions yet.")).toBeInTheDocument();
    });
  });

  describe("items per page", () => {
    it("shows items per page selector", () => {
      const submissions = [createSubmission("1")];
      const pagination = createPagination({ total: 1, pageSize: 25 });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      const selector = screen.getByLabelText("Items per page");
      expect(selector).toBeInTheDocument();
      expect(selector).toHaveValue("25");
    });

    it("shows all page size options", () => {
      const submissions = [createSubmission("1")];
      const pagination = createPagination({ total: 1 });
      renderWithRouter(
        <Submissions submissions={submissions} pagination={pagination} />
      );

      const selector = screen.getByLabelText("Items per page");
      expect(selector.querySelectorAll("option")).toHaveLength(4);
      expect(screen.getByRole("option", { name: "10" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "25" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "50" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "100" })).toBeInTheDocument();
    });
  });
});
