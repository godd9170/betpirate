import { db } from "~/utils/db.server";

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
        include: {
          options: true,
        },
      },
    },
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
          options: true,
        },
      },
    },
  });
};
