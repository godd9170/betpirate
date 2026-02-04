import { db } from "~/utils/db.server";

type NewSailor = {
  username?: string;
  phone: string;
};

type UpdateSailor = {
  username?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string | null;
};

export const createSailor = (data: NewSailor) => {
  return db.sailor.create({ data });
};

export const updateSailor = (id: string, data: UpdateSailor) => {
  return db.sailor.update({
    where: { id },
    data,
  });
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

export const readSailorWithSheetSubmissions = (
  sailorId: string,
  sheetId: string,
) => {
  return db.sailor.findUnique({
    where: { id: sailorId },
    include: {
      submissions: {
        where: { sheetId },
      },
    },
  });
};
