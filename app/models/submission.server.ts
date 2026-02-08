import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type Selection = {
  optionId: string;
};

type NewSubmission = {
  sheetId: string;
  sailorId: string;
  selections: Selection[];
  tieBreaker: number;
  nickname?: string;
};

type UpdateSubmission = {
  id: string;
  selections: Selection[];
  tieBreaker: number;
};

export type SubmissionWithPropositionSelections = Prisma.SubmissionGetPayload<{
  include: {
    sailor: true;
    selections: {
      include: {
        option: {
          include: {
            proposition: true;
          };
        };
      };
    };
  };
}>;

export type SelectionWithPropositionOption =
  Prisma.PropositionSelectionGetPayload<{
    include: {
      option: {
        include: {
          proposition: true;
        };
      };
    };
  }>;

export type SubmissionPreview = {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  nickname: string | null;
  sailor: {
    id: string;
    username: string | null;
    profilePictureUrl: string | null;
  };
};

// todo: use createMany when Postgres is used
// https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#createmany-1
export const createSubmission = async ({
  sheetId,
  sailorId,
  selections = [],
  tieBreaker,
  nickname,
}: NewSubmission) => {
  const existingCount = await db.submission.count({
    where: { sheetId, sailorId },
  });
  const resolvedNickname = nickname ?? `Submission ${existingCount + 1}`;

  return db.submission.create({
    data: {
      sheetId,
      sailorId,
      tieBreaker,
      nickname: resolvedNickname,
      selections: {
        create: selections,
      },
    },
    include: {
      sheet: true,
    },
  });
};

export const updateSubmission = ({
  id,
  selections = [],
  tieBreaker,
}: UpdateSubmission) => {
  return db.submission.update({
    where: { id },
    data: {
      tieBreaker,
      selections: {
        deleteMany: {},
        create: selections,
      },
    },
  });
};

export const deleteSubmission = (id: string) => {
  return db.submission.delete({
    where: { id },
  });
};

export const readSubmission = (id: string) => {
  return db.submission.findUnique({
    where: { id },
    include: {
      sheet: true,
      sailor: true,
      selections: {
        orderBy: {
          option: {
            proposition: {
              order: "asc",
            },
          },
        },
        include: {
          option: {
            include: {
              proposition: true,
            },
          },
        },
      },
    },
  });
};

export const readSheetSubmission = (sheetId: string, sailorId: string) => {
  return db.submission.findFirst({
    where: { sheetId, sailorId },
    include: {
      sailor: true,
      selections: {
        include: {
          option: {
            include: {
              proposition: true,
            },
          },
        },
      },
    },
  });
};

