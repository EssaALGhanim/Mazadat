import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/apiClient';

export function useAutoBid(auctionId) {
    const [autoBid, setAutoBid] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAutoBid = useCallback(async () => {
        if (!auctionId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.get('/bid/autobid/my-autobids');
            // data is expected to be a list of auto-bids
            const auctionAutoBid = Array.isArray(data) ? data.find(b => b.auctionId === Number(auctionId) || b.auction?.id === Number(auctionId)) : null;
            setAutoBid(auctionAutoBid || null);
        } catch (err) {
            console.error('Failed to fetch auto-bids:', err);
            setError(err.message || 'Failed to fetch auto-bid');
        } finally {
            setIsLoading(false);
        }
    }, [auctionId]);


    const setAutoBidFn = useCallback(async (maxAmount) => {
        setIsLoading(true);
        setError(null);
        try {
            const newAutoBid = await api.post('/bid/autobid/set', {
                auctionId,
                maxAmount: Number(maxAmount)
            });
            setAutoBid(newAutoBid);
            return newAutoBid;
        } catch (err) {
            console.error('Failed to set auto-bid:', err);
            setError(err.message || 'Failed to set auto-bid');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [auctionId]);

    const cancelAutoBid = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await api.delete(`/bid/autobid/cancel/${auctionId}`);
            setAutoBid(null);
        } catch (err) {
            console.error('Failed to cancel auto-bid:', err);
            setError(err.message || 'Failed to cancel auto-bid');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (auctionId) {
            fetchAutoBid();
        }
    }, [fetchAutoBid, auctionId]);

    return {
        autoBid,
        isLoading,
        error,
        setAutoBid: setAutoBidFn,
        cancelAutoBid,
        fetchAutoBid
    };
}
