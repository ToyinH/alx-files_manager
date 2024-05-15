import sha1 from 'sha1';
import dbClient from '../utils/db';

const UsersController = {
  async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if email already exists in DB using dbClient method
      const userExists = await dbClient.isEmailExists(email);
      if (userExists) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Create new user
      const newUser = {
        email,
        password: hashedPassword,
      };

      // Insert new user into the database using dbClient method
      const result = await dbClient.insertUser(newUser);
      const { insertedId } = result;
      return res.status(201).json({ id: insertedId, email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getMe(req, res) {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await dbClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Assuming getUserById retrieves user by ID
    const user = await dbClient.getUserById(userId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.json({ id: user.id, email: user.email });
  }
};

export default UsersController;
