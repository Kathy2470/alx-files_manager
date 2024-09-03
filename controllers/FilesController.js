import { ObjectId } from 'mongodb';
import mime from 'mime-types';
import Queue from 'bull';
import userUtils from '../utils/user';
import fileUtils from '../utils/file';
import basicUtils from '../utils/basic';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
const fileQueue = new Queue('fileQueue');

class FilesController {
  static async postUpload(request, response) {
    try {
      const { userId } = await userUtils.getUserIdAndKey(request);
      if (!basicUtils.isValidId(userId)) return response.status(401).json({ error: 'Unauthorized' });

      const user = await userUtils.getUser({ _id: ObjectId(userId) });
      if (!user) return response.status(401).json({ error: 'Unauthorized' });

      const { error: validationError, fileParams } = await fileUtils.validateBody(request);
      if (validationError) return response.status(400).json({ error: validationError });

      if (fileParams.parentId !== 0 && !basicUtils.isValidId(fileParams.parentId)) {
        return response.status(400).json({ error: 'Parent not found' });
      }

      const { error, code, newFile } = await fileUtils.saveFile(userId, fileParams, FOLDER_PATH);
      if (error) {
        if (fileParams.type === 'image') await fileQueue.add({ userId });
        return response.status(code).json({ error });
      }

      if (fileParams.type === 'image') {
        await fileQueue.add({ fileId: newFile.id.toString(), userId: newFile.userId.toString() });
      }

      return response.status(201).json(newFile);
    } catch (err) {
      console.error('Error in postUpload:', err);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(request, response) {
    try {
      const fileId = request.params.id;
      const { userId } = await userUtils.getUserIdAndKey(request);

      if (!basicUtils.isValidId(fileId) || !basicUtils.isValidId(userId)) {
        return response.status(404).json({ error: 'Not found' });
      }

      const user = await userUtils.getUser({ _id: ObjectId(userId) });
      if (!user) return response.status(401).json({ error: 'Unauthorized' });

      const result = await fileUtils.getFile({ _id: ObjectId(fileId), userId: ObjectId(userId) });
      if (!result) return response.status(404).json({ error: 'Not found' });

      const file = fileUtils.processFile(result);
      return response.status(200).json(file);
    } catch (err) {
      console.error('Error in getShow:', err);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(request, response) {
    try {
      const { userId } = await userUtils.getUserIdAndKey(request);
      const user = await userUtils.getUser({ _id: ObjectId(userId) });
      if (!user) return response.status(401).json({ error: 'Unauthorized' });

      let parentId = request.query.parentId || '0';
      parentId = parentId === '0' ? 0 : ObjectId(parentId);

      let page = Number(request.query.page) || 0;
      if (Number.isNaN(page)) page = 0;

      if (parentId !== 0) {
        const folder = await fileUtils.getFile({ _id: parentId });
        if (!folder || folder.type !== 'folder') return response.status(200).json([]);
      }

      const pipeline = [
        { $match: { parentId } },
        { $skip: page * 20 },
        { $limit: 20 },
      ];

      const fileCursor = await fileUtils.getFilesOfParentId(pipeline);
      const fileList = [];
      await fileCursor.forEach((doc) => fileList.push(fileUtils.processFile(doc)));

      return response.status(200).json(fileList);
    } catch (err) {
      console.error('Error in getIndex:', err);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(request, response) {
    try {
      const { error, code, updatedFile } = await fileUtils.publishUnpublish(request, true);
      if (error) return response.status(code).json({ error });

      return response.status(code).json(updatedFile);
    } catch (err) {
      console.error('Error in putPublish:', err);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putUnpublish(request, response) {
    try {
      const { error, code, updatedFile } = await fileUtils.publishUnpublish(request, false);
      if (error) return response.status(code).json({ error });

      return response.status(code).json(updatedFile);
    } catch (err) {
      console.error('Error in putUnpublish:', err);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getFile(request, response) {
    try {
      const { userId } = await userUtils.getUserIdAndKey(request);
      const { id: fileId } = request.params;
      const size = request.query.size || 0;

      if (!basicUtils.isValidId(fileId)) return response.status(404).json({ error: 'Not found' });

      const file = await fileUtils.getFile({ _id: ObjectId(fileId) });
      if (!file || !fileUtils.isOwnerAndPublic(file, userId)) return response.status(404).json({ error: 'Not found' });

      if (file.type === 'folder') return response.status(400).json({ error: "A folder doesn't have content" });

      const { error, code, data } = await fileUtils.getFileData(file, size);
      if (error) return response.status(code).json({ error });

      const mimeType = mime.contentType(file.name) || 'application/octet-stream';
      response.setHeader('Content-Type', mimeType);

      return response.status(200).send(data);
    } catch (err) {
      console.error('Error in getFile:', err);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
