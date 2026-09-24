<?php
/**
 * Team roles — each password signs its holder in with a role.
 *   super     — everything: publish, events, settings, submissions, judging, all
 *   moderator — submissions only: verify receipts, approve loyalty, mark paid
 *   judge     — judging only: submit evaluations
 * Change these before sharing them. The MP_ADMIN_PASSWORD in config.php is
 * always a super admin too.
 */
define('MP_ROLES', [
  'MPMOD12345'   => 'moderator',
  'MPJUDGE12345' => 'judge',
]);
