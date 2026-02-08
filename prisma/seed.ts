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
            { title: "Heads", shortTitle: "H", order: 1 },
            { title: "Tails", shortTitle: "T", order: 2 },
          ],
        },
      },
      {
        title: "First team to score",
        shortTitle: "First score",
        order: 2,
        options: {
          create: [
            { title: "Home", shortTitle: "Home", order: 1 },
            { title: "Away", shortTitle: "Away", order: 2 },
          ],
        },
      },
      {
        title: "Halftime leader",
        shortTitle: "Halftime",
        order: 3,
        options: {
          create: [
            { title: "Home", shortTitle: "Home", order: 1 },
            { title: "Away", shortTitle: "Away", order: 2 },
            { title: "Tie", shortTitle: "Tie", order: 3 },
          ],
        },
      },
      {
        title: "Will there be an overtime period?",
        shortTitle: "Overtime",
        order: 4,
        options: {
          create: [
            { title: "Yes", shortTitle: "Yes", order: 1 },
            { title: "No", shortTitle: "No", order: 2 },
          ],
        },
      },
      {
        title: "Total touchdowns in the game",
        shortTitle: "Total TDs",
        order: 5,
        options: {
          create: [
            { title: "Over 6.5", shortTitle: "Over", order: 1 },
            { title: "Under 6.5", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Will there be a safety?",
        shortTitle: "Safety",
        order: 6,
        options: {
          create: [
            { title: "Yes", shortTitle: "Yes", order: 1 },
            { title: "No", shortTitle: "No", order: 2 },
          ],
        },
      },
      {
        title: "First score type",
        shortTitle: "1st score",
        order: 7,
        options: {
          create: [
            { title: "Touchdown", shortTitle: "TD", order: 1 },
            { title: "Field Goal", shortTitle: "FG", order: 2 },
            { title: "Safety", shortTitle: "Saf", order: 3 },
          ],
        },
      },
      {
        title: "Winning team total points",
        shortTitle: "Winner pts",
        order: 8,
        options: {
          create: [
            { title: "Over 27.5", shortTitle: "Over", order: 1 },
            { title: "Under 27.5", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Longest touchdown",
        shortTitle: "Long TD",
        order: 9,
        options: {
          create: [
            { title: "Over 45.5 yards", shortTitle: "Over", order: 1 },
            { title: "Under 45.5 yards", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Will there be a missed field goal?",
        shortTitle: "Missed FG",
        order: 10,
        options: {
          create: [
            { title: "Yes", shortTitle: "Yes", order: 1 },
            { title: "No", shortTitle: "No", order: 2 },
          ],
        },
      },
      {
        title: "Total field goals made",
        shortTitle: "FGs made",
        order: 11,
        options: {
          create: [
            { title: "Over 3.5", shortTitle: "Over", order: 1 },
            { title: "Under 3.5", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Will there be a punt return touchdown?",
        shortTitle: "Punt ret TD",
        order: 12,
        options: {
          create: [
            { title: "Yes", shortTitle: "Yes", order: 1 },
            { title: "No", shortTitle: "No", order: 2 },
          ],
        },
      },
      {
        title: "Will there be a kickoff return touchdown?",
        shortTitle: "KO ret TD",
        order: 13,
        options: {
          create: [
            { title: "Yes", shortTitle: "Yes", order: 1 },
            { title: "No", shortTitle: "No", order: 2 },
          ],
        },
      },
      {
        title: "Total turnovers in the game",
        shortTitle: "Turnovers",
        order: 14,
        options: {
          create: [
            { title: "Over 2.5", shortTitle: "Over", order: 1 },
            { title: "Under 2.5", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Will there be a defensive touchdown?",
        shortTitle: "Def TD",
        order: 15,
        options: {
          create: [
            { title: "Yes", shortTitle: "Yes", order: 1 },
            { title: "No", shortTitle: "No", order: 2 },
          ],
        },
      },
      {
        title: "Largest lead in the game",
        shortTitle: "Max lead",
        order: 16,
        options: {
          create: [
            { title: "Over 13.5 points", shortTitle: "Over", order: 1 },
            { title: "Under 13.5 points", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Fourth quarter total points",
        shortTitle: "4th Q pts",
        order: 17,
        options: {
          create: [
            { title: "Over 13.5", shortTitle: "Over", order: 1 },
            { title: "Under 13.5", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Will there be a successful two-point conversion?",
        shortTitle: "2pt conv",
        order: 18,
        options: {
          create: [
            { title: "Yes", shortTitle: "Yes", order: 1 },
            { title: "No", shortTitle: "No", order: 2 },
          ],
        },
      },
      {
        title: "Total sacks in the game",
        shortTitle: "Sacks",
        order: 19,
        options: {
          create: [
            { title: "Over 5.5", shortTitle: "Over", order: 1 },
            { title: "Under 5.5", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Will the game be decided by 3 points or fewer?",
        shortTitle: "Close game",
        order: 20,
        options: {
          create: [
            { title: "Yes", shortTitle: "Yes", order: 1 },
            { title: "No", shortTitle: "No", order: 2 },
          ],
        },
      },
      {
        title: "Total passing touchdowns",
        shortTitle: "Pass TDs",
        order: 21,
        options: {
          create: [
            { title: "Over 3.5", shortTitle: "Over", order: 1 },
            { title: "Under 3.5", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Total rushing touchdowns",
        shortTitle: "Rush TDs",
        order: 22,
        options: {
          create: [
            { title: "Over 1.5", shortTitle: "Over", order: 1 },
            { title: "Under 1.5", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Longest field goal made",
        shortTitle: "Long FG",
        order: 23,
        options: {
          create: [
            { title: "Over 47.5 yards", shortTitle: "Over", order: 1 },
            { title: "Under 47.5 yards", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Will there be a successful challenge?",
        shortTitle: "Challenge",
        order: 24,
        options: {
          create: [
            { title: "Yes", shortTitle: "Yes", order: 1 },
            { title: "No", shortTitle: "No", order: 2 },
          ],
        },
      },
      {
        title: "Total penalties called",
        shortTitle: "Penalties",
        order: 25,
        options: {
          create: [
            { title: "Over 10.5", shortTitle: "Over", order: 1 },
            { title: "Under 10.5", shortTitle: "Under", order: 2 },
          ],
        },
      },
      {
        title: "Will the winning team score in all four quarters?",
        shortTitle: "Score 4Qs",
        order: 26,
        options: {
          create: [
            { title: "Yes", shortTitle: "Yes", order: 1 },
            { title: "No", shortTitle: "No", order: 2 },
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
        nickname: `${firstName}_${Math.random().toString(36).substring(2, 9)}`,
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
