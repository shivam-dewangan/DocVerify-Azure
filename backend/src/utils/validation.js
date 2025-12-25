const Joi = require('joi');

const documentUploadSchema = Joi.object({
  fileName: Joi.string().min(1).max(255).required(),
  contentType: Joi.string().valid(
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ).required()
});

const documentVerificationSchema = Joi.object({
  documentId: Joi.string().length(32).hex().required(),
  expectedHash: Joi.string().optional(),
  algorithm: Joi.string().valid('md5', 'sha1', 'sha256', 'sha512').default('sha256')
});

const auditLogQuerySchema = Joi.object({
  documentId: Joi.string().length(32).hex().optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  action: Joi.string().valid('upload', 'verify', 'download', 'delete').optional()
});

const hashValidationSchema = Joi.object({
  hash: Joi.string().required(),
  algorithm: Joi.string().valid('md5', 'sha1', 'sha256', 'sha512').default('sha256')
});

module.exports = {
  documentUploadSchema,
  documentVerificationSchema,
  auditLogQuerySchema,
  hashValidationSchema
};