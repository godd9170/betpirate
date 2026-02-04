-- Replace profile picture blob with URL
ALTER TABLE "Sailor" DROP COLUMN "profilePicture";
ALTER TABLE "Sailor" ADD COLUMN "profilePictureUrl" TEXT;
