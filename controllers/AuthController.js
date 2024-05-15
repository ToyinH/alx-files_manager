import { v4 as uuidv4 } from 'uuid';
// import base64 from 'base-64';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AuthController = {
  async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const authData = base64.decode(authHeader.slice('Basic '.length)).split(':');
    const [email, password] = authData;

    // Find user by email and password
    const hashedPassword = sha1(password);
    const user = await dbClient.collection('users').findOne({ email, password: hashedPassword });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate token
    const token = uuidv4();
    const key = `auth_${token}`;

    // Store user ID in Redis for 24 hours
    await redisClient.set(key, user._id.toString(), 24 * 3600);

    return res.status(200).json({ token });
  },

  async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(key);
    return res.status(204).end();
  },
};

export default AuthController;
