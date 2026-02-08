import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type UpdateSheet = {
  title?: string;
  subTitle?: string;
  status?: "DRAFT" | "OPEN" | "CLOSED";
  closesAt?: Date | null;
};

export type SheetWithPropositions = Prisma.SheetGetPayload<{
  include: {
    propositions: {
      include: {
        options: true;
      };
    };
  };
}>;

export type SheetLeader = {
  submissionId: string;
  sailorId: string;
  username: string;
  nickname: string | null;
  profilePictureUrl: string | null;
  correct: number;
  ranking: number;
};

export const readSheets = () => {
  return db.sheet.findMany({
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
};

export const readLatestSheet = () => {
  return db.sheet.findFirst({
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
};

export const readSheet = (id: string) => {
  return db.sheet.findUnique({
    where: { id },
    include: {
      propositions: {
        orderBy: {
          order: "asc",
        },
        include: {
          options: {
            orderBy: [{ order: "asc" }, { id: "asc" }],
          },
        },
      },
    },
  });
};

export const updateSheet = (id: string, data: UpdateSheet) => {
  return db.sheet.update({
    where: { id },
    data,
  });
};

export const readSheetWithSubmissions = (id: string) => {
  return db.sheet.findUnique({
    where: { id },
    include: {
      submissions: {
        include: {
          sailor: true,
          selections: {
            include: {
              option: true,
            },
          },
        },
      },
      propositions: {
        include: {
          options: {
            orderBy: [{ order: "asc" }, { id: "asc" }],
          },
        },
      },
    },
  });
};

export const readSheetLeaders = async (
  sheetId: string
): Promise<SheetLeader[]> => {
  return db.$queryRaw<SheetLeader[]>`
    select
    su.id as "submissionId",
    sa.id as "sailorId",
    sa.username as "username",
    su.nickname as "nickname",
    sa."profilePictureUrl" as "profilePictureUrl",
    COALESCE(sum(CASE WHEN ps."optionId" = p."answerId" THEN 1 ELSE 0 END),0)::integer as "correct",
    RANK () OVER (
      ORDER BY COALESCE(sum(CASE WHEN ps."optionId" = p."answerId" THEN 1 ELSE 0 END),0) DESC
    )::integer ranking
    from "Submission" su
    join "Sailor" sa on su."sailorId" = sa.id
    left join "PropositionSelection" ps on ps."submissionId" = su.id
    left join "PropositionOption" po on ps."optionId" = po.id
    left join "Proposition" p on po."propositionId" = p.id AND p."sheetId" = ${sheetId}
    where su."sheetId" = ${sheetId} AND su."isPaid" = true
    group by su.id, sa.id, sa.username, su.nickname, sa."profilePictureUrl"
  `;
};

export const readSheetSummary = async (
  id: string
): Promise<{ totalPropositions: number; answeredPropositions: number }> => {
  const propositionCounts = await db.proposition.aggregate({
    where: {
      sheetId: id, // Filters only propositions for this sheet
    },
    _count: {
      _all: true, // Total propositions in this sheet
      answerId: true, // Propositions in this sheet with an answer
    },
  });
  const result: {
    totalPropositions: number;
    answeredPropositions: number;
  } = {
    totalPropositions: propositionCounts._count._all,
    answeredPropositions: propositionCounts._count.answerId,
  };
  return result;
};

// todo: combine this with readSheetLeaders
export const readSheetDashboard = async (
  sheetId: string
): Promise<
  (SheetLeader & {
    selections: { optionId: string }[];
  })[]
> => {
  const leaders = await db.$queryRaw<SheetLeader[]>`
    select
    su.id as "submissionId",
    sa.id as "sailorId",
    sa.username as "username",
    su.nickname as "nickname",
    sa."profilePictureUrl" as "profilePictureUrl",
    COALESCE(sum(CASE WHEN ps."optionId" = p."answerId" THEN 1 ELSE 0 END),0)::integer as "correct",
    RANK () OVER (
      ORDER BY COALESCE(sum(CASE WHEN ps."optionId" = p."answerId" THEN 1 ELSE 0 END),0) DESC
    )::integer ranking
    from "Submission" su
    join "Sailor" sa on su."sailorId" = sa.id
    left join "PropositionSelection" ps on ps."submissionId" = su.id
    left join "PropositionOption" po on ps."optionId" = po.id
    left join "Proposition" p on po."propositionId" = p.id AND p."sheetId" = ${sheetId}
    where su."sheetId" = ${sheetId} AND su."isPaid" = true
    group by su.id, sa.id, sa.username, su.nickname, sa."profilePictureUrl"
  `;

  const leaderIds = leaders.map((leader) => leader.submissionId);

  const selections = await db.propositionSelection.findMany({
    where: {
      submissionId: {
        in: leaderIds,
      },
    },
    select: {
      submissionId: true,
      optionId: true,
    },
  });

  return leaders.map((leader) => ({
    ...leader,
    selections: selections.filter(
      (selection) => selection.submissionId === leader.submissionId
    ),
  }));
};
