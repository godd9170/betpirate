import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const sailor = {
  phone: "+16139211286",
  username: "BlackBeard69",
};
const sheet = {
  title: "Superbowl LVIII",
  subtitle: "Welcome to the show!",
};

const seed = async () => {
  await db.sailor.create({ data: sailor });
  await db.sheet.create({ data: sheet });
};

seed();
