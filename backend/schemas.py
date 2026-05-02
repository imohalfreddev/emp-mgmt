from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Auth
class SignupRequest(BaseModel):
    company_name: str
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str
    company_id: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# Company
class CompanyOut(BaseModel):
    id: int
    company_name: str

    class Config:
        from_attributes = True


# User
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    company_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CreateEmployeeRequest(BaseModel):
    name: str
    email: str
    password: str


# Messages
class SendMessageRequest(BaseModel):
    content: str
    receiver_id: Optional[int] = None  # None = broadcast


class MessageOut(BaseModel):
    id: int
    content: str
    sender_id: int
    receiver_id: Optional[int] = None
    company_id: int
    created_at: Optional[datetime] = None
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None

    class Config:
        from_attributes = True


# Notifications
class NotificationOut(BaseModel):
    id: int
    user_id: int
    content: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Leave
class LeaveRequestCreate(BaseModel):
    start_date: str
    end_date: str
    reason: Optional[str] = None


class LeaveRequestOut(BaseModel):
    id: int
    user_id: int
    start_date: str
    end_date: str
    reason: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class UpdateLeaveStatus(BaseModel):
    status: str  # approved or rejected


# Stats
class DashboardStats(BaseModel):
    total_employees: int
    pending_leaves: int
    unread_messages: int
    total_messages: int
