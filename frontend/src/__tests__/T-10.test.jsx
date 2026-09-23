import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

// ตรวจว่า task T-10 สามารถแสดงหน้าเลือกแพ็กเกจและช่วงเวลาที่ว่างได้ด้วยข้อมูลจำลอง
it('แสดงหน้าเลือกแพ็กเกจและช่วงเวลาว่างจาก API จำลอง', () => {
  render(<App />)

  expect(screen.getByText('เลือกแพ็กเกจและช่วงเวลา')).toBeTruthy()
  expect(screen.getByText('แพ็กเกจทั่วไป')).toBeTruthy()
  expect(screen.getByText('แพ็กเกจพรีเมียม')).toBeTruthy()
  expect(screen.getByText('09:00 - 09:30')).toBeTruthy()
  expect(screen.getByText('10:00 - 10:30')).toBeTruthy()
})
