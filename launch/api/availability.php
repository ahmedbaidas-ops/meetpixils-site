<?php
/** Public seat availability per pass — {normal: {cap, sold, left}, ...}; cap 0 = unlimited. */
require __DIR__ . '/config.php';
$caps = ['normal' => 0, 'diamond' => 0];
$names = ['normal' => 'Normal pass', 'diamond' => 'Diamond pass'];
$cf = MP_DATA_DIR . '/content.json';
if (is_file($cf)) {
  $c = json_decode((string)file_get_contents($cf), true);
  foreach ($caps as $k => $_) {
    if (is_numeric($c['settings']['capacity'][$k] ?? null)) $caps[$k] = (int)$c['settings']['capacity'][$k];
  }
}
$sold = ['normal' => 0, 'diamond' => 0];
$ef = MP_DATA_DIR . '/entries.json';
$all = is_file($ef) ? json_decode((string)file_get_contents($ef), true) : [];
foreach ((is_array($all) ? $all : []) as $e) {
  if (($e['_kind'] ?? '') !== 'ticket' || ($e['status'] ?? '') === 'rejected') continue;
  foreach ($names as $k => $n) if (($e['pass'] ?? '') === $n) $sold[$k]++;
}
$out = [];
foreach ($caps as $k => $cap) {
  $out[$k] = ['cap' => $cap, 'sold' => $sold[$k], 'left' => $cap > 0 ? max(0, $cap - $sold[$k]) : null];
}
mp_json_out(200, $out);
