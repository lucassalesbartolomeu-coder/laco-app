-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleCalendarId" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredBy" TEXT;

-- AlterTable
ALTER TABLE "WeddingPlannerAssignment" ADD COLUMN     "assignedTeamMemberId" TEXT;

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "plannerId" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "signedByPlanner" BOOLEAN NOT NULL DEFAULT false,
    "signedByCouple" BOOLEAN NOT NULL DEFAULT false,
    "plannerSignedAt" TIMESTAMP(3),
    "coupleSignedAt" TIMESTAMP(3),
    "plannerName" TEXT,
    "coupleName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannerTeamMember" (
    "id" TEXT NOT NULL,
    "plannerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'assistente',
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannerTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contract_plannerId_idx" ON "Contract"("plannerId");

-- CreateIndex
CREATE INDEX "Contract_weddingId_idx" ON "Contract"("weddingId");

-- CreateIndex
CREATE INDEX "PlannerTeamMember_plannerId_idx" ON "PlannerTeamMember"("plannerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- AddForeignKey
ALTER TABLE "WeddingPlannerAssignment" ADD CONSTRAINT "WeddingPlannerAssignment_assignedTeamMemberId_fkey" FOREIGN KEY ("assignedTeamMemberId") REFERENCES "PlannerTeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_plannerId_fkey" FOREIGN KEY ("plannerId") REFERENCES "WeddingPlanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerTeamMember" ADD CONSTRAINT "PlannerTeamMember_plannerId_fkey" FOREIGN KEY ("plannerId") REFERENCES "WeddingPlanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

