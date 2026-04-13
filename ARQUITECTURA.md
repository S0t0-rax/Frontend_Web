# 🏗️ Arquitectura del Sistema SERVMECA

## 📐 Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────────┐
│                      USUARIO EN NAVEGADOR                        │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Angular App   │
                    │  (localhost:4200)│
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼────────┐   ┌──────▼──────┐   ┌────────▼────┐
    │ Components │   │  Services   │   │   Routing   │
    │ (14)       │   │  (5)        │   │             │
    └──────────────┘   └──────┬──────┘   └─────────────┘
                             │
                    ┌────────▼────────┐
                    │ HTTP Interceptor│
                    │  + Auth Guard   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────────┐
                    │  HTTP Client       │
                    │  /api/auth         │
                    │  /api/users        │
                    │  /api/workshop     │
                    │  /api/incidents    │
                    │  /api/appointments │
                    └────────┬──────────┘
                             │
           ┌─────────────────┴──────────────────┐
           │        INTERNET (CORS)             │
           └─────────────────┬──────────────────┘
                             │
                    ┌────────▼────────┐
                    │  FastAPI (8000) │
                    │  tu.backend.com │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼────────┐   ┌──────▼──────┐   ┌────────▼────┐
    │ Auth Routes│   │ User Routes │   │ Other Routes│
    │  /login    │   │  /users/me  │   │ /workshops  │
    │  /register │   │  /incidents │   │ /incidents  │
    └────────────┘   └──────┬──────┘   └────────┬────┘
                             │                    │
                    ┌────────▼────────────────────▼──┐
                    │   PostgreSQL Database          │
                    │   (Tú tienes el schema)        │
                    └────────────────────────────────┘
```

## 🔄 Flujo de Autenticación Detallado

```
USUARIO                   FRONTEND                    BACKEND
  │                         │                          │
  ├──(1) Ingresa email/pass ──>                       │
  │                         │                          │
  │    ┌──────────────────────>──(2) POST /api/auth/login
  │    │                    │                          │
  │    │                    │  (3) Valida credenciales │
  │    │                    │  (4) Genera JWT          │
  │    │                    │<────────────────────────┤
  │    │                    │  {token, user}          │
  │    │                    │                          │
  │<───┼──────────────────────(5) Almacena JWT        │
  │    │  localStorage                                │
  │    │                    │                          │
  │    └──────────────────────(6) GET /api/users/me  │
  │                    ├─ Headers: "Authorization: Bearer {token}"
  │                    │                          │
  │                    │  (7) Valida JWT          │
  │                    │  (8) Retorna datos user  │
  │                    │<────────────────────────┤
  │<────────────────────(9) Muestra dashboard    │
  │                     │                          │
```

## 🏢 Estructura de Capas

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Components (14)                                    │ │
│  │  ├─ Auth (4): Login, Register, Workshop, Password │ │
│  │  ├─ Dashboard (4): Main, Incidents, Appts, Report │ │
│  │  ├─ Admin (1): AdminPanel                          │ │
│  │  ├─ Workshop (1): Management                       │ │
│  │  └─ Shared (3): Navbar, Footer, Loader            │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Services (5)                                       │ │
│  │  ├─ AuthService: Login, Register, Logout           │ │
│  │  ├─ UserService: CRUD de usuario                   │ │
│  │  ├─ WorkshopService: CRUD de taller               │ │
│  │  ├─ IncidentService: CRUD de incidentes           │ │
│  │  └─ ApiService: Cliente HTTP genérico             │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────┐
│                    SECURITY LAYER                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ├─ AuthGuard: Protege rutas no autenticadas      │ │
│  │  ├─ RoleGuard: Valida roles de usuario             │ │
│  │  └─ TokenInterceptor: Inyecta JWT en peticiones   │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────┐
│                    DATA & MODELS LAYER                    │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  TypeScript Interfaces (20+)                       │ │
│  │  ├─ User, Role, Permission                         │ │
│  │  ├─ Workshop, Service                              │ │
│  │  ├─ Incident, Appointment                          │ │
│  │  └─ API Responses                                  │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────┐
│                  HTTP COMMUNICATION LAYER                 │
│         Angular HttpClient + RxJS Observables            │
│              (Manejo de peticiones HTTP)                  │
└───────────────┬──────────────────────────────────────────┘
                │
        FastAPI Backend (Tu código)
```

