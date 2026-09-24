<?php
/**
 * Online ticket payment — hosted-checkout pattern.
 *   GET  ?status      → {enabled} so the frontend knows whether to show "Pay online".
 *   POST {pass,name,email} → creates a PENDING ticket entry + gateway session, returns {url}.
 * Prices are decided HERE, never trusted from the client.
 * The loyalty discount is intentionally door-only (it needs a physical stamp check).
 */
require __DIR__ . '/config.php';
require __DIR__ . '/pay-config.php';

$PASSES = ['normal' => ['Normal pass', 30], 'diamond' => ['Diamond pass', 50]];

function mp_pay_enabled(): bool {
  return MP_PAY_GATEWAY !== '' && MP_PAY_SERVER_KEY !== '' && MP_PAY_PROFILE !== '';
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  mp_json_out(200, ['enabled' => mp_pay_enabled()]);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') mp_json_out(405, ['error' => 'method not allowed']);
if (!mp_pay_enabled()) mp_json_out(503, ['error' => 'online payment not configured']);

$body = mp_read_body(4096);
$passId = $body['pass'] ?? '';
if (!isset($PASSES[$passId])) mp_json_out(400, ['error' => 'unknown pass']);
[$passName, $price] = $PASSES[$passId];
$name = trim(substr((string)($body['name'] ?? ''), 0, 120));
$email = trim(substr((string)($body['email'] ?? ''), 0, 160));
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) mp_json_out(400, ['error' => 'name/email invalid']);

$orderId = 'MP-' . date('ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));

mp_entries_update(function ($list) use ($orderId, $passName, $price, $name, $email) {
  $list[] = [
    '_kind' => 'ticket', '_ts' => gmdate('c'), 'order' => $orderId, 'status' => 'pending-payment',
    'name' => $name, 'email' => $email, 'pass' => $passName, 'price' => $price . ' JOD', 'loyalty' => 'no',
  ];
  return $list;
});

/* ---------------- gateway adapters ---------------- */
function mp_gateway_create(string $orderId, string $passName, int $price, string $name, string $email): array {
  switch (MP_PAY_GATEWAY) {
    case 'paytabs': {
      // PayTabs hosted payment page (docs: site.paytabs.com/en/developers)
      $payload = [
        'profile_id' => (int)MP_PAY_PROFILE,
        'tran_type' => 'sale', 'tran_class' => 'ecom',
        'cart_id' => $orderId,
        'cart_description' => 'MeetPixils Final Showcase — ' . $passName,
        'cart_currency' => MP_PAY_CURRENCY,
        'cart_amount' => $price,
        'customer_details' => ['name' => $name, 'email' => $email, 'country' => 'JO'],
        'return' => MP_SITE_URL . '/api/pay-return.php',
        'callback' => MP_SITE_URL . '/api/pay-return.php?cb=1',
        'hide_shipping' => true,
      ];
      $r = mp_curl_json(MP_PAY_ENDPOINT . '/payment/request', $payload, ['authorization: ' . MP_PAY_SERVER_KEY]);
      if (!isset($r['redirect_url'])) mp_json_out(502, ['error' => 'gateway rejected: ' . substr(json_encode($r), 0, 200)]);
      return ['url' => $r['redirect_url'], 'ref' => $r['tran_ref'] ?? ''];
    }
    default:
      mp_json_out(500, ['error' => 'unknown gateway ' . MP_PAY_GATEWAY]);
  }
}
function mp_curl_json(string $url, array $payload, array $headers): array {
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 25,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => array_merge(['content-type: application/json'], $headers),
  ]);
  $out = curl_exec($ch);
  if ($out === false) mp_json_out(502, ['error' => 'gateway unreachable: ' . curl_error($ch)]);
  curl_close($ch);
  $d = json_decode($out, true);
  return is_array($d) ? $d : [];
}

$session = mp_gateway_create($orderId, $passName, $price, $name, $email);
if ($session['ref'] !== '') {
  mp_entries_update(function ($list) use ($orderId, $session) {
    foreach ($list as &$e) if (($e['order'] ?? '') === $orderId) $e['tran_ref'] = $session['ref'];
    return $list;
  });
}
mp_json_out(200, ['url' => $session['url'], 'order' => $orderId]);
