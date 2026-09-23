// จุดเดียวที่หน้าจอใช้เรียก API หลังบ้าน (ตามสัญญา API ใน plan.md ข้อ 4)
// ตอน task T-10 ใช้ข้อมูลจำลองเพื่อให้หน้าจอแสดงผลได้โดยไม่ต้องรอ backend เสร็จ
const BASE = import.meta.env.VITE_API_BASE ?? '/api'

const MOCK_SLOTS = [
  { id: 'slot-01', date: '2569-09-23', start_time: '09:00', end_time: '09:30', package_code: 'general', remaining: 3 },
  { id: 'slot-02', date: '2569-09-23', start_time: '10:00', end_time: '10:30', package_code: 'general', remaining: 5 },
  { id: 'slot-03', date: '2569-09-23', start_time: '11:30', end_time: '12:00', package_code: 'premium', remaining: 2 },
  { id: 'slot-04', date: '2569-09-24', start_time: '08:30', end_time: '09:00', package_code: 'premium', remaining: 4 },
]

export const api = {
  async getSlots({ dateFrom, packageCode }) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.MODE === 'test') {
      return {
        items: MOCK_SLOTS.filter((slot) => {
          const matchesDate = !dateFrom || slot.date >= dateFrom
          const matchesPackage = !packageCode || slot.package_code === packageCode
          return matchesDate && matchesPackage
        }),
      }
    }

    const q = new URLSearchParams({ date_from: dateFrom, package_code: packageCode })
    const res = await fetch(`${BASE}/slots?${q}`)
    return res.json()
  },
  async createBooking({ slotId }) {
    const res = await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: slotId }),
    })
    return { status: res.status, body: await res.json() }
  },
}
