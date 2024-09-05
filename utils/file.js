import pkg from 'mongodb';
const { ObjectId } = pkg;
import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import dbClient from './db.js';
import userUtils from './user.js';
import basicUtils from './basic.js';

/**
 * Module with file utilities
 */
const fileUtils = {
  /**
   * Validates if body is valid for creating file
   * @param {object} request - express request object
   * @return {object} object with err and validated params
   */
  async validateBody(request) {
    const {
      name, type, isPublic = false, data,
    } = request.body;
    let { parentId = 0 } = request.body;

    const typesAllowed = ['file', 'image', 'folder'];
    let msg = null;

    if (parentId === '0') parentId = 0;

    if (!name) {
      msg = 'Missing name';
    } else if (!type || !typesAllowed.includes(type)) {
      msg = 'Invalid type';
    } else if (!data && type !== 'folder') {
      msg = 'Missing data';
    } else if (parentId && parentId !== '0') {
      let file;

      if (basicUtils.isValidId(parentId)) {
        file = await this.getFile({ _id: ObjectId(parentId) });
      } else {
        file = null;
      }

      if (!file) {
        msg = 'Parent not found';
      } else if (file.type !== 'folder') {
        msg = 'Parent is not a folder';
      }
    }

    return {
      error: msg,
      fileParams: {
        name, type, parentId, isPublic, data,
      },
    };
  },

  /**
   * Gets file document from db
   * @param {object} query - query used to find file
   * @return {object} file
   */
  async getFile(query) {
    return await dbClient.filesCollection.findOne(query);
  },

  /**
   * Gets list of file documents from db belonging to a parent id
   * @param {object} query - query used to find file
   * @return {Array} list of files
   */
  async getFilesOfParentId(query) {
    return await dbClient.filesCollection.aggregate(query).toArray();
  },

  /**
   * Saves files to database and disk
   * @param {string} userId - user ID
   * @param {object} fileParams - object with attributes of file to save
   * @param {string} FOLDER_PATH - path to save file on disk
   * @return {object} object with error if present and file
   */
  async saveFile(userId, fileParams, FOLDER_PATH) {
    const {
      name, type, isPublic, data,
    } = fileParams;
    let { parentId } = fileParams;

    if (parentId !== 0) parentId = ObjectId(parentId);

    const query = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId,
    };

    if (type !== 'folder') {
      const fileNameUUID = uuidv4();
      const fileDataDecoded = Buffer.from(data, 'base64');
      const path = `${FOLDER_PATH}/${fileNameUUID}`;

      query.localPath = path;

      try {
        await fsPromises.mkdir(FOLDER_PATH, { recursive: true });
        await fsPromises.writeFile(path, fileDataDecoded);
      } catch (err) {
        return { error: err.message, code: 400 };
      }
    }

    const result = await dbClient.filesCollection.insertOne(query);
    const file = this.processFile(query);
    return { error: null, newFile: { id: result.insertedId, ...file } };
  },

  /**
   * Updates a file document in database
   * @param {object} query - query to find document to update
   * @param {object} set - object with query info to update in Mongo
   * @return {object} updated file
   */
  async updateFile(query, set) {
    const result = await dbClient.filesCollection.findOneAndUpdate(
      query,
      { $set: set },
      { returnDocument: 'after' },
    );
    return result.value;
  },

  /**
   * Makes a file public or private
   * @param {object} request - express request object
   * @param {boolean} setPublish - true or false
   * @return {object} error, status code, and updated file
   */
  async publishUnpublish(request, setPublish) {
    const { id: fileId } = request.params;

    if (!basicUtils.isValidId(fileId)) {
      return { error: 'Unauthorized', code: 401 };
    }

    const { userId } = await userUtils.getUserIdAndKey(request);

    if (!basicUtils.isValidId(userId)) {
      return { error: 'Unauthorized', code: 401 };
    }

    const user = await userUtils.getUser({ _id: ObjectId(userId) });

    if (!user) return { error: 'Unauthorized', code: 401 };

    const file = await this.getFile({ _id: ObjectId(fileId), userId: ObjectId(userId) });

    if (!file) return { error: 'Not found', code: 404 };

    const updatedFile = await this.updateFile(
      { _id: ObjectId(fileId), userId: ObjectId(userId) },
      { isPublic: setPublish },
    );

    return {
      error: null,
      code: 200,
      updatedFile: this.processFile(updatedFile),
    };
  },

  /**
   * Transforms _id into id in a file document
   * @param {object} doc - document to be processed
   * @return {object} processed document
   */
  processFile(doc) {
    const file = { id: doc._id, ...doc };
    delete file.localPath;
    delete file._id;
    return file;
  },

  /**
   * Checks if a file is public and belongs to a specific user
   * @param {object} file - file to evaluate
   * @param {string} userId - id of user to check ownership
   * @return {boolean} true or false
   */
  isOwnerAndPublic(file, userId) {
    return (
      (!file.isPublic && !userId)
      || (userId && file.userId.toString() === userId)
      || file.isPublic
    );
  },

  /**
   * Gets a file's data from the database
   * @param {object} file - file to obtain data of
   * @param {string} size - size in case of file being an image
   * @return {object} data of file or error and status code
   */
  async getFileData(file, size) {
    let { localPath } = file;

    if (size) localPath = `${localPath}_${size}`;

    try {
      const data = await fsPromises.readFile(localPath);
      return { data };
    } catch (err) {
      return { error: 'Not found', code: 404 };
    }
  },
};

export default fileUtils;
