<?php
/**
 * Ticket status for the QR page.
 *   GET  ?t=<token>          → the ticket behind a QR
 *   POST {email, ref}        → recover a lost QR (returns the token too)
 */
require __DIR__ . '/config.php';
require __DIR__ . '/ticket-config.php';
require __DIR__ . '/ticket-lib.php';

$file = MP_DATA_DIR . '/entries.json';
$list = is_file($file) ? json_decode((string)file_get_contents($file), true) : [];
if (!is_array($list)) $list = [];
$extra = ['event' => MP_T_EVENT, 'passes' => MP_T_PASSES, 'review_days' => MP_T_REVIEW_DAYS, 'alias' => MP_T_CLIQ_ALIAS];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $e = mp_t_find($list, (string)($_GET['t'] ?? ''));
  if (!$e) mp_json_out(404, ['error' => 'Ticket not found.']);
  mp_json_out(200, ['ticket' => mp_t_public($e)] + $extra);
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $b = mp_read_body(2048);
  $e = mp_t_find_by_ref($list, (string)($b['email'] ?? ''), (string)($b['ref'] ?? ''));
  if (!$e) { usleep(300000); mp_json_out(404, ['error' => 'No ticket matches that email and reference.']); }
  mp_json_out(200, ['ticket' => mp_t_public($e), 'token' => $e['token']] + $extra);
}
mp_json_out(405, ['error' => 'method not allowed']);
