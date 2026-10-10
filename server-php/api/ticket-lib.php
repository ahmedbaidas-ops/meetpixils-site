<?php
/**
 * Early-bird ticket rules — pure functions, testable alone.
 * Lifecycle: pending (proof uploaded) → approved | rejected (admin decides).
 * The buyer's QR encodes /ticket/?t=<token>; the token is the only key to the ticket view.
 */
require_once __DIR__ . '/battle-lib.php'; // mp_b_clean, mp_b_phone

function mp_t_validate(array $body, array $passes): array {
  $fail = fn(string $err, string $field) => ['ok' => false, 'code' => 400, 'error' => $err, 'field' => $field];
  $pass = (string)($body['pass'] ?? '');
  if (!isset($passes[$pass])) return $fail('Choose a pass.', 'pass');
  $name = mp_b_clean((string)($body['name'] ?? ''), 80);
  if (mb_strlen($name) < 2) return $fail('Add your full name — it goes on the ticket.', 'name');
  $phone = mp_b_phone((string)($body['phone'] ?? ''));
  if ($phone === null) return $fail('Add your phone number, e.g. 079 123 4567.', 'phone');
  $email = strtolower(mp_b_clean((string)($body['email'] ?? ''), 160));
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return $fail('That email doesn\'t look right.', 'email');
  if (!is_string($body['proof_b64'] ?? null) || $body['proof_b64'] === '') return $fail('Attach a screenshot of your CliQ transfer.', 'proof');
  $p = $passes[$pass];
  return ['ok' => true, 'entry' => [
    'pass_id' => $pass, 'pass' => $p['en'], 'price' => $p['price'] . ' JOD',
    'name' => $name, 'phone' => $phone, 'email' => $email,
  ]];
}

/** Decode an uploaded proof image. Returns ['raw' => bytes, 'ext' => 'jpg'|'png'] or an error string. */
function mp_t_image(string $b64) {
  if (str_contains($b64, ',')) $b64 = explode(',', $b64, 2)[1];
  $raw = base64_decode($b64, true);
  if ($raw === false || strlen($raw) < 1000) return 'We couldn\'t read that image — try a screenshot.';
  if (strlen($raw) > 6000000) return 'That image is too large — a screenshot works best.';
  if (substr($raw, 0, 3) === "\xFF\xD8\xFF") return ['raw' => $raw, 'ext' => 'jpg'];
  if (substr($raw, 0, 8) === "\x89PNG\r\n\x1a\n") return ['raw' => $raw, 'ext' => 'png'];
  return 'Please attach a JPG or PNG screenshot.';
}

/** Find a ticket by its QR token (constant-time compare). */
function mp_t_find(array $list, string $token): ?array {
  if (!preg_match('/^[a-f0-9]{32}$/', $token)) return null;
  foreach ($list as $e) {
    if (($e['_kind'] ?? '') === 'ticket' && isset($e['token']) && hash_equals((string)$e['token'], $token)) return $e;
  }
  return null;
}

/** Find a ticket by email + reference — the "I lost my QR" path. */
function mp_t_find_by_ref(array $list, string $email, string $ref): ?array {
  $email = strtolower(trim($email)); $ref = strtoupper(trim($ref));
  if ($email === '' || $ref === '') return null;
  foreach (array_reverse($list) as $e) {
    if (($e['_kind'] ?? '') === 'ticket' && isset($e['token'])
        && strtoupper((string)($e['ref'] ?? '')) === $ref && strtolower((string)($e['email'] ?? '')) === $email) return $e;
  }
  return null;
}

/** What the ticket page may show. Never the email, phone or proof image. */
function mp_t_public(array $e): array {
  return [
    'status' => $e['status'] ?? 'pending',
    'ref' => $e['ref'] ?? '',
    'name' => $e['name'] ?? '',
    'pass_id' => $e['pass_id'] ?? '',
    'pass' => $e['pass'] ?? '',
    'price' => $e['price'] ?? '',
    'created' => $e['_ts'] ?? '',
    'decided' => $e['decided_at'] ?? '',
  ];
}

function mp_t_alert(array $e): string {
  return "🎟 New ticket — " . $e['pass'] . ' · ' . $e['price'] . ($e['earlybird'] ? ' (early bird)' : '') . "\n"
       . $e['name'] . ' — ' . $e['phone'] . "\n"
       . 'Check the CliQ proof and approve in admin. Ref ' . $e['ref'];
}
