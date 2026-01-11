/*
  Warnings:

  - You are about to drop the column `topic` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "link" TEXT,
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "topic",
ADD COLUMN     "topicId" INTEGER;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
