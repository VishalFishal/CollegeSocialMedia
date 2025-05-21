/*
  Warnings:

  - The primary key for the `Post` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `localPostImagePath` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localProfilePicPath` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileName` to the `Post` table without a default value. This is not possible if the table is not empty.

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
    "localPostImagePath" TEXT NOT NULL,
    "localProfilePicPath" TEXT NOT NULL
);
INSERT INTO "new_Post" ("caption", "id", "image", "postUrl", "relativeTime", "timestamp") SELECT "caption", "id", "image", "postUrl", "relativeTime", "timestamp" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_postUrl_key" ON "Post"("postUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
