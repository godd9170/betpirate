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
  sailor: {
    id: string;
    username: string | null;
  };
};

// todo: use createMany when Postgres is used
// https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#createmany-1
export const createSubmission = ({
  sheetId,
  sailorId,
  selections = [],
  tieBreaker,
}: NewSubmission) => {
  return db.submission.create({
    data: {
      sheetId,
      sailorId,
      tieBreaker,
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
  sheetId: string
): Promise<SubmissionPreview[]> => {
  return db.submission.findMany({
    where: { sheetId },
    select: {
      id: true,
      createdAt: true,
      isPaid: true,
      sailor: {
        select: {
          id: true,
          username: true,
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
  submissionId: string
) => {
  console.log("SHEETIDL ", sheetId);
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
  console.log(">>>>>>>>RESULT: ", result);
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
