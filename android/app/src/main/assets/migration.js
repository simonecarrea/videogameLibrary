// One-time migration for the first bundled Android release.
// Older WebView installs may have persisted an empty gameshelf-library array.
(() => {
  const migrationKey = 'gameshelf-migration-v2-seeded';
  if (localStorage.getItem(migrationKey)) return;

  let existing = null;
  try {
    existing = JSON.parse(localStorage.getItem('gameshelf-library') || 'null');
  } catch (_) {
    existing = null;
  }

  if (!Array.isArray(existing) || existing.length === 0) {
    localStorage.setItem('gameshelf-library', JSON.stringify(DEFAULT_LIBRARY));
  }

  localStorage.setItem(migrationKey, '1');
})();
