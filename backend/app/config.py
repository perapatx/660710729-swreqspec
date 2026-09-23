import os

# รองรับ CON-TECH-01: DATABASE_URL ถูกอ่านจาก environment และยังมีค่าเริ่มต้นสำหรับ local/dev
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///booking.db")
