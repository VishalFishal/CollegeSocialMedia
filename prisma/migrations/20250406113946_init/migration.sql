-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT NOT NULL,
    "postUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "relativeTime" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_postUrl_key" ON "Post"("postUrl");
