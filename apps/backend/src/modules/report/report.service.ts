import { ReportRepository } from './report.repository';
import { buildSimplePdf, rowsToCsv } from './report.export';

export type ReportFormat = 'json' | 'csv' | 'pdf';

export interface ReportExportResult {
  format: ReportFormat;
  filename: string;
  contentType: string;
  body: Buffer | string | Record<string, unknown>;
}

export class ReportService {
  private reportRepo = new ReportRepository();

  private dateBounds(startDateStr: string, endDateStr: string) {
    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }

  async getAttendanceReport(
    companyId: string,
    startDateStr: string,
    endDateStr: string,
    userId?: string
  ) {
    const { startDate, endDate } = this.dateBounds(startDateStr, endDateStr);
    const records = await this.reportRepo.getAttendanceReport(
      companyId,
      startDate,
      endDate,
      userId
    );

    const totalHours = records.reduce(
      (sum, r) => sum + Number(r.workingHours ?? 0),
      0
    );

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      totalRecords: records.length,
      totalWorkingHours: Math.round(totalHours * 100) / 100,
      records: records.map((r) => ({
        id: r.id,
        employee: r.user,
        punchInTime: r.punchInTime.toISOString(),
        punchOutTime: r.punchOutTime?.toISOString() ?? null,
        workingHours: r.workingHours ? Number(r.workingHours) : null,
        punchInLocation: {
          latitude: Number(r.punchInLatitude),
          longitude: Number(r.punchInLongitude),
        },
        punchOutLocation: r.punchOutLatitude
          ? {
              latitude: Number(r.punchOutLatitude),
              longitude: Number(r.punchOutLongitude),
            }
          : null,
      })),
    };
  }

  async getVisitsReport(
    companyId: string,
    startDateStr: string,
    endDateStr: string,
    userId?: string,
    customerId?: string
  ) {
    const { startDate, endDate } = this.dateBounds(startDateStr, endDateStr);
    const records = await this.reportRepo.getVisitsReport(
      companyId,
      startDate,
      endDate,
      userId,
      customerId
    );

    const totalDuration = records.reduce(
      (sum, r) => sum + (r.duration ?? 0),
      0
    );

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      totalRecords: records.length,
      totalDurationMinutes: Math.round(totalDuration / 60),
      records: records.map((r) => ({
        id: r.id,
        employee: r.user,
        customer: r.customer,
        checkInTime: r.checkInTime.toISOString(),
        checkOutTime: r.checkOutTime?.toISOString() ?? null,
        durationMinutes: r.duration ? Math.round(r.duration / 60) : null,
        productsDiscussed: r.productsDiscussed,
        notes: r.notes,
        location: {
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
        },
      })),
    };
  }

  async getSalesReport(
    companyId: string,
    startDateStr: string,
    endDateStr: string,
    userId?: string,
    customerId?: string
  ) {
    const { startDate, endDate } = this.dateBounds(startDateStr, endDateStr);
    const records = await this.reportRepo.getSalesReport(
      companyId,
      startDate,
      endDate,
      userId,
      customerId
    );

    const totalRevenue = records.reduce(
      (sum, r) => sum + Number(r.totalAmount),
      0
    );
    const totalItems = records.reduce(
      (sum, r) => sum + r.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      totalRecords: records.length,
      totalRevenue,
      totalItemsSold: totalItems,
      records: records.map((r) => ({
        id: r.id,
        employee: r.user,
        customer: r.customer,
        totalAmount: Number(r.totalAmount),
        remarks: r.remarks,
        createdAt: r.createdAt.toISOString(),
        items: r.items.map((i) => ({
          product: i.product,
          quantity: i.quantity,
          price: Number(i.price),
          totalPrice: Number(i.totalPrice),
        })),
      })),
    };
  }

  async getInspectionsReport(
    companyId: string,
    startDateStr: string,
    endDateStr: string,
    userId?: string
  ) {
    const { startDate, endDate } = this.dateBounds(startDateStr, endDateStr);
    const records = await this.reportRepo.getInspectionsReport(
      companyId,
      startDate,
      endDate,
      userId
    );

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      totalRecords: records.length,
      records: records.map((r) => ({
        id: r.id,
        employee: r.user,
        siteName: r.siteName,
        category: r.category,
        observation: r.observation,
        recommendation: r.recommendation,
        createdAt: r.createdAt.toISOString(),
        location: {
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
        },
      })),
    };
  }

  async exportAttendance(
    companyId: string,
    startDateStr: string,
    endDateStr: string,
    format: ReportFormat,
    userId?: string
  ): Promise<ReportExportResult> {
    const data = await this.getAttendanceReport(companyId, startDateStr, endDateStr, userId);
    if (format === 'json') {
      return { format, filename: 'attendance.json', contentType: 'application/json', body: data };
    }

    const headers = ['Employee', 'Employee ID', 'Punch In', 'Punch Out', 'Hours'];
    const rows = data.records.map((r) => [
      r.employee.name,
      r.employee.employeeId,
      r.punchInTime,
      r.punchOutTime,
      r.workingHours,
    ]);

    if (format === 'csv') {
      return {
        format,
        filename: `attendance_${startDateStr}_${endDateStr}.csv`,
        contentType: 'text/csv; charset=utf-8',
        body: rowsToCsv(headers, rows),
      };
    }

    const pdf = await buildSimplePdf({
      title: 'Attendance Report',
      subtitle: `${startDateStr} → ${endDateStr} · ${data.totalRecords} records · ${data.totalWorkingHours} hours`,
      headers,
      rows,
    });
    return {
      format,
      filename: `attendance_${startDateStr}_${endDateStr}.pdf`,
      contentType: 'application/pdf',
      body: pdf,
    };
  }

  async exportVisits(
    companyId: string,
    startDateStr: string,
    endDateStr: string,
    format: ReportFormat,
    userId?: string,
    customerId?: string
  ): Promise<ReportExportResult> {
    const data = await this.getVisitsReport(companyId, startDateStr, endDateStr, userId, customerId);
    if (format === 'json') {
      return { format, filename: 'visits.json', contentType: 'application/json', body: data };
    }

    const headers = ['Employee', 'Customer', 'Check In', 'Check Out', 'Minutes', 'Notes'];
    const rows = data.records.map((r) => [
      r.employee.name,
      r.customer.name,
      r.checkInTime,
      r.checkOutTime,
      r.durationMinutes,
      r.notes,
    ]);

    if (format === 'csv') {
      return {
        format,
        filename: `visits_${startDateStr}_${endDateStr}.csv`,
        contentType: 'text/csv; charset=utf-8',
        body: rowsToCsv(headers, rows),
      };
    }

    const pdf = await buildSimplePdf({
      title: 'Visits Report',
      subtitle: `${startDateStr} → ${endDateStr} · ${data.totalRecords} records`,
      headers,
      rows,
    });
    return {
      format,
      filename: `visits_${startDateStr}_${endDateStr}.pdf`,
      contentType: 'application/pdf',
      body: pdf,
    };
  }

  async exportSales(
    companyId: string,
    startDateStr: string,
    endDateStr: string,
    format: ReportFormat,
    userId?: string,
    customerId?: string
  ): Promise<ReportExportResult> {
    const data = await this.getSalesReport(companyId, startDateStr, endDateStr, userId, customerId);
    if (format === 'json') {
      return { format, filename: 'sales.json', contentType: 'application/json', body: data };
    }

    const headers = ['Employee', 'Customer', 'Amount', 'Created At', 'Remarks'];
    const rows = data.records.map((r) => [
      r.employee.name,
      r.customer.name,
      r.totalAmount,
      r.createdAt,
      r.remarks,
    ]);

    if (format === 'csv') {
      return {
        format,
        filename: `sales_${startDateStr}_${endDateStr}.csv`,
        contentType: 'text/csv; charset=utf-8',
        body: rowsToCsv(headers, rows),
      };
    }

    const pdf = await buildSimplePdf({
      title: 'Sales Report',
      subtitle: `${startDateStr} → ${endDateStr} · ${data.totalRecords} orders · revenue ${data.totalRevenue}`,
      headers,
      rows,
    });
    return {
      format,
      filename: `sales_${startDateStr}_${endDateStr}.pdf`,
      contentType: 'application/pdf',
      body: pdf,
    };
  }

  async exportInspections(
    companyId: string,
    startDateStr: string,
    endDateStr: string,
    format: ReportFormat,
    userId?: string
  ): Promise<ReportExportResult> {
    const data = await this.getInspectionsReport(companyId, startDateStr, endDateStr, userId);
    if (format === 'json') {
      return { format, filename: 'inspections.json', contentType: 'application/json', body: data };
    }

    const headers = ['Employee', 'Site', 'Category', 'Observation', 'Recommendation', 'Created At'];
    const rows = data.records.map((r) => [
      r.employee.name,
      r.siteName,
      r.category,
      r.observation,
      r.recommendation,
      r.createdAt,
    ]);

    if (format === 'csv') {
      return {
        format,
        filename: `inspections_${startDateStr}_${endDateStr}.csv`,
        contentType: 'text/csv; charset=utf-8',
        body: rowsToCsv(headers, rows),
      };
    }

    const pdf = await buildSimplePdf({
      title: 'Inspections Report',
      subtitle: `${startDateStr} → ${endDateStr} · ${data.totalRecords} records`,
      headers,
      rows,
    });
    return {
      format,
      filename: `inspections_${startDateStr}_${endDateStr}.pdf`,
      contentType: 'application/pdf',
      body: pdf,
    };
  }
}
