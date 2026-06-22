import AdminLog from '../models/adminLog.model.js';

export const createAdminLog = async (adminId, action, resource) =>
  AdminLog.create({ adminId, action, resource });