## 📊 Componentes & Servicios Interconexión

```
LoginComponent
    ├─> AuthService
    │       ├─> ApiService
    │       │       └─> HttpClient
    │       └─> localStorage
    └─> AuthGuard (en rutas)

DashboardComponent
    ├─> UserService
    │       └─> GET /api/users/me
    ├─> IncidentService
    │       └─> GET /api/incidents/my-incidents
    └─> TokenInterceptor
            └─> Agrega JWT

AdminPanelComponent
    ├─> RoleGuard
    │   └─> Verifica role="Admin"
    ├─> UserService
    │   └─> GET /api/users
    └─> IncidentService
        └─> GET /api/incidents

WorkshopManagementComponent
    ├─> RoleGuard
    │   └─> Verifica role="Workshop"
    └─> WorkshopService
        ├─> GET /api/workshops/me
        ├─> PUT /api/workshops/{id}
        ├─> GET /api/services
        └─> POST /api/workshops/{id}/services
```

## 🔌 Puntos de Conexión Backend Requeridos

```
┌─────────────────────────────────────────────────────┐
│             API Endpoints Requeridos                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  BASE_URL: http://localhost:8000                   │
│                                                     │
│  ✅ Authentication                                  │
│     POST   /api/auth/login                         │
│     POST   /api/auth/register                      │
│     POST   /api/auth/register-workshop             │
│     POST   /api/auth/change-password               │
│                                                     │
│  ✅ Users                                           │
│     GET    /api/users/me                           │
│     PUT    /api/users/me                           │
│     POST   /api/users/change-password              │
│     GET    /api/users                              │
│                                                     │
│  ✅ Workshops                                       │
│     GET    /api/workshops                          │
│     GET    /api/workshops/{id}                     │
│     GET    /api/workshops/me                       │
│     PUT    /api/workshops/{id}                     │
│     POST   /api/workshops/{id}/services            │
│     DELETE /api/workshops/{id}/services/{svcId}   │
│                                                     │
│  ✅ Services                                        │
│     GET    /api/services                           │
│                                                     │
│  ✅ Incidents                                       │
│     POST   /api/incidents                          │
│     GET    /api/incidents                          │
│     GET    /api/incidents/{id}                     │
│     GET    /api/incidents/my-incidents             │
│     PATCH  /api/incidents/{id}                     │
│                                                     │
│  ✅ Appointments                                    │
│     POST   /api/appointments                       │
│     GET    /api/appointments                       │
│     GET    /api/appointments/{id}                  │
│     GET    /api/appointments/my-appointments       │
│     PATCH  /api/appointments/{id}                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🔐 Flujo de Seguridad

```
Request HTTP
    │
    ├─> ¿Tiene token en localStorage?
    │   ├─ Sí  → TokenInterceptor lo agrega al header
    │   └─ No  → Request se envía sin token
    │
    └─> Backend recibe request con/sin token
        │
        ├─> ¿Es ruta protegida (/api/users/me)?
        │   ├─ Sí  → Valida JWT
        │   │       ├─ Válido → Procesa request
        │   │       └─ Inválido → Error 401 Unauthorized
        │   └─ No  → Procesa sin validación
        │
        └─> Retorna respuesta
            │
            ├─> ¿Error 401?
            │   └─ Frontend limpia localStorage y redirige a /login
            │
            └─> ¿Response 200?
                └─> Frontend procesa datos normalmente
```

## 📱 Rutas y Protecciones

```
/login
├─ Componente: LoginComponent
├─ Protección: Ninguna (pública)
└─ Guardias: Ninguno

/register
├─ Componente: RegisterComponent
├─ Protección: Ninguna (pública)
└─ Guardias: Ninguno

/dashboard
├─ Componente: DashboardComponent
├─ Protección: Requerida
└─ Guardias: AuthGuard

/admin
├─ Componente: AdminPanelComponent
├─ Protección: Requerida
├─ Rol: Admin
└─ Guardias: AuthGuard, RoleGuard(roles=['Admin'])

