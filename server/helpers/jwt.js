const { sign, verify } = require("jsonwebtoken");
const secret_key = process.env.SECRET_KEY;

module.exports = {
  signToken: payload => {
    return sign(payload, secret_key);
  },
  verifyToken: token => {
    return verify(token, secret_key);
  },
};
