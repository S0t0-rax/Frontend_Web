# 🔗 Guía de Integración Frontend Angular con Backend FastAPI

## 📡 Comunicación HTTP

### Configuración Base
El frontend está configurado para conectar a tu backend en:
```
URL Base: http://localhost:8000/api
```

Cambiar en: `src/environments/environment.ts`

## 🔐 Sistema de Autenticación

### 1. Login Flow

**Frontend (Angular):**
```typescript
// El usuario completa el formulario de login
this.authService.login({
  email: "usuario@example.com",
  password: "password123"
}).subscribe(response => {
  // Token almacenado automáticamente
  localStorage.setItem('auth_token', response.token);
});
```

**Backend (FastAPI) - Endpoint Requerido:**
```python
from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta
import jwt

router = APIRouter(prefix="/api/auth")
SECRET_KEY = "tu_clave_secreta_super_segura"

@router.post("/login")
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica usuario y retorna JWT token
    
    Esperado en el Request:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    # Generar JWT
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "location": user.location,
            "roles": [
                {
                    "id": role.id,
                    "name": role.name,
                    "permissions": [p.name for p in role.permissions]
                }
                for role in user.roles
            ]
        },
        "expiresIn": 86400
    }
```

### 2. Token Interceptor en Requests

**El frontend automáticamente agrega el token a cada petición:**
```
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend debe validar el token:**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthCredentials = Depends(security), db: Session = Depends(get_db)):
    """
    Valida el JWT token y retorna el usuario autenticado
    """
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return user
```

## 📋 Endpoints Requeridos - Especificación Completa

### 🔑 Autenticación

#### POST `/api/auth/register`
**Descripción:** Registrar nuevo usuario

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "phone": "+34 612 345 678",
  "location": "Madrid, España",
  "roleId": 3
}
```

**FastAPI:**
```python
@router.post("/register")
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    # Verificar que el email no exista
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    # Crear usuario
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        phone=user_data.phone,
        location=user_data.location
    )
    role = db.query(Role).filter(Role.id == user_data.roleId).first()
    new_user.roles.append(role)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generar token y retornar (igual que login)
    token = generate_jwt_token(new_user)
    return {"token": token, "user": format_user(new_user), "expiresIn": 86400}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "roles": [{"id": 3, "name": "user"}]
  },
  "expiresIn": 86400
}
```

#### POST `/api/auth/register-workshop`
**Descripción:** Registrar nuevo taller mecánico

**Request Body:**
```json
{
  "name": "Taller El Mecánico",
  "email": "taller@example.com",
  "password": "password123",
  "phone": "+34 612 345 678",
  "location": "Madrid, España",
  "capacity": 5,
  "services": [1, 2, 3]
}
```

**FastAPI:**
```python
@router.post("/register-workshop")
async def register_workshop(workshop_data: RegisterWorkshopRequest, db: Session = Depends(get_db)):
    # Crear usuario con rol de taller
    new_user = User(
        name=workshop_data.name,
        email=workshop_data.email,
        password=hash_password(workshop_data.password),
        phone=workshop_data.phone,
        location=workshop_data.location
    )
    
    # Asignar rol de taller (id=2, por ejemplo)
    workshop_role = db.query(Role).filter(Role.name == "Workshop").first()
    new_user.roles.append(workshop_role)
    
    db.add(new_user)
    db.flush()
    
    # Crear taller
    new_workshop = Workshop(
        user_id=new_user.id,
        name=workshop_data.name,
        email=workshop_data.email,
        phone=workshop_data.phone,
        location=workshop_data.location,
        capacity=workshop_data.capacity,
        current_load=0
    )
    
    db.add(new_workshop)
    
    # Agregar servicios
    for service_id in workshop_data.services:
        service = db.query(Service).filter(Service.id == service_id).first()
        if service:
            ws = WorkshopService(
                workshop_id=new_workshop.id,
                service_id=service_id,
                price=0,  # El taller puede actualizar estos precios después
                estimated_duration="2 horas"
            )
            db.add(ws)
    
    db.commit()
    db.refresh(new_user)
    
    token = generate_jwt_token(new_user)
    return {"token": token, "user": format_user(new_user), "expiresIn": 86400}
