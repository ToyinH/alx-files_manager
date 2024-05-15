import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  async postUpload(req, res) {
    const { name, type, data, parentId = 0, isPublic = false } = req.body;
    const { userId } = req.user;

    try {
      // Validate input
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type or invalid type' });
      }
      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      // Check if parent exists and is a folder
      if (parentId !== 0) {
        const parentFile = await dbClient.getFile(parentId);
        if (!parentFile || parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent not found or is not a folder' });
        }
      }

      let localPath = '';

      // If type is file or image, store locally
      if (type === 'file' || type === 'image') {
        // Decode base64 data and create local file
        const fileData = Buffer.from(data, 'base64');
        const fileId = uuidv4();
        localPath = path.join(FOLDER_PATH, fileId);
        fs.writeFileSync(localPath, fileData);
      }

      // Create file object
      const newFile = {
        userId,
        name,
        type,
        parentId,
        isPublic,
        localPath: type === 'file' || type === 'image' ? localPath : null,
      };

      // Insert file into DB
      const insertedFile = await dbClient.insertFile(newFile);

      return res.status(201).json(insertedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default FilesController;
