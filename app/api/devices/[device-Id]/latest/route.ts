import { InfluxDB } from '@influxdata/influxdb-client'
import { NextResponse } from 'next/server'

const client = new InfluxDB({
  url: process.env.INFLUX_URL!,
  token: process.env.INFLUX_TOKEN!,
})

export async function GET(
  req: Request,
  { params }: { params: { deviceId: string } }
) {
  const queryApi = client.getQueryApi(process.env.INFLUX_ORG!)
  const fluxQuery = `
    from(bucket: "${process.env.INFLUX_BUCKET}")
      |> range(start: -5m)
      |> filter(fn: (r) => r._measurement == "wifi_metrics")
      |> filter(fn: (r) => r.device_id == "${params.deviceId}")
      |> last()
  `

  const results: any[] = []
  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    results.push(tableMeta.toObject(values))
  }

  return NextResponse.json(results)
}