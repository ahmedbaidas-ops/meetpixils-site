<?php
/** Public MeetBattle numbers for the homepage/battle page: joined, teams left, faces. */
require __DIR__ . '/config.php';
require __DIR__ . '/battle-lib.php';
require __DIR__ . '/battle-config.php';
$file = MP_DATA_DIR . '/entries.json';
$list = is_file($file) ? json_decode((string)file_get_contents($file), true) : [];
header('Cache-Control: no-store');
mp_json_out(200, mp_bt_stats(is_array($list) ? $list : [], MP_BT_SEED, MP_BT_TEAMS_FORMED, MP_BT_TEAMS_LEFT, MP_BT_SHOW_NAMES));
