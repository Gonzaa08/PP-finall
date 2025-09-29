<?php
require "db.php";
require "session.php";

header('Content-Type: application/json');

// Verificar que esté logueado
if (!estaLogueado()) {
    echo json_encode([
        "status" => "error", 
        "message" => "Debe iniciar sesión para realizar la compra ❌"
    ]);
    exit;
}

$userId = $_SESSION['user_id'];
$carrito = $_POST['carrito'] ?? '';
$total = $_POST['total'] ?? 0;

// Validar datos
if (empty($carrito) || $total <= 0) {
    echo json_encode([
        "status" => "error", 
        "message" => "El carrito está vacío ❌"
    ]);
    exit;
}

// Insertar pedido
$sql = "INSERT INTO pedidos (usuario_id, productos, total, estado) VALUES (?, ?, ?, 'pendiente')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isd", $userId, $carrito, $total);

if ($stmt->execute()) {
    $pedidoId = $conn->insert_id;
    
    echo json_encode([
        "status" => "success",
        "message" => "✅ ¡Pedido realizado con éxito!",
        "pedido_id" => $pedidoId
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Error al procesar el pedido ❌"
    ]);
}

$stmt->close();
$conn->close();
?>