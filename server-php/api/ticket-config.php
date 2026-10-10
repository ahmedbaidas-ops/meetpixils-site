<?php
/**
 * Ticket settings — the ONE place to change prices, the CliQ alias and event details.
 * The ticket page reads these through api/ticket-info.php and the server enforces them,
 * so what buyers see and what they're charged can never drift apart.
 * Future site updates never overwrite this file.
 */
define('MP_T_CLIQ_ALIAS', 'PIXILATED');   // where buyers send the money — double-check the spelling
define('MP_T_REVIEW_DAYS', 2);            // "your ticket is confirmed within N days"
define('MP_T_EARLYBIRD', true);           // shows the EARLYBIRD badge + crossed-out full price

// Leave date/venue empty to show "announced soon".
define('MP_T_EVENT', [
  'en' => ['name' => 'MeetPixils', 'date' => '', 'venue' => ''],
  'ar' => ['name' => 'ميت بكسلز', 'date' => '', 'venue' => ''],
]);

define('MP_T_PASSES', [
  'normal' => [
    'price' => 15, 'was' => 30,
    'en' => 'Normal pass', 'ar' => 'الباس العادي',
    'perks_en' => ['Networking with designers', 'Talks & workshops'],
    'perks_ar' => ['تعارف مع المصممين', 'حوارات وورشات'],
  ],
  'vip' => [
    'price' => 25, 'was' => 50,
    'en' => 'VIP pass', 'ar' => 'باس VIP',
    'perks_en' => ['Everything in Normal', 'Private 1:1 time with mentors', 'Food & drinks', 'Priority entry'],
    'perks_ar' => ['كل شي بالعادي', 'وقت خاص ١:١ مع المنتورز', 'أكل ومشروبات', 'أولوية الدخول'],
  ],
]);
