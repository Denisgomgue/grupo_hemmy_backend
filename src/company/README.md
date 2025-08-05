# Company API Documentation

## Descripción

API para gestionar los datos de la empresa, incluyendo información básica, logos y configuración.

## Endpoints

### 1. Obtener información de la empresa

```http
GET /company/info
```

**Descripción**: Obtiene la información completa de la empresa activa
**Respuesta**:

```json
{
  "id": 1,
  "name": "Grupo Hemmy",
  "businessName": "GRUPO HEMMY S.A.C.",
  "ruc": "20123456789",
  "address": "Jr. Tecnología 123",
  "district": "Cercado de Lima",
  "city": "Lima",
  "province": "Lima",
  "country": "Perú",
  "phone": "+51 800 123 4567",
  "email": "contacto@grupohemmy.com",
  "website": "https://grupohemmy.com",
  "description": "Empresa líder en servicios de internet...",
  "logos": {
    "normal": "/uploads/logos/logo-normal.png",
    "horizontal": "/uploads/logos/logo-horizontal.png",
    "reduced": "/uploads/logos/logo-reduced.png",
    "negative": "/uploads/logos/logo-negative.png"
  },
  "slogan": "Conectando el futuro",
  "mission": "Proporcionar servicios de internet...",
  "vision": "Ser la empresa líder...",
  "socialMedia": {
    "facebook": "https://facebook.com/grupohemmy",
    "instagram": "https://instagram.com/grupohemmy",
    "twitter": "https://twitter.com/grupohemmy"
  },
  "businessHours": "Lunes a Viernes: 8:00 AM - 6:00 PM",
  "taxCategory": "RER",
  "economicActivity": "Servicios de telecomunicaciones e internet"
}
```

### 2. Crear empresa

```http
POST /company
```

**Descripción**: Crea una nueva empresa
**Body**:

```json
{
  "name": "Grupo Hemmy",
  "businessName": "GRUPO HEMMY S.A.C.",
  "ruc": "20123456789",
  "address": "Jr. Tecnología 123",
  "phone": "+51 800 123 4567",
  "email": "contacto@grupohemmy.com"
}
```

### 3. Actualizar empresa

```http
PATCH /company/:id
```

**Descripción**: Actualiza los datos de una empresa existente

### 4. Subir logo

```http
POST /company/:id/logo/:type
Content-Type: multipart/form-data
```

**Descripción**: Sube un logo específico para la empresa
**Parámetros**:

- `type`: normal, horizontal, reduced, negative
- `logo`: archivo de imagen (PNG, JPG, JPEG, SVG, máximo 5MB)

### 5. Obtener logos

```http
GET /company/:id/logos
```

**Descripción**: Obtiene todas las rutas de logos de la empresa

### 6. Eliminar logo

```http
DELETE /company/:id/logo/:type
```

**Descripción**: Elimina un logo específico

## Tipos de Logo

1. **normal**: Logo estándar de la empresa
2. **horizontal**: Logo horizontal para headers y documentos
3. **reduced**: Logo reducido para espacios pequeños
4. **negative**: Logo en negativo (blanco sobre fondo oscuro)

## Estructura de la Base de Datos

```sql
CREATE TABLE companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  businessName VARCHAR(255) NOT NULL,
  ruc VARCHAR(20) NOT NULL UNIQUE,
  address VARCHAR(500),
  district VARCHAR(100),
  city VARCHAR(100),
  province VARCHAR(100),
  country VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  description TEXT,
  logoNormal VARCHAR(500),
  logoHorizontal VARCHAR(500),
  logoReduced VARCHAR(500),
  logoNegative VARCHAR(500),
  slogan VARCHAR(255),
  mission TEXT,
  vision TEXT,
  socialMedia TEXT,
  businessHours VARCHAR(255),
  taxCategory VARCHAR(100),
  economicActivity VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Uso en el Frontend

Para usar los datos de la empresa en el frontend:

```typescript
// Obtener información de la empresa
const companyInfo = await api.get('/company/info');

// Usar en el ticket
const ticketData = {
  companyName: companyInfo.businessName,
  ruc: companyInfo.ruc,
  address: companyInfo.address,
  phone: companyInfo.phone,
  email: companyInfo.email,
  logo: companyInfo.logos.horizontal, // Para headers
};
```
