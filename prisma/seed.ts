import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const sheet = {
  title: "Superbowl LVIII",
  subtitle: "Welcome to the show!",
};

const seed = async () => {
  await db.sheet.create({ data: sheet });
};

seed();
