const express = require('express');
const multer = require('multer');
const router = express.Router();

const blobStorage = require('../services/blobStorage');
const cosmosDB = require('../services/cosmosDB');
const hashService = require('../services/hashService');
const logger = require('../utils/logger');
const { documentUploadSchema, documentVerificationSchema } = require('../utils/validation');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Upload document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { error } = documentUploadSchema.validate({
      fileName: req.file.originalname,
      contentType: req.file.mimetype
    });

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Generate document ID and hash
    const documentId = hashService.generateDocumentId(req.file.originalname, req.file.buffer);
    const documentHash = hashService.generateHash(req.file.buffer);
    
    // Upload to Azure Blob Storage
    const uploadResult = await blobStorage.uploadDocument(
      `${documentId}_${req.file.originalname}`,
      req.file.buffer,
      req.file.mimetype
    );

    // Store hash in Cosmos DB
    const documentData = {
      id: documentId,
      fileName: req.file.originalname,
      hash: documentHash,
      algorithm: 'sha256',
      size: req.file.size,
      contentType: req.file.mimetype
    };

    await cosmosDB.storeDocumentHash(documentData);

    // Log audit event
    await cosmosDB.logAuditEvent({
      documentId,
      action: 'upload',
      result: 'success',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        fileName: req.file.originalname,
        size: req.file.size,
        contentType: req.file.mimetype
      }
    });

    res.status(201).json({
      success: true,
      documentId,
      fileName: req.file.originalname,
      hash: documentHash,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Upload error:', error);
    
    // Log failed audit event
    if (req.file) {
      const documentId = hashService.generateDocumentId(req.file.originalname, req.file.buffer);
      await cosmosDB.logAuditEvent({
        documentId,
        action: 'upload',
        result: 'failed',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { error: error.message }
      });
    }

    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

// Verify document integrity
router.post('/verify/:documentId', upload.single('document'), async (req, res) => {
  try {
    const { documentId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided for verification' });
    }

    // Get stored document hash
    const storedDocument = await cosmosDB.getDocumentHash(documentId);
    if (!storedDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Verify hash
    const verificationResult = hashService.verifyHash(
      req.file.buffer,
      storedDocument.hash,
      storedDocument.algorithm
    );

    // Log audit event
    await cosmosDB.logAuditEvent({
      documentId,
      action: 'verify',
      result: verificationResult.isValid ? 'valid' : 'invalid',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        fileName: req.file.originalname,
        expectedHash: storedDocument.hash,
        actualHash: verificationResult.actualHash
      }
    });

    res.json({
      success: true,
      documentId,
      fileName: storedDocument.fileName,
      isValid: verificationResult.isValid,
      verification: verificationResult,
      verifiedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Verification error:', error);
    
    // Log failed audit event
    await cosmosDB.logAuditEvent({
      documentId: req.params.documentId,
      action: 'verify',
      result: 'failed',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: { error: error.message }
    });

    res.status(500).json({ error: 'Verification failed', message: error.message });
  }
});

// Get all documents
router.get('/', async (req, res) => {
  try {
    const documents = await cosmosDB.getAllDocuments();
    res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        hash: doc.hash,
        algorithm: doc.algorithm,
        size: doc.size,
        contentType: doc.contentType,
        uploadedAt: doc.uploadedAt,
        status: doc.status
      }))
    });
  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

// Get document details
router.get('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await cosmosDB.getDocumentHash(documentId);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.fileName,
        hash: document.hash,
        algorithm: document.algorithm,
        size: document.size,
        contentType: document.contentType,
        uploadedAt: document.uploadedAt,
        status: document.status
      }
    });
  } catch (error) {
    logger.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
});

// Delete document
router.delete('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Get document details
    const document = await cosmosDB.getDocumentHash(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from blob storage
    const fileName = `${documentId}_${document.fileName}`;
    await blobStorage.deleteDocument(fileName);

    // Update status in Cosmos DB
    await cosmosDB.updateDocumentStatus(documentId, 'deleted');

    // Log audit event
    await cosmosDB.logAuditEvent({
      documentId,
      action: 'delete',
      result: 'success',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        fileName: document.fileName
      }
    });

    res.json({
      success: true,
      message: 'Document deleted successfully',
      documentId
    });

  } catch (error) {
    logger.error('Delete document error:', error);
    
    // Log failed audit event
    await cosmosDB.logAuditEvent({
      documentId: req.params.documentId,
      action: 'delete',
      result: 'failed',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: { error: error.message }
    });

    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;