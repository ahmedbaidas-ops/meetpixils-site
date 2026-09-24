<?php
/**
 * Online payment settings — the one file you edit to switch payments on.
 * Leave MP_PAY_GATEWAY empty and the site keeps the reserve-only flow.
 * Like config.php, future site updates never overwrite this file.
 */
define('MP_PAY_GATEWAY', '');            // e.g. 'paytabs'
define('MP_PAY_PROFILE', '');            // gateway profile / merchant id
define('MP_PAY_SERVER_KEY', '');         // gateway SECRET server key
define('MP_PAY_CURRENCY', 'JOD');
define('MP_PAY_ENDPOINT', 'https://secure-jordan.paytabs.com'); // use the exact base URL PayTabs gives you at signup
define('MP_SITE_URL', 'https://meetpixils.com');

/* shared entries storage used by pay.php / pay-return.php */
function mp_entries_update(callable $fn) {
  mp_daily_backup('entries.json');
  $file = MP_DATA_DIR . '/entries.json';
  $fp = fopen($file, 'c+');
  if (!$fp || !flock($fp, LOCK_EX)) mp_json_out(500, ['error' => 'storage busy']);
  $stat = fstat($fp);
  $list = $stat['size'] ? json_decode(stream_get_contents($fp), true) : [];
  if (!is_array($list)) $list = [];
  $list = $fn($list);
  rewind($fp); ftruncate($fp, 0);
  fwrite($fp, json_encode($list, JSON_UNESCAPED_UNICODE));
  fflush($fp); flock($fp, LOCK_UN); fclose($fp);
  return $list;
}
