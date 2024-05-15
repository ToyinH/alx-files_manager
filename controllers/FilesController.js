import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';


const FilesController = {
  async postUpload(req, res) {
    const { userId } = req.user;
    const { name, type, parentId = '0', isPublic = false, data } = req.body;

    // Check if name and type are provided
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type) {
      return res.status(400).json({ error: 'Missing type' });
    }

    try {
      let file;

      // If type is folder, create a new folder in DB
      if (type === 'folder') {
        file = await dbClient.createFolder(userId, name, parentId, isPublic);
      } else {
        // If type is file or image, create a new file
        if (!data) {
          return res.status(400).json({ error: 'Missing data' });
        }

        // Save the file locally
        const localPath = await dbClient.saveFileLocally(data);

        // Create file document in DB
        file = await dbClient.createFile(userId, name, type, parentId, isPublic, localPath);
      }

      return res.status(201).json(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getShow(req, res) {
    const { id } = req.params;
    const { userId } = req.user;

    try {
      // Retrieve the file based on ID and user ID
      const file = await dbClient.getFileById(userId, id);

      // Check if file exists
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json(file);
    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getIndex(req, res) {
    const { userId } = req.user;
    const { parentId = '0', page = 0 } = req.query;
    const limit = 20; // Max items per page

    try {
      // Retrieve files based on user ID, parent ID, and pagination
      const files = await dbClient.getFilesByUserIdAndParentId(userId, parentId, page, limit);

      return res.json(files);
    } catch (error) {
      console.error('Error retrieving files:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default FilesController;
