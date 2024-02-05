/*
  Warnings:

  - You are about to drop the column `subtitle` on the `PropositionOption` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[answerId]` on the table `Proposition` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SheetStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "Proposition" ADD COLUMN     "answerId" TEXT,
ADD COLUMN     "shortTitle" TEXT,
ALTER COLUMN "order" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PropositionOption" DROP COLUMN "subtitle",
ADD COLUMN     "shortTitle" TEXT;

-- AlterTable
ALTER TABLE "Sailor" ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Sheet" ADD COLUMN     "status" "SheetStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "Proposition_answerId_key" ON "Proposition"("answerId");

-- AddForeignKey
ALTER TABLE "Proposition" ADD CONSTRAINT "Proposition_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "PropositionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
