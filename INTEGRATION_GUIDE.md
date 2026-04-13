# SERVMECA - Frontend Angular + Tailwind

## 📋 Descripción
Frontend profesional en Angular 21 con Tailwind CSS para un sistema de auxilio y reparación automotriz. La aplicación permite:
- Registro e inicio de sesión de usuarios
- Registro de talleres mecánicos
- Reporte de incidentes
- Gestión de citas de reparación
- Panel administrativo para gestión del sistema
- Panel de gestión para talleres

## 🎯 Casos de Uso Implementados
✅ Registrarse
✅ Iniciar sesión
✅ Cambiar contraseña
✅ Cerrar sesión
✅ Panel administrativo (ver datos de talleres y usuarios)
✅ Talleres pueden modificar sus datos
✅ Reporte de incidentes
✅ Gestión de citas

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Protege rutas autenticadas
│   │   │   └── role.guard.ts           # Protege por rol de usuario
│   │   ├── interceptors/
│   │   │   └── token.interceptor.ts    # Inyecta token en headers
│   │   ├── models/
│   │   │   ├── user.model.ts           # Modelos de usuario/auth
│   │   │   ├── workshop.model.ts       # Modelos de taller
│   │   │   ├── service.model.ts        # Modelos de servicios
│   │   │   ├── incident.model.ts       # Modelos de incidentes
│   │   │   └── api.model.ts            # Modelos de respuesta API
│   │   └── services/
│   │       ├── auth.service.ts         # Autenticación
│   │       ├── api.service.ts          # Cliente HTTP
│   │       ├── user.service.ts         # Operaciones de usuario
│   │       ├── workshop.service.ts     # Operaciones de taller
│   │       └── incident.service.ts     # Operaciones de incidente
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login.component.ts
│   │   │   ├── register.component.ts
│   │   │   ├── register-workshop.component.ts
│   │   │   └── change-password.component.ts
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   ├── report-incident.component.ts
│   │   │   ├── my-incidents.component.ts
│   │   │   └── my-appointments.component.ts
│   │   ├── admin/
│   │   │   └── admin-panel.component.ts
│   │   └── workshop/
│   │       └── workshop-management.component.ts
│   ├── shared/
│   │   └── components/
│   │       ├── navbar.component.ts
│   │       ├── footer.component.ts
│   │       └── loader.component.ts
│   ├── app.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.html
│   └── app.css
├── environments/
│   ├── environment.ts                  # Desarrollo
│   └── environment.prod.ts             # Producción
└── main.ts
```

## 🚀 Instalación

### Requisitos
- Node.js 20+
- npm 10+
- Angular CLI 21+

### Pasos de Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar la URL del API:**
Edita [src/environments/environment.ts](src/environments/environment.ts) con la URL de tu backend:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'  // Tu URL del backend
};
```

3. **Ejecutar el servidor de desarrollo:**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## 🔗 Integración con FastAPI Backend

### Configuración CORS en FastAPI
Tu backend debe permitir CORS para que el frontend pueda comunicarse. Agrega esto a tu FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",        # Desarrollo
        "http://localhost:3000",        # Alternativo
        "https://tudominio.com"         # Producción
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Endpoints Requeridos en FastAPI

El backend debe implementar los siguientes endpoints:

#### **Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/register-workshop` - Registrar taller
- `POST /api/auth/change-password` - Cambiar contraseña

**Respuesta esperada:**
```json
{
  "token": "jwt_token_aqui",
  "user": {
    "id": 1,
    "name": "Usuario",
    "email": "user@example.com",
    "phone": "123456789",
    "location": "Ciudad",
    "roles": [
      {
        "id": 1,
        "name": "user",
        "permissions": []
      }
    ]
  },
  "expiresIn": 3600
}
```

#### **Usuarios**
- `GET /api/users/me` - Obtener usuario actual
- `PUT /api/users/me` - Actualizar perfil
- `POST /api/users/change-password` - Cambiar contraseña
- `GET /api/users` - Listar todos los usuarios (Admin)
- `GET /api/users/{id}` - Obtener usuario por ID

#### **Talleres**
- `GET /api/workshops` - Listar todos los talleres
- `GET /api/workshops/{id}` - Obtener taller por ID
- `POST /api/workshops` - Crear taller
- `PUT /api/workshops/{id}` - Actualizar taller
- `DELETE /api/workshops/{id}` - Eliminar taller
- `GET /api/workshops/me` - Obtener taller del usuario actual
- `GET /api/workshops/nearby?lat=X&lng=Y&radius=Z` - Talleres cercanos
- `GET /api/workshops/{id}/services` - Servicios del taller
- `POST /api/workshops/{id}/services` - Agregar servicio
- `DELETE /api/workshops/{id}/services/{serviceId}` - Remover servicio

#### **Servicios**
- `GET /api/services` - Listar todos los servicios

