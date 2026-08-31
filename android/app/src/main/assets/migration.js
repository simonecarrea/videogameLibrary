// Development seed migration for bundled Android builds.
// If an older install persisted an empty library, restore the known starter library once.
(() => {
  const migrationKey = 'gameshelf-migration-v3-seeded';
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
