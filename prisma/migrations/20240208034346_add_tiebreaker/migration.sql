/*
  Warnings:

  - Added the required column `tieBreaker` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sheet" ADD COLUMN     "tieBreakerQuestion" TEXT;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "tieBreaker" INTEGER NOT NULL;
