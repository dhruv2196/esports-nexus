// Create application user and database
db = db.getSiblingDB('esports_nexus');

db.createUser({
  user: 'esports_user',
  pwd: 'esports_password',
  roles: [
    {
      role: 'readWrite',
      db: 'esports_nexus'
    }
  ]
});

// Create initial collections
db.createCollection('users');
db.createCollection('tournaments');
db.createCollection('teams');
db.createCollection('live_matches');

// Create indexes
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.tournaments.createIndex({ status: 1 });
db.tournaments.createIndex({ game: 1 });
db.teams.createIndex({ name: 1 }, { unique: true });

print('MongoDB initialization completed');