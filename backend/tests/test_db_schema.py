from sqlalchemy import create_engine, inspect

from app.db.models import Base, AuditLog, Booking, Slot


def test_schema_supports_booking_constraints():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)

    assert "slots" in inspector.get_table_names()
    assert "bookings" in inspector.get_table_names()
    assert "audit_logs" in inspector.get_table_names()

    booking_columns = {col["name"] for col in inspector.get_columns("bookings")}
    assert "hn" in booking_columns
    assert "national_id" not in booking_columns

    slot_columns = {col["name"] for col in inspector.get_columns("slots")}
    assert "remaining" in slot_columns
    assert "package_code" in slot_columns

    audit_columns = {col["name"] for col in inspector.get_columns("audit_logs")}
    assert "actor_id" in audit_columns
    assert "hn" in audit_columns
    assert "accessed_at" in audit_columns

    assert Slot.__tablename__ == "slots"
    assert Booking.__tablename__ == "bookings"
    assert AuditLog.__tablename__ == "audit_logs"
