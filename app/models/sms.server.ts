import { db } from "~/utils/db.server";

type NewSMS = {
  to: string;
  body: string;
  response: object;
};

export const createSMS = (data: NewSMS) => {
  return db.sMS.create({ data });
};
