<?php
/**
 * Organiser WhatsApp alert via CallMeBot (configured in whatsapp-config.php).
 * Returns 'sent' | 'failed' | 'off'. Never throws, never blocks longer than ~12s.
 */
@include_once __DIR__ . '/whatsapp-config.php';

function mp_wa_send(string $text): string {
  if (!defined('MP_WA_APIKEY') || MP_WA_APIKEY === '' || !defined('MP_WA_PHONE')) return 'off';
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
  return $ok ? 'sent' : 'failed';
}

/** Locked read-modify-write of mp-data/entries.json; $fn receives and returns the list. */
function mp_entries_mutate(callable $fn) {
  $file = MP_DATA_DIR . '/entries.json';
  if (function_exists('mp_daily_backup')) mp_daily_backup('entries.json');
  $fp = fopen($file, 'c+');
  if (!$fp || !flock($fp, LOCK_EX)) return null;
  $size = fstat($fp)['size'];
  $list = $size ? json_decode(stream_get_contents($fp), true) : [];
  if (!is_array($list)) $list = [];
  $out = $fn($list);
  if (is_array($out)) {
    rewind($fp); ftruncate($fp, 0);
    fwrite($fp, json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($fp);
  }
  flock($fp, LOCK_UN); fclose($fp);
  return $out;
}
