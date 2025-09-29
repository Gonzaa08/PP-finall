<?php
require "db.php";
require "session.php";

header('Content-Type: application/json');

// Verificar que esté logueado
if (!estaLogueado()) {
    echo json_encode([
        "status" => "error", 
        "message" => "Debe iniciar sesión ❌"
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

// Obtener pedidos del usuario
$sql = "SELECT id, productos, total, estado, fecha FROM pedidos WHERE usuario_id=? ORDER BY fecha DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$pedidos = [];
while ($row = $result->fetch_assoc()) {
    $pedidos[] = [
        'id' => $row['id'],
        'productos' => json_decode($row['productos'], true),
        'total' => $row['total'],
        'estado' => $row['estado'],
        'fecha' => $row['fecha']
    ];
}

echo json_encode([
    "status" => "success",
    "pedidos" => $pedidos
]);

$stmt->close();
$conn->close();
?>