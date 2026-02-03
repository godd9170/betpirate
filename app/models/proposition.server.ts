import { db } from "~/utils/db.server";

type PropositionOption = {
  title: string;
  shortTitle?: string;
  imageUrl?: string | null;
};

type Proposition = {
  title?: string;
  subtitle?: string;
  shortTitle?: string;
  order?: number;
  answerId?: string | null;
  imageUrl?: string | null;
};

interface NewProposition extends Proposition {
  title: string;
  sheetId: string;
  options?: PropositionOption[];
}

export const getNextPropositionOrder = async (sheetId: string) => {
  const missingOrder = await db.proposition.findFirst({
    where: { sheetId, order: null },
    select: { id: true },
  });

  if (missingOrder) {
    const ordered = await db.proposition.findMany({
      where: { sheetId },
      orderBy: [{ order: "asc" }, { id: "asc" }],
      select: { id: true },
    });

    await db.$transaction(
      ordered.map((item, index) =>
        db.proposition.update({
          where: { id: item.id },
          data: { order: index + 1 },
        })
      )
    );
  }

  const aggregate = await db.proposition.aggregate({
    where: { sheetId },
    _max: { order: true },
    _count: { _all: true },
  });
  const fallback = aggregate._count?._all ?? 0;
  const maxOrder = aggregate._max?.order ?? fallback;
  return maxOrder + 1;
};

export const createProposition = ({
  options,
  ...proposition
}: NewProposition) => {
  return db.proposition.create({
    data: {
      ...proposition,
      options: {
        create: options,
      },
    },
  });
};

export const updateProposition = (id: string, data: Proposition) => {
  return db.proposition.update({
    where: { id },
    data,
  });
};

export const updatePropositionOption = (
  id: string,
  data: PropositionOption
) => {
  return db.propositionOption.update({
    where: { id },
    data,
  });
};

export const createPropositionOption = (
  propositionId: string,
  data: PropositionOption
) => {
  return db.propositionOption.create({
    data: {
      propositionId,
      ...data,
    },
  });
};

export const reorderPropositions = async (
  sheetId: string,
  propositionId: string,
  direction: "up" | "down"
) => {
  const propositions = await db.proposition.findMany({
    where: { sheetId },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  if (propositions.length < 2) return;

  const index = propositions.findIndex((item) => item.id === propositionId);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= propositions.length) return;

  const orderedIds = [...propositions.map((item) => item.id)];
  [orderedIds[index], orderedIds[swapWith]] = [
    orderedIds[swapWith],
    orderedIds[index],
  ];

  await db.$transaction(async (tx) => {
    // Two-phase update avoids hitting the (order, sheetId) unique constraint.
    await Promise.all(
      orderedIds.map((id, orderIndex) =>
        tx.proposition.update({
          where: { id },
          data: { order: orderIndex + 1 + 1000 },
        })
      )
    );

    await Promise.all(
      orderedIds.map((id, orderIndex) =>
        tx.proposition.update({
          where: { id },
          data: { order: orderIndex + 1 },
        })
      )
    );
  });
};
