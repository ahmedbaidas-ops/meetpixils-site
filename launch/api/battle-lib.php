<?php
/**
 * MeetBattle registration rules — pure functions, no I/O, so they can be tested alone.
 *
 * Rules (organiser decisions, Oct 2026):
 *  - Every person needs a name, email, WhatsApp number, role and a portfolio link.
 *  - solo:    one person; we place them in a team.
 *  - team:    exactly three people, one of each role — 1 UX researcher,
 *             1 product designer, 1 brand designer. Team name required.
 *  - friends: 2–6 people whose roles don't make a valid trio; they register
 *             together and are placed into different teams.
 */

function mp_b_roles(): array {
  return [
    'ux-research' => ['en' => 'UX Researcher',    'lane' => 'UX/UI'],
    'product'     => ['en' => 'Product Designer', 'lane' => 'UX/UI'],
    'brand'       => ['en' => 'Brand Designer',   'lane' => 'Branding'],
  ];
}

function mp_b_clean(string $s, int $max): string {
  $s = preg_replace('/[\x00-\x1F\x7F]/u', '', $s) ?? '';
  return mb_substr(trim($s), 0, $max);
}

/** Portfolio link → normalised https URL, or null if it isn't a usable link. */
function mp_b_url(string $raw): ?string {
  $u = trim($raw);
  if ($u === '' || mb_strlen($u) > 300 || preg_match('/\s/u', $u)) return null;
  if (!preg_match('#^https?://#i', $u)) $u = 'https://' . $u;
  $host = parse_url($u, PHP_URL_HOST);
  if (!is_string($host) || !str_contains($host, '.') || str_starts_with($host, '.') || str_ends_with($host, '.')) return null;
  return $u;
}

/** Phone → +E.164. Jordanian forms 07…, 7…, 9627…, 009627…, +9627… all accepted. */
function mp_b_ascii_digits(string $s): string {
  static $map = null;
  if ($map === null) { $map = [];
    foreach (['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'] as $i => $c) $map[$c] = (string)$i;   // Arabic-Indic
    foreach (['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'] as $i => $c) $map[$c] = (string)$i;   // Persian
  }
  return strtr($s, $map);
}

function mp_b_phone(string $raw): ?string {
  $d = preg_replace('/[^\d+]/', '', mp_b_ascii_digits($raw)) ?? '';
  if (str_starts_with($d, '00')) $d = '+' . substr($d, 2);
  $digits = ltrim($d, '+');
  if (!ctype_digit($digits)) return null;
  if (!str_starts_with($d, '+')) {
    if (preg_match('/^07\d{8}$/', $digits)) return '+962' . substr($digits, 1);
    if (preg_match('/^7\d{8}$/', $digits))  return '+962' . $digits;
    if (preg_match('/^9627\d{8}$/', $digits)) return '+' . $digits;
    return null;
  }
  if (str_starts_with($digits, '962')) return preg_match('/^9627\d{8}$/', $digits) ? '+' . $digits : null;
  return (strlen($digits) >= 8 && strlen($digits) <= 15) ? '+' . $digits : null;
}

/**
 * Validate a submission. Returns ['ok' => true, 'entry' => [...]] or
 * ['ok' => false, 'code' => int, 'error' => string, 'field' => string|null].
 */
function mp_b_validate(array $body): array {
  $roles = mp_b_roles();
  $fail = fn(string $err, ?string $field = null, int $code = 400) => ['ok' => false, 'code' => $code, 'error' => $err, 'field' => $field];

  $mode = (string)($body['mode'] ?? '');
  if (!in_array($mode, ['solo', 'team', 'friends'], true)) return $fail('Choose solo or team.', 'mode');

  $raw = $body['members'] ?? null;
  if (!is_array($raw) || !array_is_list($raw)) return $fail('Member details are missing.', 'members');
  $n = count($raw);
  if ($mode === 'solo' && $n !== 1) return $fail('Solo registration is one person.', 'members');
  if ($mode === 'team' && $n !== 3) return $fail('A team is exactly three people.', 'members');
  if ($mode === 'friends' && ($n < 2 || $n > 6)) return $fail('Register between 2 and 6 friends together.', 'members');

  $members = []; $emails = []; $phones = [];
  foreach ($raw as $i => $m) {
    if (!is_array($m)) return $fail('Member details are malformed.', "members.$i");
    $who = $n > 1 ? 'Member ' . ($i + 1) . ': ' : '';
    $name = mp_b_clean((string)($m['name'] ?? ''), 80);
    if (mb_strlen($name) < 2) return $fail($who . 'add a name.', "members.$i.name");
    $email = strtolower(mp_b_clean((string)($m['email'] ?? ''), 160));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return $fail($who . 'that email doesn\'t look right.', "members.$i.email");
    if (isset($emails[$email])) return $fail($who . 'each person needs their own email.', "members.$i.email");
    $phone = mp_b_phone((string)($m['phone'] ?? ''));
    if ($phone === null) return $fail($who . 'add a WhatsApp number, e.g. 079 123 4567.', "members.$i.phone");
    if (isset($phones[$phone])) return $fail($who . 'each person needs their own number.', "members.$i.phone");
    $role = (string)($m['role'] ?? '');
    if (!isset($roles[$role])) return $fail($who . 'pick a role.', "members.$i.role");
    $portfolio = mp_b_url((string)($m['portfolio'] ?? ''));
    if ($portfolio === null) return $fail($who . 'a portfolio link is required to enter — Behance, Dribbble, a site, a Drive or Figma link all work.', "members.$i.portfolio");
    $emails[$email] = true; $phones[$phone] = true;
    $members[] = ['name' => $name, 'email' => $email, 'phone' => $phone, 'role' => $role,
                  'role_label' => $roles[$role]['en'], 'lane' => $roles[$role]['lane'], 'portfolio' => $portfolio];
  }

  $teamName = mp_b_clean((string)($body['team_name'] ?? ''), 40);
  if ($mode === 'team') {
    if (mb_strlen($teamName) < 2) return $fail('Give your team a name.', 'team_name');
    $picked = array_column($members, 'role');
    if (count(array_unique($picked)) !== 3) {
      return $fail('A team needs one of each role: 1 UX researcher, 1 product designer and 1 brand designer. Change a role, or register as friends and we\'ll place you in different teams.', 'roles', 422);
    }
  }

  return ['ok' => true, 'entry' => [
    'mode' => $mode,
    'team_name' => $teamName,
    'members' => $members,
    'name' => $members[0]['name'],
    'email' => $members[0]['email'],
    'phone' => $members[0]['phone'],
    'role' => $members[0]['role_label'],
    'portfolio' => $members[0]['portfolio'],
    'members_text' => implode(' · ', array_map(fn($m) => $m['name'] . ' (' . $m['role_label'] . ')', $members)),
  ]];
}

