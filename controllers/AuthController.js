const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');

const AuthController = {
  async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const [email, password] = credentials;

    // Find user by email and password (assuming password is SHA1 hashed)
    const user = await dbClient.getUserByEmailAndPassword(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;

    // Store user ID in Redis with the token as key, expire after 24 hours
    dbClient.set(key, user.id, 'EX', 24 * 60 * 60);

    return res.status(200).json({ token });
  },

  async getDisconnect(req, res) {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await dbClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete the token from Redis
    dbClient.del(key);

    return res.status(204).send();
  }
};

module.exports = AuthController;
