from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
import auth
from database import get_db, engine

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Employee Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── AUTH ROUTES ────────────────────────────────────────────────────────────

@app.post("/api/signup", response_model=schemas.TokenResponse)
def signup(data: schemas.SignupRequest, db: Session = Depends(get_db)):
    # Create company
    company = models.Company(company_name=data.company_name)
    db.add(company)
    db.flush()

    # Check if email exists in this company (shouldn't since it's new, but safe check)
    existing = db.query(models.User).filter(
        models.User.email == data.email,
        models.User.company_id == company.id
    ).first()
    if existing:
        raise HTTPException(400, "Email already exists in this company")

    # Create admin user
    user = models.User(
        name=data.name,
        email=data.email,
        hashed_password=auth.get_password_hash(data.password),
        role=models.RoleEnum.admin,
        company_id=company.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.refresh(company)

    token = auth.create_access_token({
        "user_id": user.id,
        "company_id": user.company_id,
        "role": user.role.value
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
            "company_id": user.company_id,
            "company_name": company.company_name
        }
    }


@app.get("/api/companies")
def list_companies(db: Session = Depends(get_db)):
    companies = db.query(models.Company).all()
    return [{"id": c.id, "company_name": c.company_name} for c in companies]


@app.post("/api/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == data.email,
        models.User.company_id == data.company_id
    ).first()

    if not user or not auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    company = db.query(models.Company).filter(models.Company.id == user.company_id).first()

    token = auth.create_access_token({
        "user_id": user.id,
        "company_id": user.company_id,
        "role": user.role.value
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
            "company_id": user.company_id,
            "company_name": company.company_name if company else ""
        }
    }


# ─── DASHBOARD ──────────────────────────────────────────────────────────────

@app.get("/api/dashboard/stats")
def get_dashboard_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    cid = current_user.company_id

    total_employees = db.query(models.User).filter(
        models.User.company_id == cid,
        models.User.role == models.RoleEnum.employee
    ).count()

    pending_leaves = db.query(models.LeaveRequest).join(models.User).filter(
        models.User.company_id == cid,
        models.LeaveRequest.status == models.StatusEnum.pending
    ).count()

    unread = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).count()

    total_messages = db.query(models.Message).filter(
        models.Message.company_id == cid
    ).count()

    return {
        "total_employees": total_employees,
        "pending_leaves": pending_leaves,
        "unread_notifications": unread,
        "total_messages": total_messages
    }


# ─── EMPLOYEES ──────────────────────────────────────────────────────────────

