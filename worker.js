import thumbnailGenerator from 'image-thumbnail';
import { fileQueue } from './utils/queues';
import dbClient from './utils/db';

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }
  if (!fileId) {
    throw new Error('Missing fileId');
  }

  const file = await dbClient.getFileById(userId, fileId);

  if (!file) {
    throw new Error('File not found');
  }

  // Generate thumbnails and store them
  const thumbnail500 = await thumbnailGenerator(file.localPath, { width: 500 });
  const thumbnail250 = await thumbnailGenerator(file.localPath, { width: 250 });
  const thumbnail100 = await thumbnailGenerator(file.localPath, { width: 100 });

  // Save thumbnails to disk (same location as original file with appended _<width>)
});

export default worker;
