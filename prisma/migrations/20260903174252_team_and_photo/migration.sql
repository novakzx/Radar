-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "photo_url" TEXT;

-- CreateTable
CREATE TABLE "team_messages" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_reminders" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "done_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_messages_created_at_idx" ON "team_messages"("created_at");

-- CreateIndex
CREATE INDEX "team_reminders_done_idx" ON "team_reminders"("done");

-- AddForeignKey
ALTER TABLE "team_messages" ADD CONSTRAINT "team_messages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_reminders" ADD CONSTRAINT "team_reminders_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
