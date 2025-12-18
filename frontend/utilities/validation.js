// Utilidades de validación compartidas

// Función para detectar y bloquear inyección SQL
function detectSQLInjection(value) {
    // Patrones de palabras clave SQL
    const sqlPatterns = [
        /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT)\b)/gi,
        /(<script|javascript:|onerror=|onclick=|onload=)/gi
    ];
    
    // Verificar patrones SQL
    for (let pattern of sqlPatterns) {
        if (pattern.test(value)) {
            return true;
        }
    }
    
    // Patrones adicionales de inyección
    const injectionPatterns = [
        /(\d\s*=\s*\d\s*OR|'\s*OR\s*'|"\s*OR\s*")/gi,
        /(UNION.*SELECT|SELECT.*FROM|INSERT.*INTO|'\s*or\s*'1'\s*=\s*'1)/gi,
        /--|\*|;|\/\*/g
    ];
    
    for (let pattern of injectionPatterns) {
        if (pattern.test(value)) {
            return true;
        }
    }
    
    return false;
}

// Función para sanitizar entrada
function sanitizeInput(value) {
    if (detectSQLInjection(value)) {
        return null;
    }
    return value.trim();
}

// Función para validar email
function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para validar contraseña
function validatePasswordFormat(password) {
    return password.length >= 6 && password.length <= 10;
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        detectSQLInjection,
        sanitizeInput,
        validateEmailFormat,
        validatePasswordFormat
    };
}
