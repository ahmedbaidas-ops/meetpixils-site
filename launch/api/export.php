<?php
/** Full data export — super admin only. ZIP of entries, content, backups and proof images;
 *  falls back to a JSON bundle if ZipArchive is unavailable. */
require __DIR__ . '/config.php';
mp_check_admin($_SERVER['HTTP_X_MP_PASS'] ?? null, ['super']);

$stamp = date('Ymd-His');
if (class_exists('ZipArchive')) {
  $tmp = tempnam(sys_get_temp_dir(), 'mpx');
  $z = new ZipArchive();
  $z->open($tmp, ZipArchive::OVERWRITE);
  foreach (['entries.json', 'content.json', 'content.prev.json'] as $f) {
    if (is_file(MP_DATA_DIR . "/$f")) $z->addFile(MP_DATA_DIR . "/$f", $f);
  }
  foreach ((glob(MP_DATA_DIR . '/backups/*') ?: []) as $f) $z->addFile($f, 'backups/' . basename($f));
  foreach ((glob(MP_DATA_DIR . '/receipts/*') ?: []) as $f) $z->addFile($f, 'receipts/' . basename($f));
  $z->close();
  header('Content-Type: application/zip');
  header("Content-Disposition: attachment; filename=meetpixils-backup-$stamp.zip");
  header('Content-Length: ' . filesize($tmp));
  readfile($tmp);
  @unlink($tmp);
  exit;
}
$bundle = [];
foreach (['entries.json', 'content.json'] as $f) {
  $bundle[$f] = is_file(MP_DATA_DIR . "/$f") ? json_decode((string)file_get_contents(MP_DATA_DIR . "/$f"), true) : null;
}
header("Content-Disposition: attachment; filename=meetpixils-backup-$stamp.json");
mp_json_out(200, $bundle);
