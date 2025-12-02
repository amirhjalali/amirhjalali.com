-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Draft" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "readTime" TEXT;
