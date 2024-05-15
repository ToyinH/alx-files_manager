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

    // Check if the email already exists
    const userExists = await dbClient.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password
    const hashedPassword = sha1(password);

    // Insert the new user into the database
    const result = await dbClient.collection('users').insertOne({ email, password: hashedPassword });

    // Return the new user
    const newUser = { id: result.insertedId, email };
    return res.status(201).json(newUser);
  },
};

export default UsersController;