#### **Incidentes**
- `POST /api/incidents` - Reportar incidente
- `GET /api/incidents` - Listar todos (Admin)
- `GET /api/incidents/{id}` - Obtener incidente
- `GET /api/incidents/my-incidents` - Mis incidentes
- `PATCH /api/incidents/{id}` - Actualizar estado

#### **Citas**
- `POST /api/appointments` - Crear cita
- `GET /api/appointments` - Listar todas (Admin)
- `GET /api/appointments/{id}` - Obtener cita
- `GET /api/appointments/my-appointments` - Mis citas
- `GET /api/appointments/mechanic-appointments` - Citas del mecánico
- `PATCH /api/appointments/{id}` - Actualizar estado
- `DELETE /api/appointments/{id}` - Cancelar cita

### Ejemplo: Implementar Endpoint de Login en FastAPI

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict
    expiresIn: int

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Tu lógica de autenticación aquí
    user = await authenticate_user(request.email, request.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # Generar JWT
    payload = {
        "sub": user.id,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, "tu_secret_key", algorithm="HS256")
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "roles": user.roles
        },
        "expiresIn": 3600
    }
```

## 🔐 Autenticación

### Flujo de Autenticación
1. Usuario inicia sesión → Backend retorna JWT
2. JWT se almacena en localStorage
3. Cada petición HTTP incluye el token en el header `Authorization: Bearer {token}`
4. Backend valida el token

El **TokenInterceptor** automáticamente agrega el token a todas las peticiones.

### Logout
El logout simplemente limpia el token del localStorage y redirige a login.

## 📊 Modelos de Datos por Escenario

### Registro de Usuario
```typescript
{
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  roleId: number; // 3 para usuario regular
}
```

### Registro de Taller
```typescript
{
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  capacity: number;
  services: number[]; // Array de IDs de servicios
}
```

### Reporte de Incidente
```typescript
{
  location: string;
  description: string;
  photo?: string;
  carId?: number;
}
```

### Crear Cita
```typescript
{
  incidentId: number;
  serviceId: number;
  mechanicId: number;
  appointmentDate: Date;
}
```

## 🎨 Personalización

### Cambiar Colores Primarios
Los colores se definen en los componentes usando clases de Tailwind:
- `bg-blue-600` - Color primario (azul)
- `bg-green-600` - Color secundario (verde para talleres)
- `bg-purple-600` - Color de acentos

Busca estas clases en los componentes y reemplázalas según tus necesidades.

### Agregar Nuevas Rutas
Edita [src/app/app.routes.ts](src/app/app.routes.ts) y agrega nuevas rutas:

```typescript
{
  path: 'nueva-ruta',
  component: NuevoComponente,
  canActivate: [AuthGuard]
}
```

## 🧪 Testing

```bash
# Ejecutar pruebas
npm test

# Con cobertura
npm test -- --code-coverage
```

## 📦 Construcción para Producción

```bash
ng build --configuration production
```

Los archivos compilados estarán en `dist/` listos para deployar.

## 🐛 Solución de Problemas

### Error: "Cannot find module 'environment'"
Asegúrate de que el archivo está en `src/environments/environment.ts`

### CORS Error
Verifica que tu backend permite CORS desde la URL del frontend

### Token no se envía
Revisa que el `TokenInterceptor` esté correctamente configurado en `app.config.ts`

### Rutas protegidas no funcionan
Verifica que `AuthGuard` esté aplicado correctamente en las rutas

## 📚 Recursos Adicionales

- [Angular Documentation](https://angular.io/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [RxJS Documentation](https://rxjs.dev/)

## 📝 Casos de Uso Detallados

### 1. Registro de Usuario
1. Usuario va a `/register`
2. Completa el formulario
3. Frontend envía `POST /api/auth/register`
4. Backend crea usuario y retorna token
5. Frontend almacena token y redirige a `/dashboard`

### 2. Registro de Taller
1. Taller va a `/register-workshop`
2. Completa datos del taller y selecciona servicios
3. Frontend envía `POST /api/auth/register-workshop`
4. Backend crea usuario con rol "Workshop" y taller
5. Taller redirigido a `/dashboard`

### 3. Reporte de Incidente
1. Usuario inicia sesión
2. Va a `/report-incident`
3. Completa formulario con ubicación y descripción
4. Frontend envía `POST /api/incidents`
5. Backend crea incidente y analiza automáticamente
6. Se notifica a talleres cercanos

### 4. Panel Administrativo
1. Admin inicia sesión
2. Accede a `/admin`
3. Puede ver:
   - Lista de talleres registrados
   - Todos los incidentes de usuarios
   - Todos los usuarios del sistema

### 5. Gestión de Taller
1. Taller inicia sesión
2. Accede a `/workshop`
3. Puede:
   - Actualizar información del taller
   - Actualizar lista de servicios
   - Ver citas asignadas

## 🚢 Deploy

### Vercel
```bash
npm install -g vercel
vercel
```

### Netify
1. Conectar con GitHub
2. Build command: `ng build --configuration production`
3. Publish directory: `dist/`

## 📞 Soporte
Para issues o preguntas, contacta al desarrollador.
