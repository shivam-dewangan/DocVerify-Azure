const crypto = require('crypto');
const logger = require('../utils/logger');

class HashService {
  constructor() {
    this.defaultAlgorithm = 'sha256';
  }

  generateHash(buffer, algorithm = this.defaultAlgorithm) {
    try {
      const hash = crypto.createHash(algorithm);
      hash.update(buffer);
      const hashValue = hash.digest('hex');
      
      logger.info(`Hash generated using ${algorithm}: ${hashValue.substring(0, 16)}...`);
      return hashValue;
    } catch (error) {
      logger.error('Error generating hash:', error);
      throw error;
    }
  }

  verifyHash(buffer, expectedHash, algorithm = this.defaultAlgorithm) {
    try {
      const actualHash = this.generateHash(buffer, algorithm);
      const isValid = actualHash === expectedHash;
      
      logger.info(`Hash verification result: ${isValid ? 'VALID' : 'INVALID'}`);
      return {
        isValid,
        actualHash,
        expectedHash,
        algorithm
      };
    } catch (error) {
      logger.error('Error verifying hash:', error);
      throw error;
    }
  }

  generateMultipleHashes(buffer) {
    const algorithms = ['md5', 'sha1', 'sha256', 'sha512'];
    const hashes = {};

    try {
      algorithms.forEach(algorithm => {
        hashes[algorithm] = this.generateHash(buffer, algorithm);
      });

      logger.info('Multiple hashes generated successfully');
      return hashes;
    } catch (error) {
      logger.error('Error generating multiple hashes:', error);
      throw error;
    }
  }

  generateDocumentId(fileName, buffer) {
    try {
      const timestamp = Date.now();
      const fileHash = this.generateHash(buffer, 'md5');
      const documentId = crypto.createHash('sha256')
        .update(`${fileName}_${timestamp}_${fileHash}`)
        .digest('hex')
        .substring(0, 32);

      return documentId;
    } catch (error) {
      logger.error('Error generating document ID:', error);
      throw error;
    }
  }

  validateHashFormat(hash, algorithm = this.defaultAlgorithm) {
    const hashLengths = {
      'md5': 32,
      'sha1': 40,
      'sha256': 64,
      'sha512': 128
    };

    const expectedLength = hashLengths[algorithm];
    if (!expectedLength) {
      return { isValid: false, error: 'Unsupported hash algorithm' };
    }

    const isValidFormat = /^[a-fA-F0-9]+$/.test(hash) && hash.length === expectedLength;
    return {
      isValid: isValidFormat,
      algorithm,
      expectedLength,
      actualLength: hash.length
    };
  }
}

module.exports = new HashService();