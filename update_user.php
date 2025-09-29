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
$nuevoEmail = $_POST['email'] ?? '';
$nuevoDni = $_POST['dni'] ?? '';

// Validar que haya algo para actualizar
if (empty($nuevoEmail) && empty($nuevoDni)) {
    echo json_encode(["status" => "error", "message" => "Debe cambiar al menos un campo ❌"]);
    exit;
}

// Validar DNI si viene
if (!empty($nuevoDni) && !ctype_digit($nuevoDni)) {
    echo json_encode(["status" => "error", "message" => "DNI solo números ❌"]);
    exit;
}

// Construir UPDATE dinámico
$campos = [];
$tipos = "";
$valores = [];

if (!empty($nuevoEmail)) {
    $campos[] = "email=?";
    $tipos .= "s";
    $valores[] = $nuevoEmail;
}

if (!empty($nuevoDni)) {
    $campos[] = "dni=?";
    $tipos .= "s";
    $valores[] = $nuevoDni;
}

$tipos .= "i";
$valores[] = $userId;

$sql = "UPDATE usuarios SET " . implode(", ", $campos) . " WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($tipos, ...$valores);

if ($stmt->execute()) {
    // Actualizar sesión
    if (!empty($nuevoEmail)) $_SESSION['user_email'] = $nuevoEmail;
    if (!empty($nuevoDni)) $_SESSION['user_dni'] = $nuevoDni;
    
    echo json_encode([
        "status" => "success",
        "message" => "✅ Datos actualizados",
        "user" => ["email" => $_SESSION['user_email'], "dni" => $_SESSION['user_dni']]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al actualizar ❌"]);
}
?>