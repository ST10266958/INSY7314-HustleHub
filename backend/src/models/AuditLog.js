const mongoose = require('mongoose');
const { auditRetentionDays } = require('../config/env');

// Persistent security audit trail. Admins can query it through GET /api/admin/audit-logs.
const auditLogSchema = new mongoose.Schema(
  {
    event: { type: String, required: true, index: true },
    outcome: { type: String, enum: ['success', 'failure', 'denied', 'info'], default: 'success' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, maxlength: 254 },
    ip: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 256 },
    method: { type: String, maxlength: 10 },
    path: { type: String, maxlength: 256 },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Old entries expire automatically so personal data (emails, IPs) is not kept forever.
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: auditRetentionDays * 24 * 60 * 60 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
