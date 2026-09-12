<?php
/** POST {password} → {role} — which role does this password hold? */
require __DIR__ . '/config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') mp_json_out(405, ['error' => 'method not allowed']);
$body = mp_read_body(2048);
$role = mp_check_admin($body['password'] ?? null, ['super', 'moderator', 'judge']);
mp_json_out(200, ['role' => $role]);