/workshop
├─ Componente: WorkshopManagementComponent
├─ Protección: Requerida
├─ Rol: Workshop
└─ Guardias: AuthGuard, RoleGuard(roles=['Workshop'])
```

## 💾 Almacenamiento de Datos en Frontend

```
┌──────────────────────────────────────────┐
│        localStorage (Persistente)         │
├──────────────────────────────────────────┤
│ auth_token: "eyJhbGciOiJIUzI1NiIs..."  │
│ auth_user: {                             │
│   "id": 1,                               │
│   "name": "Usuario",                     │
│   "email": "user@example.com",           │
│   "roles": [...]                         │
│ }                                        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│        aplicación (En memoria)            │
├──────────────────────────────────────────┤
│ currentUser$ (BehaviorSubject)           │
│ isAuthenticated$ (BehaviorSubject)       │
│ incidents$ (signal)                      │
│ appointments$ (signal)                   │
│ workshops$ (signal)                      │
│ loading$ (signal)                        │
│ error$ (signal)                          │
└──────────────────────────────────────────┘
```

## 🎯 Flujo de Datos (Ejemplo: Reporte de Incidente)

```
Usuario en formulario
         │
         ├─> (1) Completa datos
         │
         ├─> (2) Click "Reportar"
         │
ReportIncidentComponent
         │
         ├─> (3) Valida formulario (frontend)
         │
         ├─> (4) Llama IncidentService.reportIncident()
         │
IncidentService
         │
         ├─> (5) Llama ApiService.post('/incidents', data)
         │
ApiService
         │
         ├─> (6) HttpClient.post('/api/incidents', data)
         │
TokenInterceptor
         │
         ├─> (7) Intercepta → Agrega "Authorization: Bearer {token}"
         │
HttpClient
         │
         ├─> (8) Envía petición HTTPS
         │
BACKEND FastAPI
         │
         ├─> (9) Recibe petición + valida JWT
         │       ├─> (10) Valida datos del incidente
         │       ├─> (11) Crea registro en BD
         │       ├─> (12) Notifica talleres cercanos
         │       └─> (13) Retorna {id, location, description, ...}
         │
Frontend (Observables)
         │
         ├─> (14) Recibe respuesta exitosa
         │       ├─> (15) Actualiza UI
         │       ├─> (16) Muestra mensaje de éxito
         │       └─> (17) Redirige a /dashboard

Usuario
         │
         └─> ¡Incidente reportado exitosamente!
```

## 🔗 Separación de Responsabilidades

```
COMPONENTE (Presentación)
├─ Responsabilidad: Mostrar UI y captar input
├─ No debe: Hacer peticiones HTTP directo
└─ Usa: Servicios

SERVICIO (Lógica)
├─ Responsabilidad: Llamar backend y gestionar datos
├─ No debe: Manipular DOM
└─ Usa: ApiService, tipos TypeScript

API.SERVICE (Comunicación)
├─ Responsabilidad: Hacer peticiones HTTP
├─ No debe: Contener lógica de negocio
└─ Usa: HttpClient

GUARD (Seguridad)
├─ Responsabilidad: Proteger rutas
├─ No debe: Procesar datos
└─ Usa: AuthService

INTERCEPTOR (Middleware)
├─ Responsabilidad: Modificar peticiones/respuestas
├─ No debe: Contener lógica de negocio
└─ Usa: Token de AuthService
```

## 📈 Escalabilidad Futura

```
Estructura Actual (Escalable a):

src/app/
├── core/          ← Puede agregar más guards, servicios
├── features/      ← Agregar más módulos de funcionalidades
│   ├── auth/
│   ├── dashboard/
│   ├── admin/
│   ├── workshop/
│   ├── payments/      ← Nuevo módulo de pagos
│   ├── notifications/ ← Nuevo módulo de notificaciones
│   └── map/          ← Nuevo módulo de mapas
├── shared/        ← Componentes reutilizables
└── utils/         ← Funciones utilitarias
```

---

**Diagrama completo:** Entity → Component → Service → API → Backend → BD → Response
**Patrón:** Presentación → Lógica → Datos
**Seguridad:** AuthGuard → TokenInterceptor → JWT Validation
