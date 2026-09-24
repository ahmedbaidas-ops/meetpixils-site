<?php
/** Return + callback endpoint. NEVER trusts redirect params alone —
 *  re-queries the gateway with the secret key before marking anything paid. */
require __DIR__ . '/config.php';
require __DIR__ . '/pay-config.php';

function mp_verify_paytabs(string $tranRef): array {
  $ch = curl_init(MP_PAY_ENDPOINT . '/payment/query');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 25,
    CURLOPT_POSTFIELDS => json_encode(['profile_id' => (int)MP_PAY_PROFILE, 'tran_ref' => $tranRef]),
    CURLOPT_HTTPHEADER => ['content-type: application/json', 'authorization: ' . MP_PAY_SERVER_KEY],
  ]);
  $out = curl_exec($ch); curl_close($ch);
  $d = json_decode((string)$out, true);
  $ok = is_array($d) && (($d['payment_result']['response_status'] ?? '') === 'A');
  return [$ok, is_array($d) ? ($d['cart_id'] ?? '') : ''];
}

$tranRef = $_POST['tranRef'] ?? $_POST['tran_ref'] ?? $_GET['tranRef'] ?? '';
$isCallback = isset($_GET['cb']);
$status = 'failed'; $order = '';

if ($tranRef !== '' && MP_PAY_GATEWAY === 'paytabs') {
  [$ok, $order] = mp_verify_paytabs($tranRef);
  if ($ok && $order !== '') {
    $status = 'paid';
    mp_entries_update(function ($list) use ($order, $tranRef) {
      foreach ($list as &$e) {
        if (($e['order'] ?? '') === $order) { $e['status'] = 'paid'; $e['tran_ref'] = $tranRef; $e['paid_at'] = gmdate('c'); }
      }
      return $list;
    });
    if (MP_NOTIFY_EMAIL !== '') {
      @mail(MP_NOTIFY_EMAIL, 'MeetPixils: ticket PAID ' . $order, 'Order ' . $order . ' confirmed paid (' . $tranRef . ').',
            "From: no-reply@meetpixils.com");
    }
  }
}

if ($isCallback) mp_json_out(200, ['ok' => true]); // server-to-server ping: no redirect
header('Location: ' . MP_SITE_URL . '/whats-on/final-showcase-2026/tickets/?payment=' . $status . ($order ? '&order=' . rawurlencode($order) : ''));
exit;
