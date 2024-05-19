/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `Annotation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Annotation_uuid_key" ON "Annotation"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Video_uuid_key" ON "Video"("uuid");
