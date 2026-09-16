# แผนการพัฒนาฟีเจอร์ จองคิวตรวจสุขภาพ (Booking)

## 1. สรุปแนวทาง
- ฟีเจอร์นี้ทำหน้าที่ให้ผู้รับบริการที่ยืนยันตัวตนแล้วเลือกแพ็กเกจ วัน และช่วงเวลาตรวจสุขภาพ เพื่อให้ได้หมายเลขคิวและยืนยันการจองภายใน 3 นาที ตาม FR-BKG-01 ถึง FR-BKG-06
- ผู้ใช้หลักคือผู้รับบริการที่ผ่านกระบวนการยืนยันตัวตนแล้ว และเจ้าหน้าที่เวชระเบียน/ทีมงานที่ติดตามผลการดำเนินงานของระบบการจอง
- แนวทางคือแยกชั้นข้อมูลและการประมวลผลเป็น 3 ส่วนหลัก: ชั้นหน้าเว็บสำหรับแสดงช่วงเวลา/เลือกคิว, ชั้นบริการสำหรับตรวจสอบสิทธิ์และความพร้อมของช่วงเวลา, และชั้นข้อมูลสำหรับเก็บการจองและ audit log
- ระบบจะตรวจสถานะคิวห้ามซ้ำในวันเดียวกันก่อนบันทึก, จัดการช่วงเวลาที่เต็มด้วยข้อความและตัวเลือก 3 ช่องทาง, และคงการจองไว้แม้ SMS/LINE ส่งไม่สำเร็จ
- สำหรับการส่งข้อความยืนยันจะใช้ queue แบบ asynchronous เพื่อให้การจองไม่รอผลส่งข้อความและยังคงบันทึกการจองไว้ตาม FR-BKG-05 และ NFR-REL-02

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| MySQL | CON-TECH-01 | ใช้เป็นฐานข้อมูลหลักสำหรับการบันทึกการจอง คิว และ audit log |
| React (Vite) | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับหน้าเลือกแพ็กเกจ วัน และช่วงเวลา จัดการ UI ที่ไม่ว่างเป็นสีเทาและไม่คลิกได้ |
| Python FastAPI | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เป็นบริการ API สำหรับ validation การจอง, คำนวณช่วงว่าง, และจัดการ queue ส่งข้อความ |
| Redis / message queue หรือ equivalent | IF-NOT-01 | สำหรับ queue ส่งข้อความยืนยันแบบ asynchronous และ retry ตาม NFR-REL-02 |
| TLS 1.2+ | NFR-SEC-01 | ใช้ TLS ผ่านทาง HTTP/API ระหว่าง client และ backend |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ FR / Constraint |
|---|---|---|
| PatientProfile | patient_id, hn, verified_status, verified_at, citizen_id_ref (เฉพาะชั่วคราวในการ lookup ไม่เก็บต่อเนื่อง) | รองรับ IF-IDP-01, IF-HIS-01; ไม่มีการเก็บเลขบัตรประชาชนในตารางการจอง |
| Booking | booking_id, patient_hn, package_id, booking_date, slot_id, queue_number, status, created_at, confirmed_at, last_updated_at | รองรับ FR-BKG-02, FR-BKG-04, FR-BKG-05; สถานะ เช่น pending, confirmed, cancelled, expired |
| BookingSlot | slot_id, date, start_time, end_time, package_id, capacity, remaining_seats, is_available, version | รองรับ FR-BKG-01, FR-BKG-03, FR-BKG-06 |
| BookingAuditLog | audit_id, actor_user_id, accessed_hn, accessed_at, resource_type, action_name | รองรับ DOM-PDPA-01; เก็บไม่น้อยกว่า 1 ปี |
| NotificationJob | job_id, booking_id, status, attempts, max_attempts, next_retry_at, last_error, created_at | รองรับ FR-BKG-05, NFR-REL-02, IF-NOT-01 |
| Package | package_id, name, description, valid_from, valid_to | รองรับ FR-BKG-06 |

