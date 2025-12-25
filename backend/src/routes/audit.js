const express = require('express');
const router = express.Router();

const cosmosDB = require('../services/cosmosDB');
const logger = require('../utils/logger');
const { auditLogQuerySchema } = require('../utils/validation');

// Get audit logs
router.get('/logs', async (req, res) => {
  try {
    const { error, value } = auditLogQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { documentId, limit, action } = value;
    let logs = await cosmosDB.getAuditLogs(documentId, limit);

    // Filter by action if specified
    if (action) {
      logs = logs.filter(log => log.action === action);
    }

    res.json({
      success: true,
      logs: logs.map(log => ({
        id: log.id,
        documentId: log.documentId,
        action: log.action,
        result: log.result,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        details: log.details
      })),
      total: logs.length
    });

  } catch (error) {
    logger.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// Get audit logs for specific document
router.get('/logs/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { limit = 100 } = req.query;

    const logs = await cosmosDB.getAuditLogs(documentId, parseInt(limit));

    res.json({
      success: true,
      documentId,
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        result: log.result,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        details: log.details
      })),
      total: logs.length
    });

  } catch (error) {
    logger.error('Get document audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve document audit logs' });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    // Get all documents and logs for statistics
    const [documents, logs] = await Promise.all([
      cosmosDB.getAllDocuments(),
      cosmosDB.getAuditLogs(null, 1000)
    ]);

    // Calculate statistics
    const stats = {
      totalDocuments: documents.length,
      activeDocuments: documents.filter(doc => doc.status === 'active').length,
      deletedDocuments: documents.filter(doc => doc.status === 'deleted').length,
      totalAuditEvents: logs.length,
      recentActivity: logs.slice(0, 10),
      actionCounts: {
        upload: logs.filter(log => log.action === 'upload').length,
        verify: logs.filter(log => log.action === 'verify').length,
        download: logs.filter(log => log.action === 'download').length,
        delete: logs.filter(log => log.action === 'delete').length
      },
      verificationStats: {
        total: logs.filter(log => log.action === 'verify').length,
        valid: logs.filter(log => log.action === 'verify' && log.result === 'valid').length,
        invalid: logs.filter(log => log.action === 'verify' && log.result === 'invalid').length,
        failed: logs.filter(log => log.action === 'verify' && log.result === 'failed').length
      }
    };

    // Calculate success rates
    stats.verificationStats.validRate = stats.verificationStats.total > 0 
      ? ((stats.verificationStats.valid / stats.verificationStats.total) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      stats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// Get activity timeline
router.get('/timeline', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const logs = await cosmosDB.getAuditLogs(null, 1000);
    
    // Filter logs by date range
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp) >= daysAgo
    );

    // Group by date
    const timeline = {};
    filteredLogs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      if (!timeline[date]) {
        timeline[date] = {
          date,
          upload: 0,
          verify: 0,
          download: 0,
          delete: 0,
          total: 0
        };
      }
      timeline[date][log.action]++;
      timeline[date].total++;
    });

    // Convert to array and sort by date
    const timelineArray = Object.values(timeline).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json({
      success: true,
      timeline: timelineArray,
      period: `${days} days`,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get timeline error:', error);
    res.status(500).json({ error: 'Failed to retrieve activity timeline' });
  }
});

module.exports = router;