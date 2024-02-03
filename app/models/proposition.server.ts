import { db } from "~/utils/db.server";

type PropositionOption = {
  title: string;
  shortTitle?: string;
};

type Proposition = {
  title?: string;
  subtitle?: string;
  shortTitle?: string;
  order?: number;
  answerId?: string | null;
};

interface NewProposition extends Proposition {
  title: string;
  sheetId: string;
  options?: PropositionOption[];
}

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
