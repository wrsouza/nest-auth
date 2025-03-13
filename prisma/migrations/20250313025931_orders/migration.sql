-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'paid', 'partial', 'cancelled');

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "payment_type" VARCHAR(20) NOT NULL,
    "payment_status" "payment_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
