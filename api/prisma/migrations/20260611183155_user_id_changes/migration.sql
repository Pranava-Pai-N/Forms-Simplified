/*
  Warnings:

  - A unique constraint covering the columns `[questionId,userId]` on the table `SurveyAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SurveyAnswer_questionId_userId_key" ON "SurveyAnswer"("questionId", "userId");
