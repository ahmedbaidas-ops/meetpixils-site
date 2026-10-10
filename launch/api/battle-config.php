<?php
/**
 * MeetBattle scarcity + social proof shown on the homepage and the battle page.
 * Future site updates never overwrite this file.
 */
define('MP_BT_TEAMS_FORMED', 8);   // teams already formed from the April registration form
define('MP_BT_TEAMS_LEFT', 3);     // open team spots now — counts down automatically as people register
// How participants appear publicly: 'first+initial' ("Hala A.") | 'initials' ("HA") | 'none' (counts only)
define('MP_BT_SHOW_NAMES', 'first+initial');

// Everyone who registered through the April form (from the private roster; junk entry removed).
// Display names only — no surnames, links or contacts ever leave this file.
// Role colour: ux = UX/UI, product = product design, brand = branding.
define('MP_BT_SEED', [
  ['Omar H.', 'ux'], ['Anas T.', 'ux'], ['Abdelhakim D.', 'brand'], ['Hala A.', 'product'], ['Marah A.', 'product'],
  ['Aya A.', 'ux'], ['Anwar A.', 'ux'], ['Ola A.', 'ux'], ['Abdulrahman W.', 'ux'], ['Lujain A.', 'ux'], ['هاله', 'ux'],
  ['Anood', 'ux'], ['Riyad A.', 'brand'], ['Mohammad G.', 'brand'], ['Deema S.', 'ux'], ['Aya A.', 'ux'],
  ['Ma’moon A.', 'brand'], ['Sami A.', 'ux'], ['Farah L.', 'product'], ['Fatima H.', 'ux'], ['Bayan O.', 'ux'],
  ['Salma M.', 'ux'], ['Heba', 'ux'], ['Aya N.', 'brand'], ['Roaa', 'brand'], ['رنيم', 'brand'], ['Ahmad A.', 'brand'],
  ['Ibrahim A.', 'product'], ['Leen N.', 'product'], ['Ayaat D.', 'product'], ['Maryam O.', 'ux'], ['Majd J.', 'brand'],
  ['Abeer B.', 'brand'], ['Mohammad G.', 'ux'], ['Eman A.', 'ux'], ['Fatim', 'ux'], ['Wesam R.', 'ux'],
  ['Muna A.', 'brand'], ['Malak', 'brand'], ['Dina A.', 'product'], ['Sema H.', 'ux'],
]);
