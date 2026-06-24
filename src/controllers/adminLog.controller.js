import * as adminLogService from '../services/adminLog.service.js';
import { responseOk } from '../helpers/controllers.response.js';

export const getLogs = async (req, res, next) => {
  try {
    const logs = await adminLogService.getAdminLogs();
    responseOk(res, logs);
  } catch (err) {
    next(err);
  }
};
