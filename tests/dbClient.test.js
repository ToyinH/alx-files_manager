const { dbClient } = require('../src/utils/dbClient');
const mockDbClient = require('./utils/mockDbClient');

describe('DB Client Tests', () => {
  beforeAll(() => {
    // Replace dbClient with mock implementation
    jest.spyOn(dbClient, 'insertUser').mockImplementation(mockDbClient.insertUser);
    jest.spyOn(dbClient, 'getUserByEmailAndPassword').mockImplementation(mockDbClient.getUserByEmailAndPassword);
    // Add more setup as needed
  });

  afterAll(() => {
    // Restore original implementation after all tests are done
    jest.restoreAllMocks();
  });

  it('should insert and retrieve data from MongoDB', async () => {
    // Test inserting and retrieving data from MongoDB
  });

 
});
