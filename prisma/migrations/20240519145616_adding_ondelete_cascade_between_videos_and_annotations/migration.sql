-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Annotation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "startTimeMilliSecs" INTEGER NOT NULL,
    "endTimeMilliSecs" INTEGER,
    "videoId" INTEGER NOT NULL,
    "type" TEXT,
    "additionalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Annotation_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Annotation" ("additionalNotes", "createdAt", "endTimeMilliSecs", "id", "startTimeMilliSecs", "type", "updatedAt", "uuid", "videoId") SELECT "additionalNotes", "createdAt", "endTimeMilliSecs", "id", "startTimeMilliSecs", "type", "updatedAt", "uuid", "videoId" FROM "Annotation";
DROP TABLE "Annotation";
ALTER TABLE "new_Annotation" RENAME TO "Annotation";
CREATE UNIQUE INDEX "Annotation_uuid_key" ON "Annotation"("uuid");
PRAGMA foreign_key_check("Annotation");
PRAGMA foreign_keys=ON;
