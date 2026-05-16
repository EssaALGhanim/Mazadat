import { api } from './apiClient';

function normalizeSubmissionPayload(input = {}) {
    return {
        paymentMethod: input.paymentMethod,
        amount: Number(input.amount),
        referenceNumber: input.referenceNumber || null,
        notes: input.notes || null,
        metadata: input.metadata || null,
    };
}

export const getPaymentStatus = (auctionId) =>
    api.get(`/payment/status/${auctionId}`);

export const submitPayment = (auctionId, payload) =>
    api.post('/payment/submit', {
        auctionId,
        ...normalizeSubmissionPayload(payload),
    });