export const readSheetSailorSubmissions = (
  sheetId: string,
  sailorId: string
) => {
  return db.submission.findMany({
    where: { sheetId, sailorId },
    include: {
      sailor: true,
      selections: {
        orderBy: {
          option: {
            proposition: {
              order: "asc",
            },
          },
        },
        include: {
          option: {
            include: {
              proposition: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const readSheetSubmissions = (sheetId: string) => {
  return db.submission.findMany({
    where: { sheetId },
    include: {
      sailor: true,
      selections: {
        include: {
          option: {
            include: {
              proposition: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
};

export const readSheetSubmissionsPreview = (
  sheetId: string,
): Promise<SubmissionPreview[]> => {
  return db.submission.findMany({
    where: { sheetId },
    select: {
      id: true,
      createdAt: true,
      isPaid: true,
      nickname: true,
      sailor: {
        select: {
          id: true,
          username: true,
          profilePictureUrl: true,
        },
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
};

export const readSheetSubmissionRanking = async (
  sheetId: string,
  submissionId: string,
) => {
  let result: { correctCount: number; tieCount: number; rank: number }[] =
    (await db.$queryRaw`
  WITH SubmissionScores AS (
    SELECT 
        s.id AS "submissionId",
        CAST(COUNT(ps.id) AS INT) AS "correctCount"
    FROM "Submission" s
    LEFT JOIN "PropositionSelection" ps ON ps."submissionId" = s.id
    LEFT JOIN "PropositionOption" po ON po.id = ps."optionId"
    LEFT JOIN "Proposition" p ON p.id = po."propositionId"
    WHERE (p."answerId" = ps."optionId" OR ps."optionId" IS NULL)
    AND s."sheetId" = ${sheetId}
    GROUP BY s.id
  ),
  RankedSubmissions AS (
    SELECT 
        "submissionId",
        "correctCount",
        CAST(RANK() OVER (ORDER BY "correctCount" DESC) AS INT) AS "rank"
    FROM SubmissionScores
  )
  SELECT 
      rs."correctCount",
      (SELECT CAST(COUNT(*) AS INT) 
       FROM RankedSubmissions r2 
       WHERE r2."correctCount" = rs."correctCount" AND r2."submissionId" != rs."submissionId") AS "tieCount",
      rs."rank"
  FROM RankedSubmissions rs
  WHERE rs."submissionId" = ${submissionId}
  UNION ALL
  SELECT 0 AS "correctCount", 0 AS "tieCount", (SELECT CAST(COUNT(*) AS INT) FROM RankedSubmissions) + 1 AS "rank"
  WHERE NOT EXISTS (SELECT 1 FROM RankedSubmissions WHERE "submissionId" = ${submissionId});
  `) || [];

  if (result.length === 0) {
    result = [{ correctCount: 0, tieCount: 0, rank: 1 }];
  }
  return (
    result as { correctCount: number; tieCount: number; rank: number }[]
  )[0];
};

export const setSubmissionPaid = (id: string, isPaid: boolean) => {
  return db.submission.update({
    where: { id },
    data: { isPaid },
  });
};

export const updateSubmissionSelection = async (
  submissionId: string,
  optionId: string,
  sheetId: string,
) => {
  const option = await db.propositionOption.findUnique({
    where: { id: optionId },
    select: { propositionId: true, proposition: { select: { sheetId: true } } },
  });

  if (!option || option.proposition.sheetId !== sheetId) {
    throw new Error("Option not found");
  }

  const existingSelection = await db.propositionSelection.findFirst({
    where: {
      submissionId,
      option: { propositionId: option.propositionId },
    },
    select: { id: true },
  });

  if (existingSelection) {
    return db.propositionSelection.update({
      where: { id: existingSelection.id },
      data: { optionId },
    });
  }

  return db.propositionSelection.create({
    data: {
      submissionId,
      optionId,
    },
  });
};

export const updateSubmissionTieBreaker = (id: string, tieBreaker: number) => {
  return db.submission.update({
    where: { id },
    data: { tieBreaker },
  });
};

export const updateSubmissionNickname = (
  id: string,
  nickname: string | null,
) => {
  return db.submission.update({
    where: { id },
    data: { nickname },
  });
};

export type PaginatedSubmissionsResult = {
  submissions: Awaited<ReturnType<typeof readSheetSubmissions>>;
  total: number;
  paidCount: number;
};

export type SubmissionsQueryParams = {
  sheetId: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export const readSheetSubmissionsPaginated = async ({
  sheetId,
  search,
  page = 1,
  pageSize = 25,
}: SubmissionsQueryParams): Promise<PaginatedSubmissionsResult> => {
  const skip = (page - 1) * pageSize;

  // Build the where clause for filtering
  const baseWhere: Prisma.SubmissionWhereInput = { sheetId };
  const searchWhere: Prisma.SubmissionWhereInput = search
    ? {
        sheetId,
        OR: [
          { sailor: { username: { contains: search, mode: "insensitive" } } },
          { sailor: { firstName: { contains: search, mode: "insensitive" } } },
          { sailor: { lastName: { contains: search, mode: "insensitive" } } },
          { sailor: { phone: { contains: search, mode: "insensitive" } } },
          ...(search.toLowerCase() === "paid" ? [{ isPaid: true }] : []),
          ...(search.toLowerCase() === "unpaid" ? [{ isPaid: false }] : []),
        ],
      }
    : baseWhere;

  // Run queries in parallel
  const [submissions, total, paidCount] = await Promise.all([
    db.submission.findMany({
      where: searchWhere,
      include: {
        sailor: true,
        selections: {
          include: {
            option: {
              include: {
                proposition: true,
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    db.submission.count({
      where: searchWhere,
    }),
    db.submission.count({
      where: { sheetId, isPaid: true },
    }),
  ]);

  return { submissions, total, paidCount };
};
