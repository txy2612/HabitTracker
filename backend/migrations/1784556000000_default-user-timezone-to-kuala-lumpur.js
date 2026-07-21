/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.alterColumn("user_settings", "timezone", {
    default: "Asia/Kuala_Lumpur",
  });

  pgm.sql(`
    UPDATE user_settings
    SET timezone = 'Asia/Kuala_Lumpur',
        updated_at = NOW()
    WHERE timezone = 'UTC'
  `);
};

/**
 * Existing values are intentionally not changed back because UTC may become
 * an explicit user selection after this migration has run.
 */
export const down = () => {};
