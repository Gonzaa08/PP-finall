<?php
// Iniciar sesión
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar si el usuario está logueado
function estaLogueado() {
    return isset($_SESSION['user_id']);
}

// Guardar usuario en sesión
function guardarSesion($id, $email, $dni) {
    $_SESSION['user_id'] = $id;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_dni'] = $dni;
}

// Cerrar sesión
function cerrarSesion() {
    session_unset();
    session_destroy();
}
?>