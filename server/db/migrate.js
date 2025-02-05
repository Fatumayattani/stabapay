const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function getCurrentVersion() {
  try {
    const result = await pool.query(
      "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1"
    );
    return result.rows[0]?.version || 0;
  } catch (error) {
    // If table doesn't exist, create it
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    return 0;
  }
}

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentVersion = await getCurrentVersion();
    const migrations = await fs.readdir(MIGRATIONS_DIR);
    
    // Sort migrations by version number
    const pendingMigrations = migrations
      .filter(file => {
        const version = parseInt(file.split('_')[0]);
        return version > currentVersion;
      })
      .sort();

    for (const migration of pendingMigrations) {
      const version = parseInt(migration.split('_')[0]);
      console.log(`Applying migration ${migration}...`);
      
      const sql = await fs.readFile(
        path.join(MIGRATIONS_DIR, migration),
        'utf-8'
      );
      
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (version) VALUES ($1)',
        [version]
      );
      
      console.log(`Migration ${migration} applied successfully.`);
    }

    await client.query('COMMIT');
    console.log('All migrations completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

async function rollback() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1"
    );
    
    if (result.rows.length === 0) {
      console.log('No migrations to roll back.');
      return;
    }

    const currentVersion = result.rows[0].version;
    const migrations = await fs.readdir(MIGRATIONS_DIR);
    
    const currentMigration = migrations.find(
      file => parseInt(file.split('_')[0]) === currentVersion
    );

    if (currentMigration) {
      console.log(`Rolling back migration ${currentMigration}...`);
      
      // Read the migration file and extract the rollback SQL
      const sql = await fs.readFile(
        path.join(MIGRATIONS_DIR, currentMigration),
        'utf-8'
      );
      
      // Execute rollback
      await client.query('DROP TABLE IF EXISTS contacts CASCADE');
      await client.query('DROP TABLE IF EXISTS transactions CASCADE');
      await client.query('DROP TABLE IF EXISTS users CASCADE');
      await client.query('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE');
      
      await client.query(
        'DELETE FROM schema_migrations WHERE version = $1',
        [currentVersion]
      );
      
      console.log(`Rollback of ${currentMigration} completed successfully.`);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Rollback failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

if (process.argv[2] === 'rollback') {
  rollback().then(() => process.exit(0));
} else {
  migrate().then(() => process.exit(0));
}
