// ============================================================================
// GUÍA DE VALIDACIONES - INYECCIÓN SQL Y SEGURIDAD
// ============================================================================

/**
 * FUNCIÓN PRINCIPAL DE DETECCIÓN DE INYECCIÓN SQL
 * Ubicación: frontend/access/log_in/login.js y frontend/access/sign_in/singin.js
 */

function detectSQLInjection(value) {
    // Patrones 1: Palabras clave SQL peligrosas
    const sqlPatterns = [
        /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT|ON|OR|AND)\b)/gi,
        /(<script|javascript:|onerror=|onclick=|onload=)/gi,
        /['"`]/g,  // Comillas peligrosas
        /--|;|\/\*/g  // Comentarios SQL
    ];
    
    // Verificar cada patrón
    for (let pattern of sqlPatterns) {
        if (pattern.test(value)) {
            return true;  // DETECTADA INYECCIÓN
        }
    }
    
    // Patrones 2: Patrones específicos de inyección
    const injectionPatterns = [
        /(\d\s*=\s*\d|'\s*or\s*'|"\s*or\s*")/gi,  // 1=1 OR '1'='1
        /(union.*select|select.*from|insert.*into)/gi  // UNION SELECT, etc.
    ];
    
    // Verificar patrones de inyección
    for (let pattern of injectionPatterns) {
        if (pattern.test(value)) {
            return true;  // DETECTADA INYECCIÓN
        }
    }
    
    return false;  // ENTRADA SEGURA
}

// ============================================================================
// EJEMPLOS DE USO EN LOGIN
// ============================================================================

// En: frontend/access/log_in/login.js

function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email === '') {
        setInputState(emailInput, 'neutral');
        return false;
    }
    
    // VALIDACIÓN: Detectar inyección SQL
    if (detectSQLInjection(email)) {
        setInputState(emailInput, 'invalid');
        showMessage('Correo electrónico inválido. No se permiten caracteres especiales', 'error');
        return false;
    }
    
    // Validación de formato
    if (!emailRegex.test(email)) {
        setInputState(emailInput, 'invalid');
        return false;
    }
    
    setInputState(emailInput, 'valid');
    return true;
}

function validatePassword() {
    const passwordValue = password.value;
    
    if (passwordValue === '') {
        setInputState(password, 'neutral');
        return false;
    }
    
    // VALIDACIÓN: Detectar inyección SQL
    if (detectSQLInjection(passwordValue)) {
        setInputState(password, 'invalid');
        showMessage('Contraseña inválida. No se permiten caracteres especiales', 'error');
        return false;
    }
    
    // Validación de longitud
    if (passwordValue.length < 6 || passwordValue.length > 10) {
        setInputState(password, 'invalid');
        return false;
    }
    
    setInputState(password, 'valid');
    return true;
}

// ============================================================================
// EJEMPLOS DE USO EN REGISTRO
// ============================================================================

// En: frontend/access/sign_in/singin.js

document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("your_email").value.trim();
    const first_name = document.getElementById("first_name").value.trim();
    const last_name = document.getElementById("last_name").value.trim();
    
    // VALIDACIÓN 1: Email con SQL injection check
    if (detectSQLInjection(email)) {
        showMessage("Correo electrónico inválido. No se permiten caracteres especiales", 'error');
        return;
    }
    
    // VALIDACIÓN 2: Nombre con SQL injection check
    if (detectSQLInjection(first_name)) {
        showMessage("Nombre inválido. No se permiten caracteres especiales", 'error');
        return;
    }
    
    // VALIDACIÓN 3: Apellido con SQL injection check
    if (detectSQLInjection(last_name)) {
        showMessage("Apellido inválido. No se permiten caracteres especiales", 'error');
        return;
    }
    
    // Continuar con el registro si todas las validaciones pasan
    // ... resto del código de registro
});

// ============================================================================
// PRUEBAS DE SEGURIDAD - ENTRADAS BLOQUEADAS
// ============================================================================

const entradas_bloqueadas = [
    // Inyección SQL básica
    "' OR '1'='1",
    "' OR 1=1--",
    "admin'--",
    "' UNION SELECT * FROM users--",
    
    // UNION SELECT
    "email' UNION SELECT password FROM users--",
    "1 UNION SELECT username, password FROM admin",
    
    // Tags de Script
    "<script>alert('XSS')</script>",
    "<img src=x onerror='alert(1)'>",
    "javascript:alert(1)",
    
    // Comentarios SQL
    "'; DROP TABLE users;--",
    "1/**/OR/**/1=1",
    
    // Comillas y caracteres especiales
    "' OR '",
    '\" OR \"',
    "` OR `",
    
    // Palabras clave SQL
    "SELECT * FROM users",
    "INSERT INTO table VALUES",
    "UPDATE users SET password",
    "DELETE FROM accounts",
    "DROP DATABASE",
    "EXEC xp_cmdshell",
];

