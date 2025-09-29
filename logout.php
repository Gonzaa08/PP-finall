<?php
require "session.php";
header('Content-Type: application/json');

cerrarSesion();
echo json_encode(["status" => "success", "message" => "✅ Sesión cerrada"]);
?>