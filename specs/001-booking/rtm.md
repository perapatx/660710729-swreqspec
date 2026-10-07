# RTM: จองคิวตรวจสุขภาพ (Booking)
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-07 08:33 | test: 5 ผ่าน 0 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-BKG-01 | AC-BKG-05 | T-02 | backend/app/slots/service.py: list_available_slots | backend/tests/test_AC_BKG_05.py::test_AC_BKG_05 (ผ่าน) | ช่องโหว่ |
| FR-BKG-02 | AC-BKG-02 | T-04 | backend/app/booking/service.py: create_booking | ไม่มี test | ยังไม่ถึง |
| FR-BKG-03 | AC-BKG-03 | T-05 | ไม่พบ | ไม่มี test | ยังไม่ถึง |
| FR-BKG-04 | AC-BKG-01 | T-03, T-06 | backend/app/booking/service.py: create_booking, backend/app/booking/router.py: create_booking | backend/tests/test_AC_BKG_01.py::test_AC_BKG_01 (ผ่าน) | รอ Q-xx |
| FR-BKG-05 | AC-BKG-04 | T-07 | ไม่พบ | ไม่มี test | ยังไม่ถึง |
| FR-BKG-06 | ไม่มี AC | T-10, T-12 | backend/app/slots/service.py: list_available_slots (กรอง package_code) | ไม่มี test | ยังไม่ถึง |
| NFR-PERF-01 | AC-BKG-05 | T-02 | backend/app/slots/service.py: list_available_slots | backend/tests/test_AC_BKG_05.py::test_AC_BKG_05 (ผ่าน) | ครบ |
| NFR-SEC-01 | ไม่มี AC | ไม่มี task | ไม่พบ | ไม่มี test | ยังไม่ถึง |
| NFR-REL-02 | AC-BKG-04 | T-07 | ไม่พบ | ไม่มี test | ยังไม่ถึง |
| NFR-USE-01 | ไม่มี AC | ไม่มี task | ไม่พบ | ไม่มี test | ยังไม่ถึง |
| CON-TECH-01 | ไม่มี AC | T-01 | backend/app/config.py, backend/app/db/session.py, backend/app/db/migrations/001_init.py | backend/tests/test_T01_schema.py::test_T01_tables_created (ผ่าน) | ครบ |
| DOM-PDPA-01 | AC-BKG-06 | T-01, T-08 | backend/app/db/models.py: AuditLog (ตาราง) | ไม่มี test | ยังไม่ถึง |
| IF-IDP-01 | AC-BKG-01 | T-03 | backend/app/auth/idp.py: get_verified_hn | backend/tests/test_AC_BKG_01.py::test_AC_BKG_01 (ผ่าน) | ครบ |
| IF-HIS-01 | ไม่มี AC | T-01, T-09 | backend/app/db/models.py: Booking (เก็บ hn เฉพาะ, ไม่มี national_id) | backend/tests/test_T01_schema.py::test_T01_no_national_id (ผ่าน) | ยังไม่ถึง |
| IF-NOT-01 | AC-BKG-04 | T-07 | ไม่พบ | ไม่มี test | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| backend/app/slots/router.py: GET /slots | FR-BKG-01, FR-BKG-06 | ไม่ครบ | โค้ดกรอง slot_date และ remaining > 0 แต่กำหนด Days Ahead = 14 เท่านั้น ไม่ตรงกับสเปค 30 วัน และไม่มีการทดสอบ 30 วันใน AC |
| backend/app/booking/router.py: POST /bookings | FR-BKG-04, IF-IDP-01 | บางส่วน | รับข้อมูล slot_id และ national_id แล้ว log national_id ซึ่งเข้าข่ายข้อมูลผลัดอันตราย และยังไม่มี handling ของ Q-02 หรือการแสดงคิวแบบสากล |
| backend/app/booking/service.py: create_booking | FR-BKG-04 | ครึ่งหนึ่ง | ตรวจ remaining <= 0 และสร้าง booking แล้ว แต่ format ของ queue_no ยังขึ้นกับ Q-02; สัญญาแสดงคิวจึงยังไม่ได้ชัดเจน |
| backend/app/db/models.py: Booking, AuditLog | IF-HIS-01, DOM-PDPA-01 | บางส่วน | Booking ไม่มี national_id ตาม Constraint แต่ booking/router.py ยัง log national_id และรับข้อมูลดังกล่าว ทำให้มีความเสี่ยงเรื่องข้อมูลสุขภาพ |
| backend/app/slots/service.py: list_available_slots | FR-BKG-01, FR-BKG-06 | บางส่วน | เรียก package_code กับ remaining > 0 ได้ แต่จำนวนวันที่แสดงและการเลือก 3 ช่วงใกล้เคียงที่ต้องแจ้งยังไม่มี implementation |
| backend/tests/test_AC_BKG_01.py: test_AC_BKG_01 | AC-BKG-01 | ไม่เต็ม | test นี้ assert status 201 อย่างเดียว ไม่ตรวจว่า remaining ลดเป็น 0 หรือแสดง queue_no ตาม Then ของ AC |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | ตัวเลขไม่ตรง spec | backend/app/slots/service.py: DAYS_AHEAD = 14 | FR-BKG-01 | spec ระบุแสดงช่วงเวลาภายใน 30 วันข้างหน้า แต่โค้ดระบุ 14 วันเท่านั้น จึงไม่ตรงกับ requirement และอาจทำให้แสดงช่วงไม่ครบ |  |
| F-002 | FR ไม่มี AC | backend/app/slots/service.py: list_available_slots | FR-BKG-06 | FR-BKG-06 อธิบายการคำนวณช่วงใหม่เมื่อเปลี่ยนแพ็กเกจ แต่ spec ไม่มี AC ที่ตรวจเรื่องนี้ จึงเป็นช่องโหว่ของความครอบคลุม |  |
| F-003 | ละเมิด Constraint | backend/app/booking/router.py: BookingRequest, logger.info | IF-HIS-01, DOM-PDPA-01 | โค้ดรับฟิลด์ national_id และ log national_id ลง log แม้ spec ระบุว่าต้องไม่เก็บเลขบัตรประชาชนในตารางการจอง และต้องปกป้องข้อมูลสุขภาพ |  |
| F-004 | test อ่อน | backend/tests/test_AC_BKG_01.py::test_AC_BKG_01 | AC-BKG-01 | test ตรวจแค่ status 201 เท่านั้น ไม่ตรวจว่า remaining ลดเป็น 0 และไม่ตรวจว่ามีการแสดงหมายเลขคิว ตาม Then ของ AC |  |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
