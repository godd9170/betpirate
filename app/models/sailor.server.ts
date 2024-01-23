import { db } from "~/utils/db.server";

type NewSailor = {
  username?: string;
  phone: string;
};

export const createSailor = (data: NewSailor) => {
  return db.sailor.create({ data });
};

export const readSailor = (id: string) => {
  return db.sailor.findUnique({ where: { id } });
};

export const readSailorByPhone = (phone: string) => {
  return db.sailor.findUnique({ where: { phone } });
};

export const readSailorWithSubmissions = (id: string) => {
  return db.sailor.findUnique({
    where: { id },
    include: {
      submissions: true,
    },
  });
};
