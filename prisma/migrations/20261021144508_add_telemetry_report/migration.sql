-- CreateTable
CREATE TABLE "TelemetryReport" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "uptimeMs" INTEGER,
    "bssid" TEXT,
    "channel" INTEGER,
    "rssiDbm" INTEGER,
    "gwLossPct" DOUBLE PRECISION,
    "gwRttAvgMs" DOUBLE PRECISION,
    "gwJitterMs" DOUBLE PRECISION,
    "remLossPct" DOUBLE PRECISION,
    "remRttAvgMs" DOUBLE PRECISION,
    "remJitterMs" DOUBLE PRECISION,
    "bwKbps" INTEGER,
    "raw" JSONB NOT NULL,

    CONSTRAINT "TelemetryReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TelemetryReport_device_createdAt_idx" ON "TelemetryReport"("device", "createdAt");
