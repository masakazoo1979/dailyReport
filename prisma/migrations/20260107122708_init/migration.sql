-- CreateTable
CREATE TABLE "sales" (
    "sales_id" SERIAL NOT NULL,
    "sales_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "department" VARCHAR(100) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "manager_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("sales_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" SERIAL NOT NULL,
    "customer_name" VARCHAR(100) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(50),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "address" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "daily_reports" (
    "report_id" SERIAL NOT NULL,
    "sales_id" INTEGER NOT NULL,
    "report_date" DATE NOT NULL,
    "problem" TEXT,
    "plan" TEXT,
    "status" VARCHAR(20) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_reports_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "visits" (
    "visit_id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "visit_content" TEXT NOT NULL,
    "visit_time" TIME NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("visit_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "comment_id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "sales_id" INTEGER NOT NULL,
    "comment_content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sales_email_key" ON "sales"("email");

-- CreateIndex
CREATE INDEX "sales_manager_id_idx" ON "sales"("manager_id");

-- CreateIndex
CREATE INDEX "sales_email_idx" ON "sales"("email");

-- CreateIndex
CREATE INDEX "customers_company_name_idx" ON "customers"("company_name");

-- CreateIndex
CREATE INDEX "customers_industry_idx" ON "customers"("industry");

-- CreateIndex
CREATE INDEX "daily_reports_sales_id_idx" ON "daily_reports"("sales_id");

-- CreateIndex
CREATE INDEX "daily_reports_report_date_idx" ON "daily_reports"("report_date");

-- CreateIndex
CREATE INDEX "daily_reports_status_idx" ON "daily_reports"("status");

-- CreateIndex
CREATE INDEX "daily_reports_approved_by_idx" ON "daily_reports"("approved_by");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reports_sales_id_report_date_key" ON "daily_reports"("sales_id", "report_date");

-- CreateIndex
CREATE INDEX "visits_report_id_idx" ON "visits"("report_id");

-- CreateIndex
CREATE INDEX "visits_customer_id_idx" ON "visits"("customer_id");

-- CreateIndex
CREATE INDEX "comments_report_id_idx" ON "comments"("report_id");

-- CreateIndex
CREATE INDEX "comments_sales_id_idx" ON "comments"("sales_id");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "sales"("sales_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_sales_id_fkey" FOREIGN KEY ("sales_id") REFERENCES "sales"("sales_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "sales"("sales_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_reports"("report_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_reports"("report_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_sales_id_fkey" FOREIGN KEY ("sales_id") REFERENCES "sales"("sales_id") ON DELETE CASCADE ON UPDATE CASCADE;
