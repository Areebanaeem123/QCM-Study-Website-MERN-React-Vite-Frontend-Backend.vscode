from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class Slider(Base):
    __tablename__ = "sliders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=True)
    image_url = Column(String, nullable=False)
    button_text = Column(String, nullable=True)
    button_link = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
