/**
 * Utilidades para manejo de fechas en el backend
 */

/**
 * Convierte un string de fecha a Date evitando problemas de zona horaria
 * @param dateString - String de fecha en formato YYYY-MM-DD
 * @returns Date object
 */
export function parseDateString(dateString: string): Date {
    if (!dateString) return new Date();

    try {
        // Crear fecha usando UTC para evitar problemas de zona horaria
        const [ year, month, day ] = dateString.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    } catch (error) {
        console.warn('Error parseando fecha:', dateString, error);
        return new Date();
    }
}





/**
 * Convierte una fecha a string para almacenamiento
 * @param date - Date object
 * @returns String en formato YYYY-MM-DD
 */
export function formatDateForStorage(date: Date): string {
    if (!date) return '';

    try {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.warn('Error formateando fecha para almacenamiento:', date, error);
        return '';
    }
}

/**
 * Calcula la próxima fecha de pago manteniendo el mismo día del mes
 * @param baseDate - Fecha base para calcular la siguiente
 * @returns Fecha del siguiente mes con el mismo día
 */
export function calculateNextPaymentDate(baseDate: Date): Date {
    // Obtener el día del mes original
    const originalDay = baseDate.getDate();

    // Crear nueva fecha sumando 1 mes
    const nextDate = new Date(baseDate);
    nextDate.setMonth(nextDate.getMonth() + 1);

    // Asegurar que el día sea el mismo que el original
    // Si el mes siguiente no tiene ese día, usar el último día del mes
    const maxDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
    const targetDay = Math.min(originalDay, maxDay);
    nextDate.setDate(targetDay);

    return nextDate;
} 