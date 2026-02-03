import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const defaultSheet = {
  title: "Test Superbowl",
  subtitle: "Welcome to the show!",
  status: "OPEN" as const,
  tieBreakerQuestion: "Total points scored (both teams)",
  propositions: {
    create: [
      {
        title: "Coin toss result",
        shortTitle: "Coin toss",
        order: 1,
        options: {
          create: [{ title: "Heads" }, { title: "Tails" }],
        },
      },
      {
        title: "First team to score",
        shortTitle: "First score",
        order: 2,
        options: {
          create: [{ title: "Home" }, { title: "Away" }],
        },
      },
      {
        title: "Halftime leader",
        shortTitle: "Halftime",
        order: 3,
        options: {
          create: [{ title: "Home" }, { title: "Away" }, { title: "Tie" }],
        },
      },
      {
        title: "Will there be an overtime period?",
        shortTitle: "Overtime",
        order: 4,
        options: {
          create: [{ title: "Yes" }, { title: "No" }],
        },
      },
    ],
  },
};

const seed = async () => {
  const existingSheet = await db.sheet.findFirst({ select: { id: true } });

  if (!existingSheet) {
    await db.sheet.create({ data: defaultSheet });
  }

  await db.sailor.upsert({
    where: { phone: "+16139211286" },
    update: { admin: true },
    create: {
      phone: "+16139211286",
      username: "admin",
      firstName: "Chuck",
      lastName: "Norris",
      admin: true,
    },
  });
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
