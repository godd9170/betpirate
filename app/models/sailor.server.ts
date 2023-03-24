import { db } from "~/utils/db.server";

type NewSailor = {
  username: string;
  email: string;
  passwordHash: string;
};

export const createSailor = (data: NewSailor) => {
  return db.sailor.create({ data });
};

export const readSailor = (id: string) => {
  return db.sailor.findUnique({ where: { id } });
};

export const readSailorByEmail = (email: string) => {
  return db.sailor.findUnique({ where: { email } });
};

export const readSailorWithSubmissions = (id: string) => {
  return db.sailor.findUnique({
    where: { id },
    include: {
      submissions: true,
    },
  });
};
