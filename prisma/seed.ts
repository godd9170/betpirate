import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const TEST_SAILOR_COUNT = 50;

const FIRST_NAMES = [
  "Alex",
  "Bailey",
  "Casey",
  "Dakota",
  "Emery",
  "Finley",
  "Gray",
  "Harper",
  "Indigo",
  "Jordan",
  "Kendall",
  "Logan",
  "Morgan",
  "Nico",
  "Parker",
  "Quinn",
  "Reese",
  "Rowan",
  "Sawyer",
  "Taylor",
  "Winter",
  "Zion",
];

const LAST_NAMES = [
  "Avery",
  "Brooks",
  "Carter",
  "Davis",
  "Ellis",
  "Flores",
  "Garcia",
  "Hughes",
  "Irwin",
  "James",
  "Kim",
  "Lewis",
  "Moore",
  "Nguyen",
  "Owens",
  "Patel",
  "Quincy",
  "Reed",
  "Singh",
  "Turner",
  "Vega",
  "Wright",
  "Young",
  "Zimmer",
];

const pickRandom = <T>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

const makePhoneNumber = (index: number) =>
  `+1555${String(1000000 + index).slice(-7)}`;

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
          create: [
            { title: "Heads", order: 1 },
            { title: "Tails", order: 2 },
          ],
        },
      },
      {
        title: "First team to score",
        shortTitle: "First score",
        order: 2,
        options: {
          create: [
            { title: "Home", order: 1 },
            { title: "Away", order: 2 },
          ],
        },
      },
      {
        title: "Halftime leader",
        shortTitle: "Halftime",
        order: 3,
        options: {
          create: [
            { title: "Home", order: 1 },
            { title: "Away", order: 2 },
            { title: "Tie", order: 3 },
          ],
        },
      },
      {
        title: "Will there be an overtime period?",
        shortTitle: "Overtime",
        order: 4,
        options: {
          create: [
            { title: "Yes", order: 1 },
            { title: "No", order: 2 },
          ],
        },
      },
    ],
  },
};

const seed = async () => {
  const seedSheet = await db.sheet.create({
    data: defaultSheet,
    select: {
      id: true,
      propositions: {
        select: {
          id: true,
          options: { select: { id: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

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

  for (let index = 0; index < TEST_SAILOR_COUNT; index += 1) {
    const firstName = pickRandom(FIRST_NAMES);
    const lastName = pickRandom(LAST_NAMES);
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${
      index + 1
    }`;
    const phone = makePhoneNumber(index);
    const sailor = await db.sailor.upsert({
      where: { phone },
      update: { firstName, lastName, username },
      create: {
        phone,
        username,
        firstName,
        lastName,
      },
    });

    const existingSubmission = await db.submission.findFirst({
      where: { sheetId: seedSheet.id, sailorId: sailor.id },
      select: { id: true },
    });

    if (existingSubmission) {
      continue;
    }

    const selections = seedSheet.propositions.map((proposition) => ({
      optionId: pickRandom(proposition.options).id,
    }));

    await db.submission.create({
      data: {
        sheetId: seedSheet.id,
        sailorId: sailor.id,
        nickname: `${firstName} ${lastName}`,
        tieBreaker: Math.floor(10 + Math.random() * 91),
        selections: { create: selections },
      },
    });
  }
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