หมายเหตุ: ตาราง Booking จะไม่เก็บ `citizen_id` หรือเลขบัตรประชาชนตาม IF-HIS-01 และจะอ้างอิง `patient_hn` แทนหลังจากค้นหาจาก HIS ด้วยเลขบัตรประชาชนแล้ว

## 4. API / หน้าจอ

| รายการ | รายละเอียด | รองรับ FR |
|---|---|---|
| GET /api/slots?dateFrom=&dateTo=&packageId= | คืนข้อมูลช่วงเวลาว่างภายใน 30 วันพร้อมจำนวนที่นั่งคงเหลือ และสถานะว่าง/ไม่ว่าง | FR-BKG-01 |
| GET /api/packages | ดึงแพ็กเกจที่มีให้เลือก | FR-BKG-06 |
| POST /api/bookings/validate | ตรวจว่าผู้รับบริการมีคิวในวันเดียวกันหรือไม่ และตรวจความพร้อมของช่วงเวลาที่เลือก | FR-BKG-02, FR-BKG-03 |
| POST /api/bookings | สร้างรายการจอง, ออกหมายเลขคิว, บันทึกบันทึกการจอง และส่งคำขอไปยัง notification queue | FR-BKG-04 |
| POST /api/bookings/{id}/retry | เรียกใช้สำหรับ retry การส่งข้อความยืนยัน เฉพาะกรณีข้อความไม่สำเร็จ | FR-BKG-05, NFR-REL-02 |
| GET /api/bookings/{id}/queue-number | ดึงหมายเลขคิวที่จองแล้วสำหรับแสดงบนหน้า UI | FR-BKG-02, FR-BKG-05 |
| UI: หน้าเลือกแพ็กเกจ | ให้ผู้ใช้เลือกแพ็กเกจและระบุวันที่/ช่วงเวลา | FR-BKG-01, FR-BKG-06 |
| UI: หน้าแสดงช่วงเวลา | แสดงช่วงว่าง/ไม่ว่างแบบสี่เหลี่ยม/สีเทา และปิดการคลิกช่วงที่ไม่ว่าง | FR-BKG-01 |
| UI: หน้ายืนยันการจอง | แสดงสรุปการจอง, ข้อความเต็มช่วงเวลา หากมี และผลการจองสำเร็จ/ล้มเหลว | FR-BKG-03, FR-BKG-04, FR-BKG-05 |

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-TECH-01 | MySQL ถูกกำหนดเป็นฐานข้อมูลหลักสำหรับ Booking, BookingSlot, NotificationJob และ Audit Log | ใช้แล้ว |
| DOM-PDPA-01 | AuditLog table และ middleware ตรวจสอบการเข้าถึงข้อมูลผู้รับบริการ พร้อมบันทึก actor, time, accessed_hn | ใช้แล้ว |
| IF-IDP-01 | ขั้น validation/guard สำหรับผู้รับบริการก่อนเข้าถึงข้อมูลการจองหรือข้อมูลหมอ/ข้อมูล HN | ใช้แล้ว |
| IF-HIS-01 | PatientProfile หรือ lookup service ใช้ HN จาก HIS หลังยืนยันเลขบัตรประชาชน และไม่เก็บเลขบัตรประชาชนใน Booking | ใช้แล้ว |
| IF-NOT-01 | NotificationJob + queue แบบ asynchronous ให้การจองไม่รอผลส่งข้อความ | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-BKG-01 | test_AC_BKG_01_booking_success_reduces_capacity | ตั้งค่า slot 09.00 มีที่นั่ง 1 ที่, ทำการยืนยันการจอง แล้วตรวจว่าบันทึก Booking สำเร็จ, แสดงหมายเลขคิว และ remaining_seats = 0 |
| AC-BKG-02 | test_AC_BKG_02_duplicate_booking_same_day_blocked | ตั้งค่าผู้รับบริการมีคิวที่ยังไม่ได้ใช้ในวันเดียวกัน แล้วลองจองใหม่ในวันเดิม ตรวจว่าระบบปฏิเสธและแสดงหมายเลขคิวเดิม |
| AC-BKG-03 | test_AC_BKG_03_full_slot_offers_alternatives | ตั้งค่า slot ที่เลือกเหลือ 1 ที่ และมีผู้ใช้อีกคนยืนยันก่อนแล้ว ทำการยืนยันจากผู้ใช้ใหม่ ตรวจว่ามีข้อความ “ช่วงเวลาเต็ม” และมี 3 ตัวเลือกใกล้เคียง พร้อมไม่มีการจองซ้อน |
| AC-BKG-04 | test_AC_BKG_04_notification_retry_three_times_then_stop | จำลอง provider ส่งไม่ตอบสนอง ทำการยืนยันจองแล้วตรวจว่า Booking ถูกบันทึก, queue retry ถูกสร้าง, ส่งซ้ำสูงสุด 3 ครั้งภายใน 10 นาที และคงการจองไว้เมื่อ stop |
| AC-BKG-05 | test_AC_BKG_05_slot_lookup_p95_under_2s | จำลองผู้ใช้พร้อมกัน 200 คน เรียก GET /api/slots แล้ววัด p95 ของเวลา response ต้อง <= 2 วินาที |
| AC-BKG-06 | test_AC_BKG_06_audit_log_written | เมื่อมีการเปิดดูข้อมูลการจอง ตรวจสอบว่าได้บันทึก audit log ที่มี actor, timestamp และ accessed_hn หรือรหัสผู้รับบริการ |

