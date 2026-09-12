<?php
/**
 * MeetPixils server config — the ONE file you edit.
 *  1. Change MP_ADMIN_PASSWORD before going live (this is what /admin asks for).
 *  2. Optionally set MP_NOTIFY_EMAIL to get an email for every ticket/form entry.
 */
define('MP_ADMIN_PASSWORD', 'MPADMIN12345');
define('MP_NOTIFY_EMAIL', '');                       // e.g. 'hello@meetpixils.com'
define('MP_DATA_DIR', __DIR__ . '/../mp-data');      // protected by its own .htaccess

@mkdir(MP_DATA_DIR, 0755, true);

function mp_json_out(int $code, array $data): void {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}
function mp_read_body(int $maxBytes): array {
  $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
  if ($raw === false || strlen($raw) > $maxBytes) mp_json_out(413, ['error' => 'payload too large']);
  $d = json_decode($raw, true);
  if (!is_array($d)) mp_json_out(400, ['error' => 'invalid JSON']);
  return $d;
}
function mp_role($given): ?string {
  if (!is_string($given) || $given === '') return null;
  if (hash_equals(MP_ADMIN_PASSWORD, $given)) return 'super';
  if (defined('MP_ROLES')) {
    foreach (MP_ROLES as $pw => $role) {
      if (hash_equals((string)$pw, $given)) return $role;
    }
  }
  return null;
}
function mp_check_admin($given, array $allowed = ['super']): string {
  @include_once __DIR__ . '/roles-config.php';
  $role = mp_role($given);
  if ($role === null || !in_array($role, $allowed, true)) {
    usleep(400000); // slow brute force
    mp_json_out(401, ['error' => 'wrong password or not allowed for this role']);
  }
  return $role;
}

/* ---- buyer notification email (best-effort; never blocks the request) ---- */
function mp_mail_buyer(string $to, string $subject, string $bodyEn, string $bodyAr): void {
  if (!filter_var($to, FILTER_VALIDATE_EMAIL)) return;
  $body = $bodyEn . "\n\n---\n\n" . $bodyAr . "\n\n— MeetPixils · meetpixils.com";
  $headers = "From: MeetPixils <no-reply@meetpixils.com>\r\n"
           . (MP_NOTIFY_EMAIL !== '' ? "Reply-To: " . MP_NOTIFY_EMAIL . "\r\n" : "")
           . "Content-Type: text/plain; charset=utf-8";
  @mail($to, $subject, $body, $headers);
}

/* ---- daily snapshot before the first mutation of each day (kept 30 days) ---- */
function mp_daily_backup(string $name): void {
  $src = MP_DATA_DIR . '/' . $name;
  if (!is_file($src)) return;
  $dir = MP_DATA_DIR . '/backups';
  @mkdir($dir, 0755, true);
  $dst = $dir . '/' . date('Ymd') . '-' . $name;
  if (!is_file($dst)) {
    @copy($src, $dst);
    $old = glob($dir . '/*-' . $name) ?: [];
    if (count($old) > 30) { sort($old); foreach (array_slice($old, 0, count($old) - 30) as $f) @unlink($f); }
  }
}
