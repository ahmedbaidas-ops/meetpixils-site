<?php
/**
 * POST MeetBattle registration → validate (battle-lib.php) → save to entries.json
 * → WhatsApp + email alert to the organiser. Self-contained on purpose: it only
 * needs mp_json_out / mp_read_body / MP_DATA_DIR from config.php, so it also runs
 * next to older api/ files.
 */
require __DIR__ . '/config.php';
require __DIR__ . '/battle-lib.php';
@include __DIR__ . '/battle-config.php';
require __DIR__ . '/wa-lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') mp_json_out(405, ['error' => 'method not allowed']);
$body = mp_read_body(24576);
if (!empty($body['_hp'])) mp_json_out(200, ['ok' => true, 'ref' => 'MB-0', 'wa' => 'off']); // bot trap

$v = mp_b_validate($body);
if (!$v['ok']) mp_json_out($v['code'], ['error' => $v['error'], 'field' => $v['field']]);
$entry = $v['entry'];

$file = MP_DATA_DIR . '/entries.json';
if (function_exists('mp_daily_backup')) mp_daily_backup('entries.json');
$ref = 'MB-' . date('ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));

// one locked read-check-append, so two simultaneous registrations can't both pass the duplicate check
$fp = fopen($file, 'c+');
if (!$fp || !flock($fp, LOCK_EX)) mp_json_out(503, ['error' => 'Busy — please try again in a moment.']);
$size = fstat($fp)['size'];
$list = $size ? json_decode(stream_get_contents($fp), true) : [];
if (!is_array($list)) $list = [];
$dupes = mp_b_duplicates($entry, $list);
if ($dupes) {
  flock($fp, LOCK_UN); fclose($fp);
  mp_json_out(409, ['error' => 'Already registered: ' . implode(', ', $dupes) . '. To change details, message us on WhatsApp.', 'field' => 'duplicate', 'emails' => $dupes]);
}
$waitlist = false;
if (defined('MP_BT_SEED')) {
  $st = mp_bt_stats($list, MP_BT_SEED, MP_BT_TEAMS_FORMED, MP_BT_TEAMS_LEFT, 'none');
  $waitlist = $st['full'];
}
$list[] = ['_kind' => 'battle-reg', '_ts' => gmdate('c'), 'ref' => $ref] + ($waitlist ? ['waitlist' => true] : []) + $entry;
rewind($fp); ftruncate($fp, 0);
fwrite($fp, json_encode($list, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
fflush($fp); flock($fp, LOCK_UN); fclose($fp);

// ---- alerts: never block or fail the registration ----
$text = ($waitlist ? "⏳ WAITLIST — teams are full\n" : '') . mp_b_alert($entry, $ref);
$wa = mp_wa_send($text);
if (defined('MP_NOTIFY_EMAIL') && MP_NOTIFY_EMAIL !== '') {
  @mail(MP_NOTIFY_EMAIL, 'MeetBattle registration ' . $ref, $text, "From: no-reply@meetpixils.com\r\nContent-Type: text/plain; charset=utf-8");
}
if ($wa !== 'off') {
  // record the alert outcome so /admin shows who still needs a manual ping
  $fp = fopen($file, 'c+');
  if ($fp && flock($fp, LOCK_EX)) {
    $list = json_decode(stream_get_contents($fp), true);
    if (is_array($list)) {
      foreach ($list as &$e) if (($e['ref'] ?? '') === $ref) $e['wa'] = $wa;
      unset($e);
      rewind($fp); ftruncate($fp, 0);
      fwrite($fp, json_encode($list, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
      fflush($fp);
    }
    flock($fp, LOCK_UN); fclose($fp);
  }
}
mp_json_out(200, ['ok' => true, 'ref' => $ref, 'wa' => $wa, 'waitlist' => $waitlist]);