## 7. ลำดับงาน

1. สร้าง schema ฐานข้อมูลสำหรับ Booking, BookingSlot, AuditLog, NotificationJob และ Package ตาม FR-BKG-01, FR-BKG-04, DOM-PDPA-01 (AC-BKG-01, AC-BKG-06)
2. สร้าง API ดึงข้อมูลแพ็กเกจและช่วงเวลา พร้อมการคำนวณจำนวนที่นั่งคงเหลือและแสดงช่วงที่ไม่ว่างเป็นสีเทา ตาม FR-BKG-01 และ AC-BKG-05
3. สร้าง validation service สำหรับตรวจคิวซ้ำในวันเดียวกันและการปฏิเสธการจองตาม FR-BKG-02 และ AC-BKG-02
4. สร้าง flow ยืนยันการจอง พร้อมการจัดการ race condition เมื่อ slot เหลือ 1 ที่ ตาม FR-BKG-03, FR-BKG-04 และ AC-BKG-03
5. สร้าง notification queue และ retry policy สูงสุด 3 ครั้งใน 10 นาที พร้อมคงข้อมูลการจองไว้ตาม FR-BKG-05, NFR-REL-02 และ AC-BKG-04
6. สร้าง UI หน้าเลือกแพ็กเกจ/วัน/ช่วงเวลาและหน้าสรุปผลการจอง พร้อมการแสดงสีเทาเมื่อไม่ว่าง ตาม FR-BKG-01 และ FR-BKG-03
7. เพิ่ม audit log ในทุกการเข้าถึงข้อมูลผู้รับบริการ และตรวจสอบความครบถ้วนของข้อมูลตาม DOM-PDPA-01 และ AC-BKG-06
8. ทดสอบครบทุก AC และตรวจประสิทธิภาพการค้นหาช่วงว่างตาม NFR-PERF-01 ก่อนยืนยันความพร้อมใช้งาน

## 8. สิ่งที่ยังไม่ทำ
- Q-01: “ช่วงเวลาใกล้เคียง” นับเฉพาะวันเดียวกัน หรือรวมวันถัดไปด้วย? -> ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ
- Q-02: หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง? -> ส่วนที่เกี่ยวข้องกับข้อนี้จะยังไม่สร้างจนกว่าจะได้คำตอบ

หมายเหตุ: ในข้อนี้ยังไม่ได้ตัดสินใจแทนทีมตาม Open Questions และจะรอคำตอบจากผู้มีหน้าที่กำหนดก่อนดำเนินการออกแบบเชิงลึกต่อไป
