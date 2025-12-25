const { CosmosClient } = require('@azure/cosmos');
const logger = require('../utils/logger');

class CosmosDBService {
  constructor() {
    this.client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });
    this.databaseName = process.env.COSMOS_DATABASE_NAME;
    this.hashesContainerName = process.env.COSMOS_CONTAINER_HASHES;
    this.logsContainerName = process.env.COSMOS_CONTAINER_LOGS;
  }

  async initialize() {
    try {
      const { database } = await this.client.databases.createIfNotExists({
        id: this.databaseName
      });

      await database.containers.createIfNotExists({
        id: this.hashesContainerName,
        partitionKey: { paths: ['/documentId'] }
      });

      await database.containers.createIfNotExists({
        id: this.logsContainerName,
        partitionKey: { paths: ['/documentId'] }
      });

      logger.info('Cosmos DB initialized successfully');
    } catch (error) {
      logger.error('Error initializing Cosmos DB:', error);
      throw error;
    }
  }

  async storeDocumentHash(documentData) {
    try {
      const container = this.client.database(this.databaseName)
        .container(this.hashesContainerName);

      const item = {
        id: documentData.id,
        documentId: documentData.id,
        fileName: documentData.fileName,
        hash: documentData.hash,
        algorithm: documentData.algorithm,
        size: documentData.size,
        contentType: documentData.contentType,
        uploadedAt: new Date().toISOString(),
        status: 'active'
      };

      const { resource } = await container.items.create(item);
      logger.info(`Document hash stored: ${documentData.fileName}`);
      return resource;
    } catch (error) {
      logger.error('Error storing document hash:', error);
      throw error;
    }
  }

  async getDocumentHash(documentId) {
    try {
      const container = this.client.database(this.databaseName)
        .container(this.hashesContainerName);

      const { resource } = await container.item(documentId, documentId).read();
      return resource;
    } catch (error) {
      if (error.code === 404) {
        return null;
      }
      logger.error('Error getting document hash:', error);
      throw error;
    }
  }

  async getAllDocuments() {
    try {
      const container = this.client.database(this.databaseName)
        .container(this.hashesContainerName);

      const { resources } = await container.items
        .query('SELECT * FROM c WHERE c.status = "active" ORDER BY c.uploadedAt DESC')
        .fetchAll();

      return resources;
    } catch (error) {
      logger.error('Error getting all documents:', error);
      throw error;
    }
  }

  async logAuditEvent(auditData) {
    try {
      const container = this.client.database(this.databaseName)
        .container(this.logsContainerName);

      const item = {
        id: `${auditData.documentId}_${Date.now()}`,
        documentId: auditData.documentId,
        action: auditData.action,
        result: auditData.result,
        timestamp: new Date().toISOString(),
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent,
        details: auditData.details || {}
      };

      const { resource } = await container.items.create(item);
      logger.info(`Audit event logged: ${auditData.action} for ${auditData.documentId}`);
      return resource;
    } catch (error) {
      logger.error('Error logging audit event:', error);
      throw error;
    }
  }

  async getAuditLogs(documentId = null, limit = 100) {
    try {
      const container = this.client.database(this.databaseName)
        .container(this.logsContainerName);

      let query = 'SELECT * FROM c ORDER BY c.timestamp DESC';
      if (documentId) {
        query = 'SELECT * FROM c WHERE c.documentId = @documentId ORDER BY c.timestamp DESC';
      }

      const querySpec = {
        query,
        parameters: documentId ? [{ name: '@documentId', value: documentId }] : []
      };

      const { resources } = await container.items
        .query(querySpec, { maxItemCount: limit })
        .fetchAll();

      return resources;
    } catch (error) {
      logger.error('Error getting audit logs:', error);
      throw error;
    }
  }

  async updateDocumentStatus(documentId, status) {
    try {
      const container = this.client.database(this.databaseName)
        .container(this.hashesContainerName);

      const { resource: document } = await container.item(documentId, documentId).read();
      document.status = status;
      document.updatedAt = new Date().toISOString();

      const { resource } = await container.item(documentId, documentId).replace(document);
      return resource;
    } catch (error) {
      logger.error('Error updating document status:', error);
      throw error;
    }
  }
}

module.exports = new CosmosDBService();