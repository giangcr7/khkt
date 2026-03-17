/*
  Warnings:

  - The values [GUIDE] on the enum `PostType` will be removed. If these variants are still used in the database, this will fail.
  - The values [GUIDE] on the enum `ResourceType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ResearchGuide` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PostType_new" AS ENUM ('NEWS', 'ANNOUNCEMENT');
ALTER TABLE "Post" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "type" TYPE "PostType_new" USING ("type"::text::"PostType_new");
ALTER TYPE "PostType" RENAME TO "PostType_old";
ALTER TYPE "PostType_new" RENAME TO "PostType";
DROP TYPE "PostType_old";
ALTER TABLE "Post" ALTER COLUMN "type" SET DEFAULT 'NEWS';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ResourceType_new" AS ENUM ('TEMPLATE', 'VIDEO');
ALTER TABLE "Resource" ALTER COLUMN "type" TYPE "ResourceType_new" USING ("type"::text::"ResourceType_new");
ALTER TYPE "ResourceType" RENAME TO "ResourceType_old";
ALTER TYPE "ResourceType_new" RENAME TO "ResourceType";
DROP TYPE "ResourceType_old";
COMMIT;

-- DropTable
DROP TABLE "ResearchGuide";
