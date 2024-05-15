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

    // Check if email already exists in DB
    const userExists = await dbClient.collection('users').findOne({ email });
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

    try {
      const result = await dbClient.collection('users').insertOne(newUser);
      const { _id } = result.ops[0];
      return res.status(201).json({ id: _id, email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default UsersController;
