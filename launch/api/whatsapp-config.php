<?php
/**
 * WhatsApp alerts to the organiser — sent via CallMeBot (free, personal use).
 *
 * One-time setup, from the phone that should RECEIVE the alerts:
 *   1. Save +34 644 91 07 79 in your contacts (any name).
 *   2. WhatsApp that contact exactly:  I allow callmebot to send me messages
 *   3. It replies with your APIKEY — paste it below and save.
 *
 * Empty key = alerts off. Registrations still save, and still show in /admin.
 * Future site updates never overwrite this file.
 */
define('MP_WA_PHONE', '+962791319628');
define('MP_WA_APIKEY', '');
