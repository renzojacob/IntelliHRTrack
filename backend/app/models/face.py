from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base


class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), index=True, nullable=False)
    embedding = Column(Text, nullable=False)  # JSON serialized list of floats
    created_at = Column(DateTime(timezone=True), server_default=func.now())
