from __future__ import annotations

from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Time, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Slot(Base):
    __tablename__ = "slots"

    # รองรับ CON-TECH-01, FR-BKG-01, FR-BKG-06
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    package_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    remaining: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    bookings: Mapped[list["Booking"]] = relationship(back_populates="slot")


class Booking(Base):
    __tablename__ = "bookings"

    # รองรับ IF-HIS-01, FR-BKG-02, FR-BKG-04
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hn: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    slot_id: Mapped[int] = mapped_column(ForeignKey("slots.id"), nullable=False, index=True)
    booking_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    queue_no: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="booked")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    slot: Mapped[Slot] = relationship(back_populates="bookings")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    # รองรับ DOM-PDPA-01
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    actor_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    hn: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
