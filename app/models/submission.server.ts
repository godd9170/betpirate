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

export const setSubmissionPaid = (id: string, isPaid: boolean) => {
  return db.submission.update({
    where: { id },
    data: { isPaid },
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

export const readSheetSubmissionRanking = async (submissionId: string) => {
  let result = await db.$queryRaw`
  WITH SubmissionScores AS (
    SELECT 
        s.id AS "submissionId",
        CAST(COUNT(ps.id) AS INT) AS "correctCount"
    FROM "Submission" s
    JOIN "PropositionSelection" ps ON ps."submissionId" = s.id
    JOIN "PropositionOption" po ON po.id = ps."optionId"
    JOIN "Proposition" p ON p.id = po."propositionId"
    WHERE p."answerId" = ps."optionId"
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
      (SELECT CAST(COUNT(*) - 1 AS INT) 
       FROM RankedSubmissions rs2 
       WHERE rs2."correctCount" = rs."correctCount") AS "tieCount",
      rs."rank"
  FROM RankedSubmissions rs
  WHERE rs."submissionId" = ${submissionId};
  `;
  return (
    result as { correctCount: number; tieCount: number; rank: number }[]
  )[0];
};
