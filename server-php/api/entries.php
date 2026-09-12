<?php
/** Form + ticket submissions. POST = public submit. GET with X-MP-Pass header = admin list. */
require __DIR__ . '/config.php';
require __DIR__ . '/pay-config.php';
$file = MP_DATA_DIR . '/entries.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  mp_check_admin($_SERVER['HTTP_X_MP_PASS'] ?? null, ['super', 'moderator']);
  $list = is_file($file) ? json_decode(file_get_contents($file), true) : [];
  mp_json_out(200, ['entries' => is_array($list) ? $list : []]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') mp_json_out(405, ['error' => 'method not allowed']);

$body = mp_read_body(8192);
if (!empty($body['_hp'])) mp_json_out(200, ['ok' => true]); // honeypot: swallow bots silently

// admin: update a ticket's status (approve loyalty, mark paid, reject)
// judge (or above): file an evaluation against a competition entry
if (($body['_action'] ?? '') === 'evaluate') {
  mp_check_admin($body['password'] ?? null, ['super', 'judge']);
  $ev = $body['evaluation'] ?? null;
  if (!is_array($ev)) mp_json_out(400, ['error' => 'evaluation missing']);
  $entry = ['_kind' => 'evaluation', '_ts' => gmdate('c')];
  foreach (['judge', 'comp', 'team', 'note', 'total'] as $k) {
    $entry[$k] = substr(preg_replace('/[\x00-\x1F]/u', '', (string)($ev[$k] ?? '')), 0, 400);
  }
  if ($entry['judge'] === '' || $entry['comp'] === '' || $entry['team'] === '') mp_json_out(400, ['error' => 'judge, competition and team are required']);
  $scores = $ev['scores'] ?? [];
  if (is_array($scores)) { $c = []; $n = 0;
    foreach ($scores as $k => $v) { if (++$n > 10) break; $c[substr((string)$k, 0, 40)] = max(0, min(10, (float)$v)); }
    $entry['scores'] = $c;
  }
  mp_entries_update(function ($list) use ($entry) { $list[] = $entry; return $list; });
  mp_json_out(200, ['ok' => true]);
}

if (($body['_action'] ?? '') === 'set-status') {
  mp_check_admin($body['password'] ?? null, ['super', 'moderator']);
  $order = (string)($body['order'] ?? '');
  $status = (string)($body['status'] ?? '');
  $allowed = ['receipt-review', 'loyalty-review', 'approved-pay-now', 'paid', 'rejected'];
  if ($order === '' || !in_array($status, $allowed, true)) mp_json_out(400, ['error' => 'bad order/status']);
  $target = null;
  mp_entries_update(function ($list) use ($order, $status, &$target) {
    foreach ($list as &$e) if (($e['order'] ?? '') === $order) { $e['status'] = $status; $target = $e; }
    return $list;
  });
  // keep the "we'll email you" promise automatically
  if ($target && !empty($target['email'])) {
    $price = (string)($target['price'] ?? '');
    $cliq = '0791319628';
    $cf = MP_DATA_DIR . '/content.json';
    if (is_file($cf)) { $c = json_decode((string)file_get_contents($cf), true); if (!empty($c['settings']['cliq'])) $cliq = (string)$c['settings']['cliq']; }
    switch ($status) {
      case 'approved-pay-now':
        mp_mail_buyer($target['email'], "MeetPixils — loyalty approved, one step left ($order)",
          "Good news — your loyalty discount is approved!\nSend $price via CliQ to $cliq, then reply to this email with the transfer receipt. Your seat is confirmed the moment we match it.",
          "خبر حلو — خصم الولاء تبعك انقبل!\nحوّل $price عبر كليك على الرقم $cliq وبعدها رد على هالإيميل بصورة الإيصال. مقعدك بينأكد أول ما نطابقه.");
        break;
      case 'paid':
        mp_mail_buyer($target['email'], "MeetPixils — you're in ✓ ($order)",
          "Payment confirmed — you're in!\nOrder: $order · " . ($target['pass'] ?? '') . " · $price\nShow this email at the door on 26 September at The ARC, Amman.",
          "الدفع تأكد — إنت جوّا!\nرقم الطلب: $order\nفرجينا هالإيميل عالباب يوم ٢٦ أيلول في ذا آرك، عمّان.");
        break;
      case 'rejected':
        mp_mail_buyer($target['email'], "MeetPixils — we couldn't verify your ticket ($order)",
          "We couldn't verify this submission (order $order). If you believe this is a mistake, just reply to this email and we'll sort it out together.",
          "ما قدرنا نأكد طلبك ($order). إذا بتعتقد صار خطأ، رد على هالإيميل ومنحلها سوا.");
        break;
    }
  }
  mp_json_out(200, ['ok' => true]);
}

// sanitize: scalars only, capped sizes
$entry = [];
$n = 0;
foreach ($body as $k => $v) {
  if (!is_scalar($v) || ++$n > 40) continue;
  $k = substr(preg_replace('/[^\w.\-]/u', '', (string)$k), 0, 64);
  $v = substr(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', (string)$v), 0, 2000);
  if ($k !== '') $entry[$k] = $v;
}
if (!isset($entry['_kind']) && !isset($entry['name']) && !isset($entry['email'])) {
  mp_json_out(400, ['error' => 'empty entry']);
}
$entry['_ts'] = gmdate('c');

$fp = fopen($file, 'c+');
if (!$fp || !flock($fp, LOCK_EX)) mp_json_out(500, ['error' => 'storage busy']);
$stat = fstat($fp);
if ($stat['size'] > 4194304) { flock($fp, LOCK_UN); fclose($fp); mp_json_out(507, ['error' => 'storage full']); }
$list = $stat['size'] ? json_decode(stream_get_contents($fp), true) : [];
if (!is_array($list)) $list = [];
$list[] = $entry;
rewind($fp); ftruncate($fp, 0);
fwrite($fp, json_encode($list, JSON_UNESCAPED_UNICODE));
fflush($fp); flock($fp, LOCK_UN); fclose($fp);

if (MP_NOTIFY_EMAIL !== '') {
  $subj = 'MeetPixils: new ' . ($entry['_kind'] ?? 'entry');
  @mail(MP_NOTIFY_EMAIL, $subj, json_encode($entry, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        "From: no-reply@meetpixils.com\r\nContent-Type: text/plain; charset=utf-8");
}
mp_json_out(200, ['ok' => true]);
