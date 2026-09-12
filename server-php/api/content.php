<?php
/** Published site content. GET = public read. POST {password, store} = publish from /admin. */
require __DIR__ . '/config.php';
$file = MP_DATA_DIR . '/content.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo is_file($file) ? file_get_contents($file) : '{}';
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $body = mp_read_body(262144);
  mp_check_admin($body['password'] ?? null);
  $store = $body['store'] ?? null;
  if (!is_array($store) || !isset($store['objects']) || !is_array($store['objects'])
      || count($store['objects']) < 1 || count($store['objects']) > 100) {
    mp_json_out(400, ['error' => 'store.objects missing or malformed']);
  }
  $store = ['objects' => $store['objects'], 'faces' => $store['faces'] ?? [], 'works' => $store['works'] ?? [], 'settings' => $store['settings'] ?? new stdClass()];
  mp_daily_backup('content.json');
  if (is_file($file)) @copy($file, MP_DATA_DIR . '/content.prev.json'); // one-step rollback
  $tmp = $file . '.tmp';
  if (file_put_contents($tmp, json_encode($store, JSON_UNESCAPED_UNICODE), LOCK_EX) === false || !rename($tmp, $file)) {
    mp_json_out(500, ['error' => 'could not write content']);
  }
  mp_json_out(200, ['ok' => true]);
}

mp_json_out(405, ['error' => 'method not allowed']);
