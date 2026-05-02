/*
  Warnings:

  - You are about to drop the column `lastName` on the `Employee` table. All the data in the column will be lost.
  - Added the required column `firstSurname` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "lastName",
ADD COLUMN     "firstSurname" TEXT NOT NULL,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "secondSurname" TEXT,
ADD COLUMN     "thirdName" TEXT;