```

### 👤 Usuarios

#### GET `/api/users/me`
**Descripción:** Obtener datos del usuario autenticado

**FastAPI:**
```python
@router.get("/me")
async def get_current_user(current_user: User = Depends(get_current_user)):
    return format_user(current_user)
```

#### PUT `/api/users/me`
**Descripción:** Actualizar perfil del usuario

**Request Body:**
```json
{
  "name": "Juan Pérez Actualizado",
  "phone": "+34 612 345 679",
  "location": "Barcelona, España"
}
```

**FastAPI:**
```python
@router.put("/me")
async def update_profile(
    data: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.name:
        current_user.name = data.name
    if data.phone:
        current_user.phone = data.phone
    if data.location:
        current_user.location = data.location
    
    db.commit()
    db.refresh(current_user)
    return format_user(current_user)
```

#### POST `/api/users/change-password`
**Descripción:** Cambiar contraseña

**Request Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**FastAPI:**
```python
@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.oldPassword, current_user.password):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    
    if data.newPassword != data.confirmPassword:
        raise HTTPException(status_code=400, detail="Las contraseñas no coinciden")
    
    current_user.password = hash_password(data.newPassword)
    db.commit()
    
    return {"message": "Contraseña actualizada correctamente"}
```

#### GET `/api/users`
**Descripción:** Listar todos los usuarios (Solo Admin)

**FastAPI:**
```python
@router.get("")
async def list_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.has_role("Admin"):
        raise HTTPException(status_code=403, detail="No autorizado")
    
    users = db.query(User).all()
    return [format_user(u) for u in users]
```

### 🏪 Talleres

#### GET `/api/workshops`
**Descripción:** Listar todos los talleres

**FastAPI:**
```python
@router.get("/workshops")
async def get_workshops(db: Session = Depends(get_db)):
    workshops = db.query(Workshop).all()
    return [format_workshop(w) for w in workshops]
