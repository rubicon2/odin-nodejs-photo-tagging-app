-- CreateTable
CREATE TABLE "public"."ImageTime" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(3) NOT NULL,
    "timeMs" INTEGER NOT NULL,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "ImageTime_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ImageTime" ADD CONSTRAINT "ImageTime_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "public"."Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
