<?php
/** Serves a stored proof image — admin password required (header or ?pass= for direct viewing). */
require __DIR__ . '/config.php';
mp_check_admin($_SERVER['HTTP_X_MP_PASS'] ?? $_GET['pass'] ?? null, ['super', 'moderator']);
$f = basename((string)($_GET['f'] ?? ''));
$path = MP_DATA_DIR . '/receipts/' . $f;
if ($f === '' || !is_file($path)) mp_json_out(404, ['error' => 'not found']);
header('Content-Type: ' . (str_ends_with($f, '.png') ? 'image/png' : 'image/jpeg'));
header('Cache-Control: no-store');
readfile($path);