@app.get("/api/employees", response_model=List[schemas.UserOut])
def get_employees(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    employees = db.query(models.User).filter(
        models.User.company_id == current_user.company_id,
        models.User.role == models.RoleEnum.employee
    ).all()
    return employees


@app.post("/api/employees", response_model=schemas.UserOut)
def create_employee(
    data: schemas.CreateEmployeeRequest,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    # Check duplicate in same company
    existing = db.query(models.User).filter(
        models.User.email == data.email,
        models.User.company_id == current_user.company_id
    ).first()
    if existing:
        raise HTTPException(400, "Email already exists in this company")

    employee = models.User(
        name=data.name,
        email=data.email,
        hashed_password=auth.get_password_hash(data.password),
        role=models.RoleEnum.employee,
        company_id=current_user.company_id
    )
    db.add(employee)
    db.flush()

    # Welcome message
    welcome_msg = models.Message(
        content=f"Welcome to the team, {data.name}! We're glad to have you.",
        sender_id=current_user.id,
        receiver_id=employee.id,
        company_id=current_user.company_id
    )
    db.add(welcome_msg)

    # Welcome notification
    notif = models.Notification(
        user_id=employee.id,
        content=f"Welcome! You've been added to {current_user.company.company_name}."
    )
    db.add(notif)

    db.commit()
    db.refresh(employee)
    return employee


@app.delete("/api/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    employee = db.query(models.User).filter(
        models.User.id == employee_id,
        models.User.company_id == current_user.company_id,
        models.User.role == models.RoleEnum.employee
    ).first()
    if not employee:
        raise HTTPException(404, "Employee not found")
    db.delete(employee)
    db.commit()
    return {"message": "Employee deleted"}


# ─── ADMIN INFO ─────────────────────────────────────────────────────────────

@app.get("/api/my-admin")
def get_my_admin(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    admin = db.query(models.User).filter(
        models.User.company_id == current_user.company_id,
        models.User.role == models.RoleEnum.admin
    ).first()
    if not admin:
        raise HTTPException(404, "Admin not found")
    return {"id": admin.id, "name": admin.name, "email": admin.email}


# ─── MESSAGES ───────────────────────────────────────────────────────────────

@app.get("/api/messages")
def get_messages(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == models.RoleEnum.admin:
        # Admin sees all company messages
        messages = db.query(models.Message).filter(
            models.Message.company_id == current_user.company_id
        ).order_by(models.Message.created_at.desc()).all()
    else:
        # Employee sees messages sent to them or broadcasts
        messages = db.query(models.Message).filter(
            models.Message.company_id == current_user.company_id,
            (models.Message.receiver_id == current_user.id) |
            (models.Message.receiver_id == None)
        ).order_by(models.Message.created_at.desc()).all()

    result = []
    for m in messages:
        sender = db.query(models.User).filter(models.User.id == m.sender_id).first()
        receiver = db.query(models.User).filter(models.User.id == m.receiver_id).first() if m.receiver_id else None
        result.append({
            "id": m.id,
            "content": m.content,
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "company_id": m.company_id,
            "created_at": m.created_at,
            "sender_name": sender.name if sender else "Unknown",
            "receiver_name": receiver.name if receiver else "All Employees"
        })
    return result


@app.post("/api/messages")
def send_message(
    data: schemas.SendMessageRequest,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    if data.receiver_id:
        # Validate receiver is in same company
        receiver = db.query(models.User).filter(
            models.User.id == data.receiver_id,
            models.User.company_id == current_user.company_id
        ).first()
        if not receiver:
            raise HTTPException(404, "Recipient not found in your company")

    msg = models.Message(
        content=data.content,
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        company_id=current_user.company_id
    )
    db.add(msg)
    db.flush()

    # Create notifications
    if data.receiver_id:
        notif = models.Notification(
            user_id=data.receiver_id,
            content=f"New message from {current_user.name}: {data.content[:60]}..."
        )
        db.add(notif)
    else:
        # Broadcast: notify all employees
        employees = db.query(models.User).filter(
            models.User.company_id == current_user.company_id,
            models.User.role == models.RoleEnum.employee
        ).all()
        for emp in employees:
            notif = models.Notification(
                user_id=emp.id,
                content=f"Broadcast from {current_user.name}: {data.content[:60]}..."
            )
            db.add(notif)

    db.commit()
    db.refresh(msg)
    return {"message": "Message sent", "id": msg.id}


# ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

@app.get("/api/notifications")
def get_notifications(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()
    return notifs


@app.patch("/api/notifications/{notif_id}/read")
def mark_read(
    notif_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(404, "Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@app.patch("/api/notifications/read-all")
def mark_all_read(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}


# ─── LEAVE REQUESTS ──────────────────────────────────────────────────────────

@app.get("/api/leaves")
def get_leaves(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == models.RoleEnum.admin:
        leaves = db.query(models.LeaveRequest).join(models.User).filter(
            models.User.company_id == current_user.company_id
        ).order_by(models.LeaveRequest.created_at.desc()).all()
    else:
        leaves = db.query(models.LeaveRequest).filter(
            models.LeaveRequest.user_id == current_user.id
        ).order_by(models.LeaveRequest.created_at.desc()).all()

    result = []
    for l in leaves:
        user = db.query(models.User).filter(models.User.id == l.user_id).first()
        result.append({
            "id": l.id,
            "user_id": l.user_id,
            "start_date": l.start_date,
            "end_date": l.end_date,
            "reason": l.reason,
            "status": l.status.value,
            "created_at": l.created_at,
            "user_name": user.name if user else "Unknown"
        })
    return result


@app.post("/api/leaves")
def create_leave(
    data: schemas.LeaveRequestCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    leave = models.LeaveRequest(
        user_id=current_user.id,
        start_date=data.start_date,
        end_date=data.end_date,
        reason=data.reason
    )
    db.add(leave)

    # Notify admin
    admin = db.query(models.User).filter(
        models.User.company_id == current_user.company_id,
        models.User.role == models.RoleEnum.admin
    ).first()
    if admin:
        notif = models.Notification(
            user_id=admin.id,
            content=f"{current_user.name} submitted a leave request ({data.start_date} to {data.end_date})"
        )
        db.add(notif)

    db.commit()
    db.refresh(leave)
    return {"message": "Leave request submitted", "id": leave.id}


@app.patch("/api/leaves/{leave_id}")
def update_leave_status(
    leave_id: int,
    data: schemas.UpdateLeaveStatus,
    current_user: models.User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    leave = db.query(models.LeaveRequest).join(models.User).filter(
        models.LeaveRequest.id == leave_id,
        models.User.company_id == current_user.company_id
    ).first()
    if not leave:
        raise HTTPException(404, "Leave request not found")

    if data.status not in ["approved", "rejected"]:
        raise HTTPException(400, "Status must be approved or rejected")

    leave.status = data.status

    # Notify employee
    notif = models.Notification(
        user_id=leave.user_id,
        content=f"Your leave request ({leave.start_date} to {leave.end_date}) has been {data.status}."
    )
    db.add(notif)
    db.commit()
    return {"message": f"Leave {data.status}"}


# ─── PROFILE ────────────────────────────────────────────────────────────────

@app.get("/api/me")
def get_me(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    company = db.query(models.Company).filter(models.Company.id == current_user.company_id).first()
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value,
        "company_id": current_user.company_id,
        "company_name": company.company_name if company else ""
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
