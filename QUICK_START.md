# ⚡ QUICK START - Comenzar en 5 minutos

## 1️⃣ Instalar Dependencias
```bash
cd Frontend_Web
npm install
```

## 2️⃣ Configurar Backend URL
Edita `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'  // ← Cambia esto a tu backend
};
```

## 3️⃣ Iniciar el Servidor
```bash
npm start
```

Abre `http://localhost:4200` en tu navegador.

## 4️⃣ Login de Prueba
1. Haz clic en "Registrarse"
2. Completa el formulario
3. ¡Serás redirigido al dashboard!

## 📋 Endpoints Mínimos Requeridos en FastAPI

Tu backend DEBE tener estos 5 endpoints para empezar:

```python
# 1. Login
POST /api/auth/login
Body: {"email": "...", "password": "..."}
Response: {"token": "...", "user": {...}, "expiresIn": 3600}

# 2. Register
POST /api/auth/register
Body: {"name": "...", "email": "...", "password": "...", "roleId": 3}
Response: {"token": "...", "user": {...}, "expiresIn": 3600}

# 3. Get Current User
GET /api/users/me
Headers: {"Authorization": "Bearer token_aqui"}
Response: {"id": 1, "name": "...", "email": "...", ...}

# 4. List Workshops (para admin)
GET /api/workshops
Headers: {"Authorization": "Bearer token_aqui"}
Response: [{"id": 1, "name": "...", ...}, ...]

# 5. Create Incident
POST /api/incidents
Headers: {"Authorization": "Bearer token_aqui"}
Body: {"location": "...", "description": "..."}
Response: {"id": 1, "location": "...", ...}
```

## 🔐 Configuración CORS en FastAPI

Agrega esto a tu main.py:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tu código aquí...
```

## 🧪 Probar Endpoints

### Opción 1: Postman
1. Descarga Postman
2. Copia la colección desde FASTAPI_INTEGRATION.md
3. Prueba los endpoints

### Opción 2: cURL
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get Current User
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8000/api/users/me
```

### Opción 3: VSCode REST Client
1. Instala extensión "REST Client"
2. Crea archivo `test.http`:
```
### Login
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Current User
GET http://localhost:8000/api/users/me
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🔍 Debugging

### Ver requests HTTP en el navegador
1. Abre DevTools (F12)
2. Ve a "Network"
3. Recarga la página
4. Verás todas las peticiones HTTP

### Ver si el token se almacena
En la consola del navegador:
```javascript
console.log(localStorage.getItem('auth_token'))
```

### Ver errores de JavaScript
Devtools → Console tab

### Ver respuesta del servidor
Devtools → Network → Click en petición → Response tab

## 📱 Rutas Disponibles

| URL | Descripción | Requiere Auth |
|-----|-------------|---------------|
| `/login` | Iniciar sesión | No |
| `/register` | Crear cuenta | No |
| `/register-workshop` | Registrar taller | No |
| `/dashboard` | Panel principal | Sí |
| `/report-incident` | Reportar problema | Sí |
| `/admin` | Panel de admin | Sí (Solo Admin) |
| `/workshop` | Mi taller | Sí (Solo Workshop) |

## 💡 Roles en la Base de Datos

```sql
INSERT INTO roles (id, name) VALUES 
  (1, 'Admin'),
  (2, 'Workshop'), 
  (3, 'User');

-- Al registrar usuario: roleId = 3 (User)
-- Para taller: roleId = 2 (Workshop)
-- Para admin: roleId = 1 (Admin)
```

## 📦 Estructura Base Esperada en Backend

```
backend/
├── main.py              # Punto de entrada
├── requirements.txt     # Dependencias
├── .env                 # Variables de entorno
├── models/
│   ├── user.py
│   ├── workshop.py
│   ├── incident.py
│   └── appointment.py
├── schemas/            # Pydantic models
│   ├── user.py
│   ├── workshop.py
│   └── incident.py
├── routers/
│   ├── auth.py        # Login, Register
│   ├── users.py       # CRUD de usuarios
│   ├── workshops.py   # CRUD de talleres
│   ├── incidents.py   # CRUD de incidentes
│   └── appointments.py # CRUD de citas
└── database.py        # Conexión a BD
```

## 🐛 Errores Comunes

### "CORS policy: blocked"
→ Configura `CORSMiddleware` en FastAPI

### "Cannot POST /api/auth/login"
→ El endpoint no existe en tu backend

### "Invalid token"
→ El token es inválido o expiró

### "Role not found"
→ El roleId no existe en la base de datos

### "Email already registered"
→ Usa un email diferente en registro

## ✅ Checklist para Empezar

- [ ] Ejecutar `npm install`
- [ ] Configurar `environment.ts` con URL de backend
- [ ] Iniciar `npm start`
- [ ] Crear 5 endpoints mínimos en FastAPI
- [ ] Configurar CORS en FastAPI
- [ ] Probar login en el frontend
- [ ] Ver en DevTools que el token se guarda
- [ ] Probar crear usuario
- [ ] Probar reportar incidente
- [ ] ¡Celebrar! 🎉

## 📞 Si Algo No Funciona

1. **Revisa DevTools → Network** para ver peticiones
2. **Revisa DevTools → Console** para ver errores
3. **Revisa logs del backend** para errores en servidor
4. **Verifica que los endpoints existan** con postman
5. **Lee FASTAPI_INTEGRATION.md** para ejemplos

## 🚀 Próximos Pasos Después de Quick Start

1. Implementar todos los endpoints (ver FASTAPI_INTEGRATION.md)
2. Agregar validaciones en backend
3. Implementar base de datos PostgreSQL
4. Agregar notificaciones en tiempo real
5. Implementar sistema de pagos
6. Deploy a producción

---

**¡Listo! Deberías tener tu frontend corriendo en segundos.**
