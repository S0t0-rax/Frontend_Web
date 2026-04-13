# SERVMECA - Frontend Angular + Tailwind

Sistema profesional de auxilio y reparación automotriz desarrollado con Angular 21 y Tailwind CSS.

## 🎯 Características Principales

✅ **Autenticación:**
- Registro de usuarios con validación
- Registro especial para talleres mecánicos
- Inicio de sesión seguro con JWT
- Cambio de contraseña
- Cierre de sesión

✅ **Usuarios Regulares:**
- Dashboard personal
- Reporte de incidentes
- Historial de incidentes
- Gestión de citas de reparación
- Perfil de usuario

✅ **Administradores:**
- Panel administrativo
- Visualización de talleres registrados
- Listado de todos los incidentes
- Gestión de usuarios
- Estadísticas del sistema

✅ **Talleres Mecánicos:**
- Gestión de datos del taller
- Administración de servicios ofrecidos
- Visualización de citas asignadas
- Actualización de precios y tiempos

## 🏗️ Estructura del Sistema

```
SERVMECA/
├── Frontend/                    # Este proyecto
│   └── Frontend_Web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/        # Servicios, modelos, guardias, interceptores
│       │   │   ├── features/    # Componentes de funcionalidad
│       │   │   ├── shared/      # Componentes reutilizables
│       │   │   └── app.routes.ts
│       │   └── environments/    # Configuración por ambiente
│       ├── INTEGRATION_GUIDE.md # Guía de integración completa
│       ├── FASTAPI_INTEGRATION.md # Ejemplos de código FastAPI
│       └── angular.json
└── Backend/                     # Tu proyecto FastAPI
    └── (por desarrollar/conectar)
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
cd Frontend_Web
npm install
```

### 2. Configurar backend
Edita `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'  // Tu URL de FastAPI
};
```

### 3. Ejecutar desarrollo
```bash
npm start
```
Acceder a `http://localhost:4200`

## 📚 Documentación

- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Guía completa de integración
- **[FASTAPI_INTEGRATION.md](FASTAPI_INTEGRATION.md)** - Ejemplos de endpoints FastAPI requeridos

## 🔄 Flujo de Autenticación

1. **Usuario registra** → Datos almacenados en backend
2. **Usuario inicia sesión** → Backend retorna JWT
3. **JWT en localStorage** → Se envía en cada petición
4. **Validación por backend** → Token verificado
5. **Acceso a rutas protegidas** → Guardias verifican autenticación

## 🛣️ Rutas Disponibles

| Ruta | Descripción | Protegida | Rol Requerido |
|------|-------------|-----------|---------------|
| `/login` | Inicio de sesión | No | - |
| `/register` | Registro de usuario | No | - |
| `/register-workshop` | Registro de taller | No | - |
| `/dashboard` | Panel principal | Sí | Cualquiera |
| `/report-incident` | Reportar incidente | Sí | Usuario |
| `/my-incidents` | Mis incidentes | Sí | Usuario |
| `/my-appointments` | Mis citas | Sí | Usuario |
| `/change-password` | Cambiar contraseña | Sí | Cualquiera |
| `/admin` | Panel administrativo | Sí | Admin |
| `/workshop` | Gestión de taller | Sí | Workshop |

## 🔐 Seguridad

- ✅ Tokens JWT con expiración
- ✅ CORS configurado
- ✅ Interceptor de autenticación
- ✅ Guardias de ruta por rol
- ✅ Validación en frontend y backend
- ✅ Contraseñas hasheadas en backend

## 📊 Modelos de Datos

### Usuario
```typescript
{
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  roles: Role[];
}
```

### Taller
```typescript
{
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  capacity: number;
  currentLoad: number;
  services: WorkshopService[];
}
```

### Incidente
```typescript
{
  id: number;
  userId: number;
  description: string;
  location: string;
  status: "pending" | "assigned" | "completed" | "cancelled";
  reportedAt: Date;
}
```

## 🔗 Integración con FastAPI

El frontend espera endpoints específicos en FastAPI. Ver [FASTAPI_INTEGRATION.md](FASTAPI_INTEGRATION.md) para:

- Lista completa de endpoints requeridos
- Schemas de request/response esperados
- Ejemplos de código FastAPI
- Configuración de CORS
- Validación de JWT

### Endpoints Principales Requeridos

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/register-workshop
POST   /api/auth/change-password
GET    /api/users/me
PUT    /api/users/me
GET    /api/workshops
GET    /api/workshops/me
POST   /api/incidents
GET    /api/incidents/my-incidents
POST   /api/appointments
GET    /api/appointments/my-appointments
... y más
```

## 🎨 Personalización

### Cambiar Colores
Los colores están en los componentes usando Tailwind:
- Primario: `bg-blue-600`
- Secundario: `bg-green-600`
- Acentos: `bg-purple-600`

### Agregar Nueva Página
1. Crear componente en `src/app/features/`
2. Agregar ruta en `src/app/app.routes.ts`
3. Agregar link en navbar si es necesaria

## 📦 Build para Producción

```bash
npm run build
```

Los archivos listos para deploy estarán en `dist/`

### Configuración Producción
Edita `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/api'
};
```

## 🧪 Testing

```bash
npm test
```

## 🐛 Troubleshooting

### CORS Error
- Verifica que FastAPI permite requests de `http://localhost:4200`
- Configura `add_middleware(CORSMiddleware, allow_origins=[...])`

### Token no se envía
- Verifica localStorage tiene `auth_token`
- Comprueba que `TokenInterceptor` está en `app.config.ts`

### Rutas protegidas no funcionan
- Verifica `AuthGuard` en rutas
- Confirma que `isAuthenticated$` es actualizado

## 📞 Soporte y Ejemplos

Ver documentación detallada:
- **INTEGRATION_GUIDE.md** - Para toda la integración
- **FASTAPI_INTEGRATION.md** - Para ejemplos de código FastAPI

## 📝 Casos de Uso Implementados

| Caso de Uso | Estado | Detalles |
|------------|--------|---------|
| Registrarse | ✅ Completo | Validación, email único |
| Iniciar sesión | ✅ Completo | JWT, persistencia |
| Cambiar contraseña | ✅ Completo | Validación de contraseña actual |
| Cerrar sesión | ✅ Completo | Limpia token y redirecciona |
| Reportar incidente | ✅ Completo | Geo-ubicación, fotos |
| Ver incidentes | ✅ Completo | Historial con filtros |
| Gestionar citas | ✅ Completo | Crear, ver, cancelar |
| Taller modificar datos | ✅ Completo | Actualizar servicios y ubicación |
| Admin ver talleres | ✅ Completo | Lista completa de talleres |
| Admin ver usuarios | ✅ Completo | Lista de todos los usuarios |

## 🚢 Deploy

**Recomendado:** Vercel o Netlify para el frontend

```bash
# Vercel
npm i -g vercel
vercel

# Netlify
npm i netlify-cli
netlify deploy
```

## 📄 Licencia

Proyecto privado para SERVMECA.

## 🔄 Próximos Pasos

1. Conectar con tu backend FastAPI
2. Configurar base de datos PostgreSQL
3. Implementar notificaciones en tiempo real (WebSockets)
4. Agregar mapas interactivos
5. Implementar sistema de calificaciones
6. Agregar pagos en línea

---

**Última actualización:** Abril 2026
**Versión:** 1.0.0
**Angular:** 21.2.0
**Tailwind CSS:** 4.1.12

