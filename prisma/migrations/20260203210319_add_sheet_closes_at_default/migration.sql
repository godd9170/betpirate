-- AlterTable
ALTER TABLE "Sheet" ALTER COLUMN "closesAt" SET DEFAULT now() + interval '7 days';
