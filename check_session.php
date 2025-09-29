<?php
require "session.php";
header('Content-Type: application/json');

if (estaLogueado()) {
    echo json_encode([
        "authenticated" => true,
        "user" => [
            "email" => $_SESSION['user_email'],
            "dni" => $_SESSION['user_dni']
        ]
    ]);
} else {
    echo json_encode(["authenticated" => false]);
}
?>