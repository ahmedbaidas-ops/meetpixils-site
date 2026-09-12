<?php
/** Ticket-holder status lookup. POST {email, order} — both must match the entry
 *  (possession of the pair, shown at submission time, is the authentication). */
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') mp_json_out(405, ['error' => 'method not allowed']);
$body = mp_read_body(2048);
$email = strtolower(trim((string)($body['email'] ?? '')));
$order = strtoupper(trim((string)($body['order'] ?? '')));
if ($email === '' || $order === '') mp_json_out(400, ['error' => 'email and order required']);

$file = MP_DATA_DIR . '/entries.json';
$list = is_file($file) ? json_decode((string)file_get_contents($file), true) : [];
if (!is_array($list)) $list = [];

foreach (array_reverse($list) as $e) {
  if (($e['_kind'] ?? '') === 'ticket'
      && strtoupper((string)($e['order'] ?? '')) === $order
      && strtolower(trim((string)($e['email'] ?? ''))) === $email) {
    mp_json_out(200, ['found' => true, 'status' => $e['status'] ?? 'received',
                      'pass' => $e['pass'] ?? '', 'price' => $e['price'] ?? '']);
  }
}
usleep(300000); // slow guessing
mp_json_out(200, ['found' => false]);
