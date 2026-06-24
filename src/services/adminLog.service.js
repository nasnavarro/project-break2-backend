import AdminLog from '../models/adminLog.model.js';

export const createAdminLog = async ({ adminId, action, resource, resourceId, before, after, ip }) =>
  AdminLog.create({ adminId, action, resource, resourceId, before, after, ip });

export const getAdminLogs = async () =>
  AdminLog.find().sort({ timestamp: -1 });
