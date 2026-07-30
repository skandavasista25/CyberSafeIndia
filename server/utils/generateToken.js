const jwt = require("jsonwebtoken");

/**
 * Signs a JWT for either an admin or a user.
 * `type` is embedded in the payload so protectAdmin/protectUser can
 * reject tokens issued for the wrong role.
 */
const generateToken = (id, type) => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
