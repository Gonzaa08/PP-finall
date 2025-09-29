<?php
require "db.php";
require "session.php";

header('Content-Type: application/json');

// Verificar que esté logueado
if (!estaLogueado()) {
    echo json_encode(["status" => "error", "message" => "Debe iniciar sesión ❌"]);
    exit;
}

$userId = $_SESSION['user_id'];
$confirmarPass = $_POST['password'] ?? '';

if (empty($confirmarPass)) {
    echo json_encode(["status" => "error", "message" => "Confirme su contraseña ❌"]);
    exit;
}

// Verificar contraseña
$sql = "SELECT password FROM usuarios WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Usuario no encontrado ❌"]);
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($confirmarPass, $user['password'])) {
    echo json_encode(["status" => "error", "message" => "Contraseña incorrecta ❌"]);
    exit;
}

// Eliminar usuario
$sqlDelete = "DELETE FROM usuarios WHERE id=?";
$stmtDelete = $conn->prepare($sqlDelete);
$stmtDelete->bind_param("i", $userId);

if ($stmtDelete->execute()) {
    cerrarSesion();
    echo json_encode(["status" => "success", "message" => "✅ Cuenta eliminada"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al eliminar ❌"]);
}
?>