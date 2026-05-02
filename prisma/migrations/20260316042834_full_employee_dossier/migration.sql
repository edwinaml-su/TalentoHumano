/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `documentTypeId` on the `EmployeeDocument` table. All the data in the column will be lost.
  - You are about to drop the column `documentValue` on the `EmployeeDocument` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `EmployeeDocument` table. All the data in the column will be lost.
  - You are about to drop the column `issueDate` on the `EmployeeDocument` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `PayrollRunEmployee` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `SalaryHistory` table. All the data in the column will be lost.
  - You are about to drop the `DocumentType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationCurrency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollRule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[dui]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nit]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[isssNumber]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nupNumber]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personalEmail]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fullName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `EmployeeDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `EmployeeDocument` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `PayrollRun` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('IDENTIFICATION', 'CONTRACTUAL', 'ACADEMIC', 'PAYROLL', 'LEGAL');

-- DropForeignKey
ALTER TABLE "EmployeeDocument" DROP CONSTRAINT "EmployeeDocument_documentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationCurrency" DROP CONSTRAINT "OrganizationCurrency_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationCurrency" DROP CONSTRAINT "OrganizationCurrency_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "PayrollRule" DROP CONSTRAINT "PayrollRule_countryId_fkey";

-- DropIndex
DROP INDEX "EmployeeDocument_employeeId_documentTypeId_key";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "birthDate",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankAccountType" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "contractType" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "dui" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "isssNumber" TEXT,
ADD COLUMN     "municipality" TEXT,
ADD COLUMN     "nit" TEXT,
ADD COLUMN     "nupNumber" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "EmployeeDocument" DROP COLUMN "documentTypeId",
DROP COLUMN "documentValue",
DROP COLUMN "expiryDate",
DROP COLUMN "issueDate",
ADD COLUMN     "category" "DocumentCategory" NOT NULL,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "address";

-- AlterTable
ALTER TABLE "PayrollRun" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PayrollRunEmployee" DROP COLUMN "details";

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "SalaryHistory" DROP COLUMN "reason";

-- DropTable
DROP TABLE "DocumentType";

-- DropTable
DROP TABLE "OrganizationCurrency";

-- DropTable
DROP TABLE "PayrollRule";

-- DropEnum
DROP TYPE "PayrollStatus";

-- DropEnum
DROP TYPE "RuleType";

-- CreateTable
CREATE TABLE "Vacation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "daysTaken" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',

    CONSTRAINT "Vacation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL,
    "installments" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_dui_key" ON "Employee"("dui");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_nit_key" ON "Employee"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_isssNumber_key" ON "Employee"("isssNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_nupNumber_key" ON "Employee"("nupNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_personalEmail_key" ON "Employee"("personalEmail");

-- AddForeignKey
ALTER TABLE "Vacation" ADD CONSTRAINT "Vacation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
