import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'

// รองรับ FR-BKG-01, FR-BKG-06
export default function SlotPicker() {
  const [packageCode, setPackageCode] = useState('general')
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadSlots() {
      setLoading(true)
      const response = await api.getSlots({ dateFrom: '2569-09-23', packageCode })
      if (!ignore) {
        setSlots(response.items ?? [])
        setLoading(false)
      }
    }

    loadSlots()
    return () => {
      ignore = true
    }
  }, [packageCode])

  const packageSummary = useMemo(() => {
    if (!slots.length) return 'ไม่มีช่วงเวลาใกล้เคียง'
    return `${slots.length} ช่วงเวลาให้เลือก`
  }, [slots])

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">Booking</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">เลือกแพ็กเกจและช่วงเวลา</h1>
          </div>
          <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-800">
            {packageSummary}
          </span>
        </div>

        <div className="mb-6 flex gap-3">
          {['general', 'premium'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPackageCode(value)}
              className={[
                'rounded-xl border px-4 py-2 font-medium transition',
                packageCode === value
                  ? 'border-teal-700 bg-teal-700 text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-teal-500 hover:text-teal-700',
              ].join(' ')}
            >
              {value === 'general' ? 'แพ็กเกจทั่วไป' : 'แพ็กเกจพรีเมียม'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-600">กำลังโหลดช่วงว่าง...</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-teal-500 hover:bg-teal-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-slate-900">{slot.date}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    เหลือ {slot.remaining} ที่
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {slot.start_time} - {slot.end_time}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
