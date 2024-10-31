if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function connect() {
  try {
    client.db(process.env.MONGO_DB_NAME);
  } catch (error) {
    console.log(error);
    await client.close();
  }
}

async function getDB() {
  return client.db(process.env.MONGO_DB_NAME);
}

module.exports = { connect, getDB };
