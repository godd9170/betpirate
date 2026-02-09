import { Form, useNavigation, useSearchParams } from "@remix-run/react";
import { useRef, useEffect } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import SubmissionRow from "./SubmissionRow";

type Submission = {
  id: string;
  isPaid: boolean;
  createdAt: string;
  sheetId: string;
  sailor: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
  };
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  paidCount: number;
  totalPages: number;
  search: string;
};

type SubmissionsProps = {
  submissions: Submission[];
  pagination: Pagination;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function Submissions({
  submissions,
  pagination,
}: SubmissionsProps) {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { page, pageSize, total, paidCount, totalPages, search } = pagination;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + submissions.length, total);

  const isLoading = navigation.state === "loading";
  const isSearching =
    navigation.location?.search.includes("search=") ||
    navigation.location?.search.includes("page=");

  // Build URL with updated params
  const buildUrl = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || (key === "page" && value === 1)) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    return `?${params.toString()}`;
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const showPagination = total > pageSize;
  const unpaidCount = total - paidCount;

  // Keep focus on search input during navigation
  useEffect(() => {
    if (!isLoading && searchInputRef.current) {
      const input = searchInputRef.current;
      if (document.activeElement !== input && search) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  }, [isLoading, search]);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className={`card-body gap-6 ${isSearching ? "opacity-60" : ""}`}>
        {/* Stats Section */}
        <div className="stats stats-vertical bg-base-200 sm:stats-horizontal">
          <div className="stat">
            <div className="stat-title">Total Submissions</div>
            <div className="stat-value text-primary">{total}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Paid</div>
            <div className="stat-value text-success">
              {paidCount}
              <span className="text-base-content/50 text-lg font-normal">
                /{total}
              </span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Unpaid</div>
            <div className="stat-value text-warning">{unpaidCount}</div>
          </div>
        </div>

        {/* Search Bar */}
        <Form method="get" className="form-control">
          {/* Preserve pageSize in search form */}
          <input type="hidden" name="pageSize" value={pageSize} />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary z-10">
              <IoSearch size={20} />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              name="search"
              placeholder="Search by name, phone, or status..."
              className="input input-bordered w-full pl-10 pr-10"
              defaultValue={search}
              aria-label="Search submissions"
              onChange={(e) => {
                // Debounced submit on change
                const form = e.currentTarget.form;
                if (form) {
                  if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                  }
                  debounceRef.current = setTimeout(() => {
                    form.requestSubmit();
                  }, 300);
                }
              }}
            />
            {search && (
              <a
                href={buildUrl({ search: null, page: null })}
                className="btn btn-ghost btn-sm btn-circle absolute right-2 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <IoClose size={18} />
              </a>
            )}
          </div>
          {search && (
            <div className="mt-2 text-sm text-base-content/70">
              Showing {total} result{total !== 1 ? "s" : ""} for &quot;{search}
              &quot;
            </div>
          )}
        </Form>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="table table-zebra">
            <thead className="bg-base-200">
              <tr>
                <th className="font-semibold uppercase tracking-wide text-base-content/70">
                  Paid
                </th>
                <th className="font-semibold uppercase tracking-wide text-base-content/70">
                  Name
                </th>
                <th className="font-semibold uppercase tracking-wide text-base-content/70">
                  Created
                </th>
                <th className="font-semibold uppercase tracking-wide text-base-content/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <SubmissionRow key={submission.id} submission={submission} />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-base-content/50"
                  >
                    {search
                      ? "No submissions match your search."
                      : "No submissions yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/70">Show</span>
              <select
                className="select select-bordered select-sm"
                value={pageSize}
                onChange={(e) => {
                  window.location.href = buildUrl({
                    pageSize: e.target.value,
                    page: 1,
                  });
                }}
                aria-label="Items per page"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-base-content/70">per page</span>
            </div>

            {/* Page info */}
            <div className="text-sm text-base-content/70">
              Showing {startIndex + 1}-{endIndex} of {total}
            </div>

            {/* Page navigation */}
            <div className="join">
              <a
                href={page > 1 ? buildUrl({ page: page - 1 }) : undefined}
                className={`btn btn-sm join-item ${
                  page === 1 ? "btn-disabled" : ""
                }`}
                aria-label="Previous page"
                aria-disabled={page === 1}
              >
                &laquo;
              </a>
              {getPageNumbers().map((pageNum, index) =>
                pageNum === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="btn btn-sm join-item btn-disabled"
                  >
                    ...
                  </span>
                ) : (
                  <a
                    key={pageNum}
                    href={buildUrl({ page: pageNum as number })}
                    className={`btn btn-sm join-item ${
                      page === pageNum ? "btn-active" : ""
                    }`}
                    aria-label={`Page ${pageNum}`}
                    aria-current={page === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </a>
                ),
              )}
              <a
                href={
                  page < totalPages ? buildUrl({ page: page + 1 }) : undefined
                }
                className={`btn btn-sm join-item ${
                  page === totalPages ? "btn-disabled" : ""
                }`}
                aria-label="Next page"
                aria-disabled={page === totalPages}
              >
                &raquo;
              </a>
            </div>
          </div>
        )}

        {/* Show items per page selector even when pagination is not needed but there are items */}
        {!showPagination && total > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/70">Show</span>
              <select
                className="select select-bordered select-sm"
                value={pageSize}
                onChange={(e) => {
                  window.location.href = buildUrl({
                    pageSize: e.target.value,
                    page: 1,
                  });
                }}
                aria-label="Items per page"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-base-content/70">per page</span>
            </div>
            <div className="text-sm text-base-content/70">
              Showing {total} of {total}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
