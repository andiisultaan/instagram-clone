if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URI);

module.exports = redis;
