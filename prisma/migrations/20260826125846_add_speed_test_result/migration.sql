-- CreateTable
CREATE TABLE "SpeedTestResult" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "download" DOUBLE PRECISION NOT NULL,
    "upload" DOUBLE PRECISION NOT NULL,
    "ping" DOUBLE PRECISION NOT NULL,
    "jitter" DOUBLE PRECISION NOT NULL,
    "packetLoss" DOUBLE PRECISION NOT NULL,
    "locationLat" DOUBLE PRECISION,
    "locationLng" DOUBLE PRECISION,
    "locationManual" TEXT,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeedTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpeedTestResult_deviceId_idx" ON "SpeedTestResult"("deviceId");

-- CreateIndex
CREATE INDEX "SpeedTestResult_testedAt_idx" ON "SpeedTestResult"("testedAt");
