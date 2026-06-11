-- DropIndex
DROP INDEX "SurveyAnswer_questionId_userId_key";

-- AlterTable
ALTER TABLE "SurveyAnswer" ALTER COLUMN "userId" DROP NOT NULL;
