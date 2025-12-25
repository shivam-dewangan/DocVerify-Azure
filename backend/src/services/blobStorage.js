const { BlobServiceClient } = require('@azure/storage-blob');
const logger = require('../utils/logger');

class BlobStorageService {
  constructor() {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  }

  async initializeContainer() {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      await containerClient.createIfNotExists({
        access: 'private'
      });
      logger.info(`Container ${this.containerName} initialized`);
    } catch (error) {
      logger.error('Error initializing container:', error);
      throw error;
    }
  }

  async uploadDocument(fileName, buffer, contentType) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlockBlobClient(fileName);
      
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: contentType
        },
        metadata: {
          uploadedAt: new Date().toISOString()
        }
      };

      const uploadResponse = await blobClient.upload(buffer, buffer.length, uploadOptions);
      
      logger.info(`Document uploaded: ${fileName}`);
      return {
        fileName,
        url: blobClient.url,
        etag: uploadResponse.etag,
        lastModified: uploadResponse.lastModified
      };
    } catch (error) {
      logger.error('Error uploading document:', error);
      throw error;
    }
  }

  async downloadDocument(fileName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlockBlobClient(fileName);
      
      const downloadResponse = await blobClient.download();
      return downloadResponse.readableStreamBody;
    } catch (error) {
      logger.error('Error downloading document:', error);
      throw error;
    }
  }

  async deleteDocument(fileName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlockBlobClient(fileName);
      
      await blobClient.delete();
      logger.info(`Document deleted: ${fileName}`);
    } catch (error) {
      logger.error('Error deleting document:', error);
      throw error;
    }
  }

  async getDocumentMetadata(fileName) {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlockBlobClient(fileName);
      
      const properties = await blobClient.getProperties();
      return {
        fileName,
        contentType: properties.contentType,
        contentLength: properties.contentLength,
        lastModified: properties.lastModified,
        etag: properties.etag,
        metadata: properties.metadata
      };
    } catch (error) {
      logger.error('Error getting document metadata:', error);
      throw error;
    }
  }
}

module.exports = new BlobStorageService();