// ============================================================================
// PRUEBAS DE SEGURIDAD - ENTRADAS ACEPTADAS
// ============================================================================

const entradas_validas = [
    // Emails válidos
    "usuario@ejemplo.com",
    "juan.perez@dominio.co",
    "maria_garcia@correo.mx",
    "test+tag@empresa.org",
    
    // Nombres válidos
    "Juan",
    "María García",
    "José Luis",
    "Ana Rosa",
    
    // Contraseñas válidas (sin caracteres especiales)
    "Abc1234567",
    "Xyz9876543",
    "Pass123456",
    
    // Números de teléfono
    "5512345678",
    "+5212341234567",
    "+52 (123) 456-7890",
];

// ============================================================================
// FUNCIÓN DE PRUEBA - VERIFICAR VALIDACIONES
// ============================================================================

function testSQLInjectionDetection() {
    console.log("=== PRUEBAS DE INYECCIÓN SQL ===\n");
    
    console.log("ENTRADAS BLOQUEADAS (Deberían ser detectadas):");
    entradas_bloqueadas.forEach(entrada => {
        const resultado = detectSQLInjection(entrada);
        const status = resultado ? "✅ BLOQUEADA" : "❌ NO DETECTADA (PROBLEMA)";
        console.log(`${status}: "${entrada}"`);
    });
    
    console.log("\n\nENTRADAS VÁLIDAS (NO deberían ser bloqueadas):");
    entradas_validas.forEach(entrada => {
        const resultado = detectSQLInjection(entrada);
        const status = !resultado ? "✅ ACEPTADA" : "❌ RECHAZADA INCORRECTAMENTE";
        console.log(`${status}: "${entrada}"`);
    });
}

// Para ejecutar la prueba en el navegador:
// testSQLInjectionDetection();

// ============================================================================
// MEJORES PRÁCTICAS
// ============================================================================

/*
1. VALIDACIÓN EN CLIENTE:
   - Detecta intentos de inyección SQL
   - Mejora la experiencia del usuario con feedback inmediato
   - NO reemplaza validación en servidor

2. VALIDACIÓN EN SERVIDOR:
   - SIEMPRE validar en el backend
   - Usar prepared statements / parameterized queries
   - Sanitizar todas las entradas
   - Usar escaping adecuado para la base de datos

3. COLORES PARA FEEDBACK:
   - ROJO (#c0392b) para errores / campos inválidos
   - VERDE (#27ae60) para éxito / campos válidos
   - Ambos incluidos en la paleta profesional

4. INTERFAZ PROFESIONAL:
   - Mensajes claros sin emojis
   - Bordes izquierdos de 4px en alertas
   - Paleta de colores azul marina
   - Animaciones mínimas
*/

// ============================================================================
// EJEMPLO COMPLETO - VALIDACIÓN EN FORMULARIO
// ============================================================================

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.isValid = false;
    }
    
    validateEmail(emailField) {
        const email = emailField.value.trim();
        
        // Validación de inyección
        if (detectSQLInjection(email)) {
            emailField.classList.add('invalid');
            return false;
        }
        
        // Validación de formato
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailField.classList.add('invalid');
            return false;
        }
        
        emailField.classList.add('valid');
        return true;
    }
    
    validatePassword(passwordField) {
        const password = passwordField.value;
        
        // Validación de inyección
        if (detectSQLInjection(password)) {
            passwordField.classList.add('invalid');
            return false;
        }
        
        // Validación de longitud
        if (password.length < 6 || password.length > 10) {
            passwordField.classList.add('invalid');
            return false;
        }
        
        passwordField.classList.add('valid');
        return true;
    }
    
    submitForm() {
        const isEmailValid = this.validateEmail(document.getElementById('email'));
        const isPasswordValid = this.validatePassword(document.getElementById('password'));
        
        return isEmailValid && isPasswordValid;
    }
}

// Uso:
// const validator = new FormValidator('loginForm');
// validator.submitForm();

// ============================================================================
// CONCLUSIÓN
// ============================================================================

/*
✅ IMPLEMENTADO:
- Función detectSQLInjection() funcionando
- Validaciones en login.js
- Validaciones en singin.js
- Interfaz profesional sin emojis
- Colores rojo/verde para feedback
- Paleta de colores azul marina

La aplicación ahora es más segura y tiene una apariencia profesional y formal.
*/
