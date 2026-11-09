// Runs once, the first time the MongoDB volume is created.
// Gives the API its own least-privilege user instead of the root account.
const dbName = 'hustlehub';
const appUser = process.env.APP_DB_USER;
const appPassword = process.env.APP_DB_PASSWORD;

if (!appUser || !appPassword) {
  throw new Error('APP_DB_USER and APP_DB_PASSWORD must be set for the mongo service.');
}

db.getSiblingDB(dbName).createUser({
  user: appUser,
  pwd: appPassword,
  roles: [{ role: 'readWrite', db: dbName }],
});