/** Every email in the submission that already appears in an earlier battle registration. */
function mp_b_duplicates(array $entry, array $existing): array {
  $seen = [];
  foreach ($existing as $e) {
    if (($e['_kind'] ?? '') !== 'battle-reg') continue;
    foreach ((is_array($e['members'] ?? null) ? $e['members'] : [['email' => $e['email'] ?? '']]) as $m) {
      $seen[strtolower((string)($m['email'] ?? ''))] = true;
    }
  }
  $dupes = [];
  foreach ($entry['members'] as $m) if (isset($seen[$m['email']])) $dupes[] = $m['email'];
  return $dupes;
}

/** The WhatsApp alert text for the organiser. Kept short — it's read on a lock screen. */
function mp_b_alert(array $entry, string $ref): string {
  $head = [
    'solo' => '🟣 MeetBattle · new SOLO',
    'team' => '🟣 MeetBattle · new TEAM — ' . $entry['team_name'],
    'friends' => '🟣 MeetBattle · ' . count($entry['members']) . ' FRIENDS (mix into different teams)' . ($entry['team_name'] !== '' ? ' — ' . $entry['team_name'] : ''),
  ][$entry['mode']];
  $lines = [$head];
  foreach ($entry['members'] as $i => $m) {
    $lines[] = ($i + 1) . '. ' . $m['name'] . ' — ' . $m['role_label'] . ' — ' . $m['phone'] . ' — ' . $m['portfolio'];
  }
  $lines[] = 'Ref ' . $ref;
  return implode("\n", $lines);
}

/* ---------------- scarcity + social proof ---------------- */

/** Public display name: "Hala Al Ali" → "Hala A."; Arabic or single names → first name only. */
function mp_bt_display(string $full, string $mode = 'first+initial'): string {
  $full = trim(preg_replace('/\s+-\s+.*$/u', '', $full) ?? '');          // drop "Name - ux ui designer" tails
  $parts = preg_split('/\s+/u', $full) ?: [];
  $first = $parts[0] ?? '';
  if ($first === '') return '';
  $isLatin = (bool)preg_match('/^[\p{Latin}\'’-]+$/u', $first);
  $first = $isLatin ? mb_convert_case(mb_strtolower($first), MB_CASE_TITLE) : $first;
  $last = count($parts) > 1 ? $parts[count($parts) - 1] : '';
  if ($mode === 'initials') return mb_strtoupper(mb_substr($first, 0, 1) . ($last !== '' ? mb_substr($last, 0, 1) : ''));
  if (!$isLatin || $last === '') return $first;
  return $first . ' ' . mb_strtoupper(mb_substr($last, 0, 1)) . '.';
}

/**
 * Live numbers: joined = seed + people registered on the site;
 * spots left drop by 1 per team registration and 1 per 3 solo/friends people.
 */
function mp_bt_stats(array $entries, array $seed, int $formed, int $leftBase, string $mode): array {
  $teams = 0; $loose = 0; $people = 0; $faces = [];
  $roleColour = ['ux-research' => 'ux', 'product' => 'product', 'brand' => 'brand'];
  foreach ($entries as $e) {
    if (($e['_kind'] ?? '') !== 'battle-reg' || !is_array($e['members'] ?? null)) continue;
    $n = count($e['members']); $people += $n;
    if (($e['mode'] ?? '') === 'team') $teams++; else $loose += $n;
    foreach ($e['members'] as $m) $faces[] = [mp_bt_display((string)($m['name'] ?? ''), $mode), $roleColour[$m['role'] ?? ''] ?? 'ux'];
  }
  $left = max(0, $leftBase - $teams - intdiv($loose, 3));
  $faces = array_merge(array_reverse($faces), array_reverse(array_map(fn($s) => [$mode === 'initials' ? mp_bt_display($s[0], 'initials') : $s[0], $s[1]], $seed)));
  if ($mode === 'none') $faces = array_map(fn($f) => ['', $f[1]], $faces);
  return [
    'joined' => count($seed) + $people,
    'teams_formed' => $formed + ($leftBase - $left),
    'teams_left' => $left,
    'teams_total' => $formed + $leftBase,
    'full' => $left === 0,
    'faces' => array_slice($faces, 0, 12),
  ];
}
