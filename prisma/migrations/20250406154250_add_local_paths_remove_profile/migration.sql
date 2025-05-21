/*
  Warnings:

  - You are about to drop the column `localProfilePicPath` on the `Post` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT NOT NULL,
    "postUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "relativeTime" TEXT NOT NULL,
    "profileName" TEXT NOT NULL,
    "localPostImagePath" TEXT NOT NULL
);
INSERT INTO "new_Post" ("caption", "id", "image", "localPostImagePath", "postUrl", "profileName", "relativeTime", "timestamp") SELECT "caption", "id", "image", "localPostImagePath", "postUrl", "profileName", "relativeTime", "timestamp" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_postUrl_key" ON "Post"("postUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
