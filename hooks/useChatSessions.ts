import { apiService, JournalEntry } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

interface UseChatSessionsReturn {
    journalEntries: JournalEntry[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useChatSessions(sessionId: string): UseChatSessionsReturn {
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchChatSessions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getChatSessions(sessionId);

            if (response.success) {
                setJournalEntries(response.data);
            } else {
                setError('Failed to fetch chat sessions');
            }
        } catch (err) {
            console.error('Error fetching chat sessions:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        if (sessionId) {
            fetchChatSessions();
        }
    }, [sessionId, fetchChatSessions]);

    return {
        journalEntries,
        loading,
        error,
        refetch: fetchChatSessions,
    };
}
