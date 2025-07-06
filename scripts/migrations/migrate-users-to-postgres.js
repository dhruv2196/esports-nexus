const { MongoClient } = require('mongodb');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:esportsNexusAdmin2024@localhost:27017/esports_nexus?authSource=admin';
const PG_CONFIG = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || 'esports_nexus_users',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
};

async function migrateUsers() {
  const mongoClient = new MongoClient(MONGO_URI);
  const pgClient = new Client(PG_CONFIG);

  try {
    // Connect to both databases
    console.log('Connecting to MongoDB...');
    await mongoClient.connect();
    const mongoDb = mongoClient.db('esports_nexus');
    const usersCollection = mongoDb.collection('users');

    console.log('Connecting to PostgreSQL...');
    await pgClient.connect();

    // Create users table if it doesn't exist
    console.log('Creating users table...');
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        oauth_provider VARCHAR(50),
        oauth_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        profile JSONB,
        preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    // Get all users from MongoDB
    console.log('Fetching users from MongoDB...');
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users to migrate`);

    // Migrate users
    let migrated = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const userId = uuidv4();
        const profile = {
          display_name: user.displayName || user.username,
          avatar_url: user.avatarUrl || null,
          bio: user.bio || null,
          country: user.country || null,
          language: user.language || 'en',
          timezone: user.timezone || 'UTC',
        };

        const preferences = {
          notifications: {
            email: true,
            push: true,
            tournament_updates: true,
            team_invites: true,
          },
          privacy: {
            profile_visibility: 'public',
            show_stats: true,
          },
        };

        // Check if password needs to be hashed (if it's not already a bcrypt hash)
        let passwordHash = user.password;
        if (passwordHash && !passwordHash.startsWith('$2b$')) {
          passwordHash = await bcrypt.hash(passwordHash, 10);
        }

        await pgClient.query(
          `INSERT INTO users (
            user_id, username, email, password_hash, oauth_provider, oauth_id,
            is_active, is_verified, profile, preferences, created_at, updated_at, last_login_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (email) DO NOTHING`,
          [
            userId,
            user.username,
            user.email,
            passwordHash,
            user.oauthProvider || null,
            user.oauthId || null,
            user.isActive !== false,
            user.isVerified === true,
            JSON.stringify(profile),
            JSON.stringify(preferences),
            user.createdAt || new Date(),
            user.updatedAt || new Date(),
            user.lastLoginAt || null,
          ]
        );

        migrated++;
        if (migrated % 100 === 0) {
          console.log(`Migrated ${migrated} users...`);
        }
      } catch (error) {
        console.error(`Failed to migrate user ${user.email}:`, error.message);
        failed++;
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Successfully migrated: ${migrated} users`);
    console.log(`Failed: ${failed} users`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoClient.close();
    await pgClient.end();
  }
}

// Run migration
migrateUsers().catch(console.error);