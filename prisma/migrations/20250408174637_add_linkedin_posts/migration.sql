-- CreateTable
CREATE TABLE "LinkedInPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caption" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "postUrl" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInPost_postUrl_key" ON "LinkedInPost"("postUrl");
