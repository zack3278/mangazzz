-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarPreset" TEXT NOT NULL DEFAULT 'boy',
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "FavoriteManga" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "comicId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteManga_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteManga_userId_comicId_key" ON "FavoriteManga"("userId", "comicId");

-- AddForeignKey
ALTER TABLE "FavoriteManga" ADD CONSTRAINT "FavoriteManga_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteManga" ADD CONSTRAINT "FavoriteManga_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
