-- Add ordering support for proposition options
ALTER TABLE "PropositionOption" ADD COLUMN "order" INTEGER;

WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "propositionId" ORDER BY id) AS row_num
  FROM "PropositionOption"
)
UPDATE "PropositionOption" po
SET "order" = ordered.row_num
FROM ordered
WHERE po.id = ordered.id;
