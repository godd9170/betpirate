import { PrismaClient, Prisma, PropositionOption } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const sailor = {
  email: "me@henrygoddard.com",
  username: "BlackBeard69",
  password: "password",
};
const sheet = {
  title: "2023 PGA Masters",
  subtitle:
    "Welcome BetPirate 2.0! If you're here, you are a trusted beta tester. Let's get after it.",
};
const propositions = [
  {
    title: "Will Tiger Woods make the cut?",
    subtitle:
      "He's only missed it once in 24 attempts. That was when he was 20.",
    order: 1,
    options: [
      {
        title: "Hell yeah",
        subtitle: "-",
      },
      {
        title: "No sir",
        subtitle: "-",
      },
    ],
  },
  {
    title: "Smith v. Spieth - Who will post the lower round of the tournament?",
    subtitle: "Both golfers among the favourites to win the whole thing.",
    order: 2,
    options: [
      {
        title: "Cameron Smith",
        subtitle: "-",
      },
      {
        title: "Jordan Spieth",
        subtitle: "-",
      },
    ],
  },
  {
    title:
      "Will the lowest round posted by any golfer be over or under 65.5 strokes?",
    subtitle: "Lowest ever recorded is a 63.",
    order: 3,
    options: [
      {
        title: "Over 65.5",
        subtitle: "-",
      },
      {
        title: "Under 65.5",
        subtitle: "-",
      },
    ],
  },
  {
    title: "Will there be a hole in one?",
    subtitle: "33 aces have been recorded since the tournaments inception.",
    order: 4,
    options: [
      {
        title: "Absolutely",
        subtitle: "-",
      },
      {
        title: "No",
        subtitle: "-",
      },
    ],
  },
  {
    title: "Will the field average on hole 10 be above, or below par?",
    subtitle:
      "Widely regarded as the hardest hole at Augusta, the lifetime average is 4.81 strokes.",
    order: 5,
    options: [
      {
        title: "Above Par",
        subtitle: "-",
      },
      {
        title: "Below Par",
        subtitle: "-",
      },
    ],
  },
  {
    title:
      "Will the winner of the tournament be Rory McIlroy, Jon Rahm or Scottie Scheffler or will it be someone else?",
    subtitle: "",
    order: 6,
    options: [
      {
        title: "On of the favourites.",
        subtitle: "-",
      },
      {
        title: "Someone else",
        subtitle: "-",
      },
    ],
  },
  {
    title: "Will Max Homa get an eagle at any point during the Masters?",
    subtitle: "",
    order: 7,
    options: [
      {
        title: "Yes",
        subtitle: "-",
      },
      {
        title: "No",
        subtitle: "-",
      },
    ],
  },
  {
    title: "Will the best round on Sunday be over or under -5.5?",
    subtitle: "",
    order: 8,
    options: [
      {
        title: "Over -5.5",
        subtitle: "-",
      },
      {
        title: "Under -5.5",
        subtitle: "-",
      },
    ],
  },
  {
    title: "Will a LIV player win the Masters this year?",
    subtitle: "",
    order: 9,
    options: [
      {
        title: "Hell yah",
        subtitle: "-",
      },
      {
        title: "Nope",
        subtitle: "-",
      },
    ],
  },
  {
    title: "Scottie scheffler over under 4.5 birdies or better in round one ",
    subtitle: "First mate question from Matt smith",
    order: 10,
    options: [
      {
        title: "Over 4.5",
        subtitle: "-",
      },
      {
        title: "Under 4.5",
        subtitle: "-",
      },
    ],
  },
];

const _seedSailor = async () => {
  const { password, ..._sailor } = sailor;
  const passwordHash = await bcrypt.hash(password, 10);
  await db.sailor.create({ data: { ..._sailor, passwordHash } });
};

const _seedSheet = async () => {
  const sheetRecord = await db.sheet.create({ data: sheet });
  const propositionRecords = await Promise.all(
    propositions.map((proposition) => {
      const { options, ...attrs } = proposition;
      return db.proposition.create({
        data: { sheetId: sheetRecord.id, ...attrs },
      });
    })
  );
  const propositionOptionRecords = Promise.all(
    propositionRecords.reduce(
      (
        a: Prisma.Prisma__PropositionOptionClient<PropositionOption, never>[],
        proposition,
        i
      ) => {
        const { options } = propositions[i];
        const optionCreates = options.map((option) => {
          const data = { propositionId: proposition.id, ...option };
          return db.propositionOption.create({ data });
        });
        return [...a, ...optionCreates];
      },
      []
    )
  );
};

const seed = () => {
  _seedSailor();
  _seedSheet();
};

seed();
