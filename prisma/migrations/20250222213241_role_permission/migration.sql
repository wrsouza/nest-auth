-- CreateTable
CREATE TABLE "_role_permission" (
    "A" VARCHAR(36) NOT NULL,
    "B" VARCHAR(36) NOT NULL,

    CONSTRAINT "_role_permission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_role_permission_B_index" ON "_role_permission"("B");

-- AddForeignKey
ALTER TABLE "_role_permission" ADD CONSTRAINT "_role_permission_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_role_permission" ADD CONSTRAINT "_role_permission_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
