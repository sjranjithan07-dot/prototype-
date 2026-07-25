from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
import datetime

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    
    sessions = relationship("InterviewSession", back_populates="user")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    
    # Final Scores
    overall_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    eye_contact_score = Column(Float, nullable=True)
    
    # Raw Data
    transcript = Column(JSON, nullable=True) # Store Q&A
    ai_feedback = Column(JSON, nullable=True) # Detailed AI suggestions
    
    user = relationship("User", back_populates="sessions")
    metrics = relationship("Metrics", back_populates="session")

class Metrics(Base):
    """Time-series tracking of physical metrics during the interview."""
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # MediaPipe Values
    eye_contact_detected = Column(Float) # e.g. 1.0 for yes, 0.0 for no
    smile_detected = Column(Float)
    head_pitch = Column(Float)
    head_yaw = Column(Float)
    head_roll = Column(Float)
    
    session = relationship("InterviewSession", back_populates="metrics")