```

#### POST `/api/workshops/{id}/services`
**Descripción:** Agregar servicio a taller

**Request Body:**
```json
{
  "serviceId": 1,
  "price": 150.00,
  "estimatedDuration": "2 horas"
}
```

**FastAPI:**
```python
@router.post("/{workshop_id}/services")
async def add_service(
    workshop_id: int,
    service_data: AddServiceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workshop = db.query(Workshop).filter(Workshop.id == workshop_id, Workshop.user_id == current_user.id).first()
    if not workshop:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    ws = WorkshopService(
        workshop_id=workshop_id,
        service_id=service_data.serviceId,
        price=service_data.price,
        estimated_duration=service_data.estimatedDuration
    )
    db.add(ws)
    db.commit()
    
    return {"message": "Servicio agregado"}
```

### 🚨 Incidentes

#### POST `/api/incidents`
**Descripción:** Reportar nuevo incidente

**Request Body:**
```json
{
  "location": "Avenida Principal 123, Madrid",
  "description": "Mi coche tiene un ruido extraño en el motor",
  "photo": "base64_image_or_url",
  "carId": 1
}
```

**FastAPI:**
```python
@router.post("/incidents")
async def report_incident(
    incident_data: ReportIncidentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_incident = Incident(
        user_id=current_user.id,
        location=incident_data.location,
        description=incident_data.description,
        photo=incident_data.photo,
        car_id=incident_data.carId,
        status="pending",
        reported_at=datetime.utcnow()
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    
    # Llamar a IA para análisis (si está implementado)
    # analyze_incident_with_ai(new_incident)
    
    # Notificar a talleres cercanos
    # notify_nearby_workshops(new_incident)
    
    return format_incident(new_incident)
```

#### GET `/api/incidents/my-incidents`
**Descripción:** Obtener incidentes del usuario actual

**FastAPI:**
```python
@router.get("/my-incidents")
async def get_my_incidents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incidents = db.query(Incident).filter(Incident.user_id == current_user.id).all()
    return [format_incident(i) for i in incidents]
```

### 📅 Citas

#### POST `/api/appointments`
**Descripción:** Crear nueva cita

**Request Body:**
```json
{
  "incidentId": 1,
  "serviceId": 1,
  "mechanicId": 5,
  "appointmentDate": "2026-04-15T10:30:00Z"
}
```

**FastAPI:**
```python
@router.post("/appointments")
async def create_appointment(
    appointment_data: CreateAppointmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que el incidente pertenece al usuario
    incident = db.query(Incident).filter(Incident.id == appointment_data.incidentId).first()
    if not incident or incident.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    new_appointment = Appointment(
        incident_id=appointment_data.incidentId,
        service_id=appointment_data.serviceId,
        mechanic_id=appointment_data.mechanicId,
        appointment_date=appointment_data.appointmentDate,
        status="scheduled",
        arrival_status="en espera",
        service_status="en proceso"
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    
    return format_appointment(new_appointment)
```

## 🔄 Ejemplo Completo: Flujo de Reporte de Incidente

### 1. Frontend reporta incidente
```typescript
// report-incident.component.ts
this.incidentService.reportIncident({
  location: "Avenida Principal 123",
  description: "Mi auto no enciende",
  photo: null,
  carId: null
}).subscribe(incident => {
  console.log("Incidente reportado:", incident);
  // Redirigir a dashboard
});
```

### 2. Backend recibe y procesa
```python
# backend/routers/incidents.py
@router.post("/")
async def create_incident(
    incident_data: IncidentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Crear incidente
    incident = Incident(
        user_id=current_user.id,
        location=incident_data.location,
        description=incident_data.description,
        status="pending"
    )
    db.add(incident)
    db.commit()
    
    # Aquí podrías llamar a IA para análisis
    
    # Buscar talleres cercanos
    nearby_workshops = find_workshops_near(incident.location)
    
    # Enviar notificaciones a talleres
    for workshop in nearby_workshops:
        send_notification(workshop.email, incident)
    
    return incident
```

## ✅ Checklist de Implementación Backend

- [ ] Configurar CORS para permitir requests del frontend
- [ ] Implementar JWT authentication
- [ ] Crear endpoints de autenticación (login, register)
- [ ] Implementar endpoints de usuarios
- [ ] Implementar endpoints de talleres
- [ ] Implementar endpoints de servicios
- [ ] Implementar endpoints de incidentes
- [ ] Implementar endpoints de citas
- [ ] Implementar panel admin (endpoints para listar datos)
- [ ] Crear vista de historial de incidentes
- [ ] Crear vista de problemas frecuentes
- [ ] Crear vista de modelos con más problemas
- [ ] Crear vista de ubicaciones con más incidentes
- [ ] Validar entrada de datos
- [ ] Manejo de errores con mensajes claros
- [ ] Logging de eventos importantes

## 🔗 Variables de Entorno Sugeridas para FastAPI

```python
# .env
DATABASE_URL=postgresql://user:password@localhost/servmeca
SECRET_KEY=your_super_secret_key_change_this_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
API_TITLE=SERVMECA API
API_DESCRIPTION=Sistema de Auxilio y Reparación Automotriz
```

## 📊 Schema de Base de Datos (Resumen)

```sql
-- Roles
INSERT INTO roles (name) VALUES ('Admin'), ('Workshop'), ('User');

-- Permisos
INSERT INTO permissions (name) VALUES 
('manage_users'), ('manage_workshops'), ('manage_incidents'), ('view_analytics');

-- Servicios por defecto
INSERT INTO services (name) VALUES 
('Reparación de Motor'),
('Cambio de Aceite'),
('Reparación de Frenos'),
('Alineación'),
('Cambio de Llantas'),
('Reparación Eléctrica');
```

## 🚀 Deploy Recomendaciones

**Frontend:**
- Vercel o Netlify
- Configurar variables de entorno para API_URL

**Backend:**
- Railway, Heroku o DigitalOcean
- Configurar CORS con dominio de producción
- Usar variables de entorno seguras

## 📞 Debugging

Si hay errores de CORS, verifica:
1. El backend permite la URL del frontend
2. El método HTTP es correcto
3. Los headers son válidos

Si el token no se envía:
1. Verifica que localStorage tiene el token
2. Revisa la consola del navegador
3. Comprueba que el interceptor está activo
