<?php
/**
 * CliQ ticket flow. POST JSON:
 *   { pass: normal|diamond, name, email, loyalty: bool,
 *     receipt_b64?: dataURL-or-base64 jpeg/png,   // required unless loyalty
 *     stamp_b64?:  dataURL-or-base64 jpeg/png }   // required if loyalty
 * Creates entry with status "receipt-review" (paid up front, needs checking)
 * or "loyalty-review" (stamp first; they pay after approval).
 * Images land in mp-data/receipts/ — web-blocked, served only via receipt.php with the admin password.
 */
require __DIR__ . '/config.php';
require __DIR__ . '/pay-config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') mp_json_out(405, ['error' => 'method not allowed']);
$body = mp_read_body(9000000); // images inside — capped ~9MB raw JSON
if (!empty($body['_hp'])) mp_json_out(200, ['ok' => true]);

// prices follow the PUBLISHED settings (admin → Site → publish); fallbacks match defaults
$P = ['normal' => 30, 'diamond' => 50]; $LOY = 0.6;
$cf = MP_DATA_DIR . '/content.json';
if (is_file($cf)) {
  $c = json_decode((string)file_get_contents($cf), true);
  if (is_numeric($c['settings']['passes']['normal'] ?? null)) $P['normal'] = (int)$c['settings']['passes']['normal'];
  if (is_numeric($c['settings']['passes']['diamond'] ?? null)) $P['diamond'] = (int)$c['settings']['passes']['diamond'];
  if (is_numeric($c['settings']['loyaltyOff'] ?? null)) $LOY = (float)$c['settings']['loyaltyOff'];
}
$PASSES = [
  'normal' => ['Normal pass', $P['normal'], (int)round($P['normal'] * (1 - $LOY))],
  'diamond' => ['Diamond pass', $P['diamond'], (int)round($P['diamond'] * (1 - $LOY))],
];
$passId = $body['pass'] ?? '';
if (!isset($PASSES[$passId])) mp_json_out(400, ['error' => 'unknown pass']);
[$passName, $full, $disc] = $PASSES[$passId];
$loyal = !empty($body['loyalty']);
$name = trim(substr((string)($body['name'] ?? ''), 0, 120));
$email = trim(substr((string)($body['email'] ?? ''), 0, 160));
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) mp_json_out(400, ['error' => 'name/email invalid']);

function mp_save_image(?string $b64, string $base): ?string {
  if (!$b64) return null;
  if (str_contains($b64, ',')) $b64 = explode(',', $b64, 2)[1]; // strip dataURL prefix
  $raw = base64_decode($b64, true);
  if ($raw === false || strlen($raw) < 1000) mp_json_out(400, ['error' => 'image unreadable']);
  if (strlen($raw) > 6000000) mp_json_out(413, ['error' => 'image too large']);
  $isJpg = substr($raw, 0, 3) === "\xFF\xD8\xFF";
  $isPng = substr($raw, 0, 8) === "\x89PNG\r\n\x1a\n";
  if (!$isJpg && !$isPng) mp_json_out(400, ['error' => 'JPG or PNG only']);
  @mkdir(MP_DATA_DIR . '/receipts', 0755, true);
  $f = $base . '-' . substr(bin2hex(random_bytes(3)), 0, 5) . ($isJpg ? '.jpg' : '.png');
  if (file_put_contents(MP_DATA_DIR . '/receipts/' . $f, $raw) === false) mp_json_out(500, ['error' => 'could not store image']);
  return $f;
}

if ($loyal && empty($body['stamp_b64'])) mp_json_out(400, ['error' => 'stamp pass photo required for the loyalty discount']);
if (!$loyal && empty($body['receipt_b64'])) mp_json_out(400, ['error' => 'CliQ receipt required']);

// capacity: published settings; a pass is full when non-rejected tickets reach its cap
$CAPS = ['normal' => 0, 'diamond' => 0];
if (is_file($cf)) {
  if (is_numeric($c['settings']['capacity']['normal'] ?? null)) $CAPS['normal'] = (int)$c['settings']['capacity']['normal'];
  if (is_numeric($c['settings']['capacity']['diamond'] ?? null)) $CAPS['diamond'] = (int)$c['settings']['capacity']['diamond'];
}
if ($CAPS[$passId] > 0) {
  $ef = MP_DATA_DIR . '/entries.json';
  $all = is_file($ef) ? json_decode((string)file_get_contents($ef), true) : [];
  $sold = 0;
  foreach ((is_array($all) ? $all : []) as $e) {
    if (($e['_kind'] ?? '') === 'ticket' && ($e['pass'] ?? '') === $passName && ($e['status'] ?? '') !== 'rejected') $sold++;
  }
  if ($sold >= $CAPS[$passId]) mp_json_out(409, ['error' => 'sold out', 'soldout' => true]);
}

$order = 'MP-' . date('ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
$receipt = mp_save_image($body['receipt_b64'] ?? null, $order . '-receipt');
$stamp = mp_save_image($body['stamp_b64'] ?? null, $order . '-stamp');

$entry = [
  '_kind' => 'ticket', '_ts' => gmdate('c'), 'order' => $order,
  'status' => $loyal ? 'loyalty-review' : 'receipt-review',
  'name' => $name, 'email' => $email, 'pass' => $passName,
  'price' => ($loyal ? $disc : $full) . ' JOD',
  'loyalty' => $loyal ? '3+ stamps (photo attached)' : 'no',
];
if ($receipt) $entry['receipt'] = $receipt;
if ($stamp) $entry['stamp'] = $stamp;
mp_entries_update(function ($list) use ($entry) { $list[] = $entry; return $list; });

// acknowledge to the buyer immediately (promise #1)
if ($loyal) {
  mp_mail_buyer($email, "MeetPixils — stamp pass received ($order)",
    "We got your stamp pass photo (order $order). We review it and email you the approval — then you pay the discounted {$entry['price']} via CliQ and reply with the receipt.",
    "وصلتنا صورة باس الأختام (طلب $order). منراجعها ومنبعتلك الموافقة عالإيميل — بعدها بتحوّل {$entry['price']} عبر كليك وبترد بالإيصال.");
} else {
  mp_mail_buyer($email, "MeetPixils — receipt received ($order)",
    "We got your CliQ receipt (order $order · {$passName} · {$entry['price']}). We match it by hand and email your confirmation — usually within a few hours.",
    "وصلنا إيصال كليك تبعك (طلب $order). منطابقه يدوياً ومنبعتلك التأكيد عالإيميل — عادةً خلال ساعات.");
}

if (MP_NOTIFY_EMAIL !== '') {
  @mail(MP_NOTIFY_EMAIL, 'MeetPixils ticket: ' . $entry['status'] . ' ' . $order,
        "{$name} <{$email}> — {$passName} {$entry['price']}\nStatus: {$entry['status']}\nCheck /admin to review the attachments.",
        "From: no-reply@meetpixils.com");
}
mp_json_out(200, ['ok' => true, 'order' => $order]);
