<?php
/**
 * POST MeetBattle registration → validate (battle-lib.php) → save to entries.json
 * → WhatsApp + email alert to the organiser. Self-contained on purpose: it only
 * needs mp_json_out / mp_read_body / MP_DATA_DIR from config.php, so it also runs
 * next to older api/ files.
 */
require __DIR__ . '/config.php';
require __DIR__ . '/battle-lib.php';
@include __DIR__ . '/whatsapp-config.php';

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
$list[] = ['_kind' => 'battle-reg', '_ts' => gmdate('c'), 'ref' => $ref] + $entry;
rewind($fp); ftruncate($fp, 0);
fwrite($fp, json_encode($list, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
fflush($fp); flock($fp, LOCK_UN); fclose($fp);

// ---- alerts: never block or fail the registration ----
$text = mp_b_alert($entry, $ref);
$wa = 'off';
if (defined('MP_WA_APIKEY') && MP_WA_APIKEY !== '' && defined('MP_WA_PHONE')) {
  $url = 'https://api.callmebot.com/whatsapp.php?phone=' . rawurlencode(MP_WA_PHONE)
       . '&text=' . rawurlencode($text) . '&apikey=' . rawurlencode(MP_WA_APIKEY);
  // CallMeBot answers 200 + "Message queued…" on success; failures come back as
  // e.g. 203 "APIKey is invalid", so require both the status and positive wording.
  $code = 0; $res = false;
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 12, CURLOPT_CONNECTTIMEOUT => 6]);
    $res = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
  } else {
    $res = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 12, 'ignore_errors' => true]]));
    if (isset($http_response_header[0]) && preg_match('#\s(\d{3})\s#', $http_response_header[0], $mm)) $code = (int)$mm[1];
  }
  $body = strtolower((string)$res);
  $ok = $res !== false && $code === 200
     && (str_contains($body, 'queued') || str_contains($body, 'sent'))
     && !str_contains($body, 'invalid') && !str_contains($body, 'error');
  $wa = $ok ? 'sent' : 'failed';
}
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
mp_json_out(200, ['ok' => true, 'ref' => $ref, 'wa' => $wa]);
