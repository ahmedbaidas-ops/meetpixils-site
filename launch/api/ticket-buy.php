<?php
/** POST a ticket purchase: details + CliQ proof → pending ticket + QR token. */
require __DIR__ . '/config.php';
require __DIR__ . '/ticket-config.php';
require __DIR__ . '/ticket-lib.php';
require __DIR__ . '/wa-lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') mp_json_out(405, ['error' => 'method not allowed']);
$body = mp_read_body(9000000);
if (!empty($body['_hp'])) mp_json_out(200, ['ok' => true, 'ref' => 'MP-0', 'token' => str_repeat('0', 32)]);

$v = mp_t_validate($body, MP_T_PASSES);
if (!$v['ok']) mp_json_out($v['code'], ['error' => $v['error'], 'field' => $v['field']]);
$img = mp_t_image((string)$body['proof_b64']);
if (is_string($img)) mp_json_out(400, ['error' => $img, 'field' => 'proof']);

$ref = 'MP-' . date('ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));
$token = bin2hex(random_bytes(16));
@mkdir(MP_DATA_DIR . '/receipts', 0755, true);
$proof = $ref . '-proof.' . $img['ext'];
if (file_put_contents(MP_DATA_DIR . '/receipts/' . $proof, $img['raw']) === false) mp_json_out(500, ['error' => 'Could not save your screenshot — please try again.']);

$entry = ['_kind' => 'ticket', '_ts' => gmdate('c'), 'ref' => $ref, 'order' => $ref, 'token' => $token,
          'status' => 'pending', 'earlybird' => MP_T_EARLYBIRD, 'receipt' => $proof] + $v['entry'];
$saved = mp_entries_mutate(function ($list) use ($entry) { $list[] = $entry; return $list; });
if ($saved === null) mp_json_out(503, ['error' => 'Busy — please try again in a moment.']);

$wa = mp_wa_send(mp_t_alert($entry));
if ($wa !== 'off') mp_entries_mutate(function ($list) use ($ref, $wa) {
  foreach ($list as &$e) if (($e['ref'] ?? '') === $ref) $e['wa'] = $wa;
  return $list;
});
$link = (defined('MP_SITE_URL') ? MP_SITE_URL : 'https://meetpixils.com') . '/ticket/?t=' . $token;
if (function_exists('mp_mail_buyer')) {
  mp_mail_buyer($entry['email'], "MeetPixils — ticket received ($ref)",
    "We got your payment proof for the {$entry['pass']} ({$entry['price']}). We check every transfer by hand and confirm within " . MP_T_REVIEW_DAYS . " days.\nYour ticket and its live status: $link",
    "وصلنا إثبات الدفع لـ{$entry['pass']} ({$entry['price']}). منراجع كل تحويل يدوياً ومنأكد خلال " . MP_T_REVIEW_DAYS . " أيام.\nتذكرتك وحالتها: $link");
}
mp_json_out(200, ['ok' => true, 'ref' => $ref, 'token' => $token]);
