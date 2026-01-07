-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyTask_completedAt_position_idx" ON "DailyTask"("completedAt", "position");

-- CreateIndex
CREATE INDEX "DailyTask_completedAt_createdAt_idx" ON "DailyTask"("completedAt", "createdAt");
