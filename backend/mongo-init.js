// MongoDB initialization script
db = db.getSiblingDB('aquasafe');

// Create application user
db.createUser({
  user: 'aquasafe_user',
  pwd: 'aquasafe_password',
  roles: [
    {
      role: 'readWrite',
      db: 'aquasafe'
    }
  ]
});

// Create collections
db.createCollection('users');
db.createCollection('waterqualitydata');
db.createCollection('analyses');
db.createCollection('reports');

print('Database initialized successfully');
