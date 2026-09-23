# รองรับ CON-TECH-01, DOM-PDPA-01, IF-HIS-01
from app.db.models import Base


def upgrade(engine):
    Base.metadata.create_all(bind=engine)


def downgrade(engine):
    Base.metadata.drop_all(bind=engine)
