# Tasks: จองคิวตรวจสุขภาพ (Booking)
- Feature: จองคิวตรวจสุขภาพ
- Spec ID: SPEC-BKG-001
- อ้างอิง plan.md: specs/001-booking/plan.md
- วันที่: 2569-09-23

## สรุป
- ทำทั้งหมด 13 task
- มี 1 task ที่ต้องรอ Open Questions

## รายการ task

### T-01 สร้าง schema ฐานข้อมูล
- รองรับ: CON-TECH-01, DOM-PDPA-01, IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-01
- ไฟล์ที่แตะ: backend/app/db/models.py, backend/app/db/migrations/001_init.py, backend/app/config.py
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: migration สร้างตาราง slots, bookings, audit_logs และ schema เก็บเฉพาะ HN ได้แล้ว
- สถานะ: พร้อมทำ

### T-02 ตรวจยืนยันตัวตนก่อนเข้าถึงข้อมูล
- รองรับ: IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-02
- ไฟล์ที่แตะ: backend/app/auth/idp.py, backend/app/main.py, backend/app/booking/router.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: endpoint ที่เกี่ยวข้องปฏิเสธคำขอเมื่อผลยืนยันตัวตนไม่ผ่าน และใช้ actor_id จาก session ได้
- สถานะ: พร้อมทำ

### T-03 ค้น HN จาก HIS
- รองรับ: IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03
- ไฟล์ที่แตะ: backend/app/his/client.py, backend/app/booking/service.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: นักพัฒนาเรียก lookup โดยเลขบัตรแล้วได้ HN และไม่บันทึกเลขบัตรประชาชนใน database
- สถานะ: พร้อมทำ

### T-04 ดึงช่วงเวลาว่างและวัดประสิทธิภาพ
- รองรับ: FR-BKG-01, FR-BKG-06, NFR-PERF-01
- ตรวจด้วย: AC-BKG-05
- ไฟล์ที่แตะ: backend/app/slots/router.py, backend/app/slots/service.py, backend/tests/test_slots.py
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: GET /slots คืนรายการช่วงเวลาว่าง 30 วันข้างหน้า พร้อม remaining และ p95 รันได้ภายใต้ 200 user load
- สถานะ: พร้อมทำ

### T-05 สร้างการจองพื้นฐาน
- รองรับ: FR-BKG-04, IF-NOT-01
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: backend/app/booking/router.py, backend/app/booking/service.py, backend/tests/test_booking_basic.py
- ต้องทำหลัง: T-01, T-02, T-03, T-04
- เสร็จเมื่อ: POST /bookings บันทึกการจอง ตัด remaining และคืน queue_no พร้อมการจองที่สร้างแล้ว
- สถานะ: พร้อมทำ

### T-06 ป้องกันจองซ้ำวันเดียวกัน
- รองรับ: FR-BKG-02
- ตรวจด้วย: AC-BKG-02
- ไฟล์ที่แตะ: backend/app/booking/service.py, backend/tests/test_booking_duplicate.py
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: ผู้รับบริการที่มีคิวยังไม่ได้ใช้ในวันเดียวกัน จะถูกปฏิเสธและได้หมายเลขคิวเดิมตอบกลับ
- สถานะ: พร้อมทำ

### T-07 จัดการช่วงเต็มและเสนอ 3 ตัวเลือก
- รองรับ: FR-BKG-03
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: backend/app/booking/service.py, backend/app/slots/service.py, backend/tests/test_booking_full_slot.py
- ต้องทำหลัง: T-04, T-05
- เสร็จเมื่อ: โค้ดส่ง 409 พร้อมรายการ 3 ช่วงที่ว่าง ใกล้ 09.00 น. มากที่สุดภายในวันเดียวกันและวันถัดไป และไม่เกิดการจองซ้อน
- สถานะ: พร้อมทำ

