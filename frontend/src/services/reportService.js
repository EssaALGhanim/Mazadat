import { api } from './apiClient';

export async function submitReport(auctionId, message) {
    return api.post('/report', { auctionId, message: message || null });
}

export async function getAdminReports() {
    return api.get('/admin/reports');
}

export async function emailReporter(reportId, customMessage) {
    return api.post(`/admin/reports/${reportId}/email-reporter`,
        { customMessage: customMessage || null });
}

export async function emailAuctionHouse(reportId, customMessage) {
    return api.post(`/admin/reports/${reportId}/email-auction-house`,
        { customMessage: customMessage || null });
}

export async function deleteReportedAuction(reportId) {
    return api.delete(`/admin/reports/${reportId}/auction`);
}

export async function dismissReport(reportId) {
    return api.put(`/admin/reports/${reportId}/dismiss`);
}
