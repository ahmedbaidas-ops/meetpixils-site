<?php
/** Public ticket settings for the page: passes, prices, CliQ alias, event. */
require __DIR__ . '/config.php';
require __DIR__ . '/ticket-config.php';
mp_json_out(200, [
  'earlybird' => MP_T_EARLYBIRD,
  'alias' => MP_T_CLIQ_ALIAS,
  'review_days' => MP_T_REVIEW_DAYS,
  'event' => MP_T_EVENT,
  'passes' => MP_T_PASSES,
]);