### T-08 จัดการคิวแจ้งเตือนและส่งซ้ำ
- รองรับ: FR-BKG-05, IF-NOT-01, NFR-REL-02
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: backend/app/notify/queue.py, backend/app/booking/service.py, backend/tests/test_notification_retry.py
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: การส่งข้อความไม่สำเร็จไม่ลบการจอง, มีรายการค้างส่ง และส่งซ้ำภายใน 5 นาที
- สถานะ: พร้อมทำ

### T-09 บันทึก audit log ทุกการเข้าถึง
- รองรับ: DOM-PDPA-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: backend/app/audit/middleware.py, backend/app/db/models.py, backend/tests/test_audit_log.py
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: request ที่เข้าถึงข้อมูลการจองสร้าง audit log ที่มี actor_id, accessed_at, hn และเก็บได้อย่างน้อย 1 ปี
- สถานะ: พร้อมทำ

### T-10 สร้างหน้าเลือกแพ็กเกจและช่วงเวลา
- รองรับ: FR-BKG-01, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-10
- ไฟล์ที่แตะ: frontend/src/pages/SlotPicker.jsx, frontend/src/api/client.js, frontend/src/App.jsx
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: เลือกแพ็กเกจและเปลี่ยนแพ็กเกจแล้วหน้าจอโหลดช่วงเวลาว่างใหม่จาก API จำลองตามสัญญา
- สถานะ: พร้อมทำ

### T-11 สร้างหน้้ายืนยันและแสดงช่วงเต็ม
- รองรับ: FR-BKG-03
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: frontend/src/pages/ConfirmBooking.jsx, frontend/src/__tests__/AC-BKG-03.test.jsx
- ต้องทำหลัง: T-10
- เสร็จเมื่อ: เมื่อ API จำลองตอบ 409 หน้าจอแสดง "ช่วงเวลาเต็ม" พร้อม 3 ตัวเลือกที่ตรงกับช่วงว่างที่ใกล้ที่สุด
- สถานะ: พร้อมทำ

### T-12 ต่อหน้าจอกับ API จริง
- รองรับ: FR-BKG-01, FR-BKG-03
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-12
- ไฟล์ที่แตะ: frontend/src/api/client.js, frontend/src/pages/SlotPicker.jsx, frontend/src/pages/ConfirmBooking.jsx
- ต้องทำหลัง: T-04, T-07, T-10, T-11
- เสร็จเมื่อ: หน้าเลือกเวลาและหน้้ายืนยันเรียก API จริงได้โดยไม่ใช้ mock และแสดงผลพอดีกับ contract ของ backend
- สถานะ: พร้อมทำ

### T-13 กำหนดรูปแบบหมายเลขคิวและแสดงผล
- รองรับ: FR-BKG-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13
- ไฟล์ที่แตะ: backend/app/booking/service.py, backend/app/db/models.py, backend/app/booking/router.py
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: เลขคิวมีรูปแบบที่ได้รับคำตอบจาก Q-02 แล้วและแสดงในหน้าจอให้ผู้ใช้เห็นครบถ้วน
- สถานะ: รอ Q-02

## ตารางตรวจความครบ

### 1. AC ID | task ที่ตรวจ AC นี้
| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-BKG-01 | T-05 |
| AC-BKG-02 | T-06 |
| AC-BKG-03 | T-07, T-11 |
| AC-BKG-04 | T-08 |
| AC-BKG-05 | T-04 |
| AC-BKG-06 | T-09 |

### 2. Constraint ID | task ที่ทำให้เป็นจริง
| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-TECH-01 | T-01 |
| DOM-PDPA-01 | T-01, T-09 |
| IF-IDP-01 | T-02 |
| IF-HIS-01 | T-01, T-03 |
| IF-NOT-01 | T-05, T-08 |

## สิ่งที่ยังไม่ทำ
- Q-02: หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง และมีรูปแบบอย่างไร (เช่น A001)? -> ถามเจ้าหน้าที่เวชระเบียน
  - task ที่รออยู่: T-13
