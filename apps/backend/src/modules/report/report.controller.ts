import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types/request';
import { ReportService, type ReportExportResult } from './report.service';
import {
  attendanceReportQuerySchema,
  visitsReportQuerySchema,
  salesReportQuerySchema,
  inspectionsReportQuerySchema,
} from '@netrotrack/shared';

export class ReportController {
  private reportService = new ReportService();

  private sendExport(res: Response, exported: ReportExportResult, successMessage: string): void {
    if (exported.format === 'json') {
      res.status(200).json({
        success: true,
        message: successMessage,
        data: exported.body,
        meta: { timestamp: new Date().toISOString() },
      });
      return;
    }

    res.setHeader('Content-Type', exported.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
    res.status(200).send(exported.body);
  }

  private effectiveUserId(role: string, requesterId: string, userId?: string): string | undefined {
    return role === 'EMPLOYEE' ? requesterId : userId;
  }

  /** GET /api/v1/reports/attendance */
  public getAttendanceReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const role = req.user!.role;
      const { startDate, endDate, userId, format } = attendanceReportQuerySchema.parse(req.query);
      const effectiveUserId = this.effectiveUserId(role, req.user!.id, userId);

      const exported = await this.reportService.exportAttendance(
        companyId,
        startDate,
        endDate,
        format,
        effectiveUserId
      );
      this.sendExport(res, exported, 'Attendance report generated');
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/v1/reports/visits */
  public getVisitsReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const role = req.user!.role;
      const { startDate, endDate, userId, customerId, format } = visitsReportQuerySchema.parse(req.query);
      const effectiveUserId = this.effectiveUserId(role, req.user!.id, userId);

      const exported = await this.reportService.exportVisits(
        companyId,
        startDate,
        endDate,
        format,
        effectiveUserId,
        customerId
      );
      this.sendExport(res, exported, 'Visits report generated');
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/v1/reports/sales */
  public getSalesReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const role = req.user!.role;
      const { startDate, endDate, userId, customerId, format } = salesReportQuerySchema.parse(req.query);
      const effectiveUserId = this.effectiveUserId(role, req.user!.id, userId);

      const exported = await this.reportService.exportSales(
        companyId,
        startDate,
        endDate,
        format,
        effectiveUserId,
        customerId
      );
      this.sendExport(res, exported, 'Sales report generated');
    } catch (error) {
      next(error);
    }
  };

  /** GET /api/v1/reports/inspections */
  public getInspectionsReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const role = req.user!.role;
      const { startDate, endDate, userId, format } = inspectionsReportQuerySchema.parse(req.query);
      const effectiveUserId = this.effectiveUserId(role, req.user!.id, userId);

      const exported = await this.reportService.exportInspections(
        companyId,
        startDate,
        endDate,
        format,
        effectiveUserId
      );
      this.sendExport(res, exported, 'Inspections report generated');
    } catch (error) {
      next(error);
    }
  };
}
