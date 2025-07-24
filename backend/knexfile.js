require('dotenv').config();

module.exports = {
  development: {
    client: process.env.DB_CLIENT,
    connection:
      process.env.DB_CLIENT === 'sqlite3'
        ? { filename: process.env.DB_CONNECTION_FILENAME }
        : {
            host: process.env.DB_CONNECTION_HOST,
            user: process.env.DB_CONNECTION_USER,
            password: process.env.DB_CONNECTION_PASSWORD,
            database: process.env.DB_CONNECTION_DATABASE
          },
    migrations: {
      directory: './migrations'
    },
    useNullAsDefault: true
  }
};
