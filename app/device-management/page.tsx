export default function DeviceManagementPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Device Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola edge sensor node yang terdaftar di sistem.
          </p>
        </div>
        <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600">
          + Tambah Device
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          Tabel daftar device (dari model Prisma Device) akan ditempatkan di sini.
        </p>
      </div>
    </div>
  )
}
