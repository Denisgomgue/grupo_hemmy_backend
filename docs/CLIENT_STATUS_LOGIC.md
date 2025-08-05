# 🎯 Lógica de Estados de Clientes

## 📊 Estados Disponibles

### **Client Status (client.status):**

- `ACTIVE` - Cliente activo y con servicio
- `SUSPENDED` - Cliente suspendido por falta de pago
- `INACTIVE` - Cliente dado de baja definitiva

### **Payment Status (client_payment_config.paymentStatus):**

- `PAID` - Pago al día
- `EXPIRING` - Por vencer (0 a 7 días)
- `EXPIRED` - Vencido (-7 a 0 días)
- `SUSPENDED` - Suspendido (> 7 días vencido)

## 🔄 Flujo de Cambios Automáticos

### **🟢 ACTIVE → SUSPENDED (Suspensión Automática):**

- **Trigger:** `paymentStatus` cambia a `SUSPENDED`
- **Condición:** Cliente está `ACTIVE` y `paymentStatus` = `SUSPENDED`
- **Acción:** Cambiar `client.status` a `SUSPENDED`
- **Ejemplo:** Cliente no paga por más de 7 días

### **🟢 SUSPENDED → ACTIVE (Reconexión Automática):**

- **Trigger:** `paymentStatus` cambia a `PAID` o `EXPIRING`
- **Condición:** Cliente está `SUSPENDED` y `paymentStatus` = `PAID` o `EXPIRING`
- **Acción:** Cambiar `client.status` a `ACTIVE`
- **Ejemplo:**
  - Cliente paga después de estar suspendido → `PAID`
  - Cliente aún tiene días para pagar → `EXPIRING`

### **📝 ACTIVE/SUSPENDED → INACTIVE (Baja Definitiva):**

- **Trigger:** Acción manual del administrador
- **Condición:** Cliente se da de baja definitivamente
- **Acción:** Cambiar `client.status` a `INACTIVE`
- **Nota:** No cambia automáticamente, requiere acción manual

## 🚫 Estados que NO Cambian Automáticamente

### **🟡 EXPIRING:**

- Cliente se activa si está `SUSPENDED` y `paymentStatus` = `EXPIRING`
- Cliente mantiene `ACTIVE` si ya está activo
- **Lógica:** Aún tiene días para pagar

### **🔴 EXPIRED:**

- Cliente mantiene `ACTIVE` aunque `paymentStatus` = `EXPIRED`
- Solo se suspende cuando pasa a `SUSPENDED`

### **📝 INACTIVE:**

- Cliente dado de baja no cambia automáticamente
- Requiere acción manual para reactivar

## 🎯 Cálculo de Estados de Pago

### **Fórmula:**

```typescript
const daysUntilPayment = Math.floor(
  (paymentDate - today) / (1000 * 60 * 60 * 24),
);

if (daysUntilPayment > 7) return 'PAID';
if (daysUntilPayment >= 0) return 'EXPIRING';
if (daysUntilPayment >= -7) return 'EXPIRED';
return 'SUSPENDED'; // < -7 días
```

### **Ejemplo:**

- Fecha de pago: 1 de enero de 2025
- Hoy: 4 de agosto de 2025
- Diferencia: -215 días
- Resultado: `SUSPENDED`

## 🔧 Endpoints Disponibles

### **POST /payments/sync-all-client-statuses**

- Recalcula `paymentStatus` basado en fechas
- Sincroniza `client.status` con `paymentStatus`
- Ejecuta ambos pasos automáticamente

### **POST /payments/deactivate-client/:clientId**

- Da de baja definitiva a un cliente
- Cambia `client.status` a `INACTIVE`
- No afecta `paymentStatus`

## 📋 Casos de Uso

### **1. Cliente Normal:**

- Paga a tiempo → `ACTIVE` + `PAID`
- No paga por 5 días → `ACTIVE` + `EXPIRED`
- No paga por 10 días → `SUSPENDED` + `SUSPENDED`
- Paga después → `ACTIVE` + `PAID`

### **2. Cliente que se da de baja:**

- Estado actual: `ACTIVE` + `PAID`
- Administrador da de baja → `INACTIVE` + `PAID`
- No cambia automáticamente aunque pase el tiempo

### **3. Cliente suspendido que se da de baja:**

- Estado actual: `SUSPENDED` + `SUSPENDED`
- Administrador da de baja → `INACTIVE` + `SUSPENDED`
- No cambia automáticamente aunque pague después
