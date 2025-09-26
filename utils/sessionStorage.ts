import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_ID_KEY = 'current_session_id';

export const sessionStorage = {
    // Store the current session ID
    async setSessionId(sessionId: string): Promise<void> {
        try {
            await AsyncStorage.setItem(SESSION_ID_KEY, sessionId);
            console.log('✅ Session ID stored:', sessionId);
        } catch (error) {
            console.error('❌ Failed to store session ID:', error);
        }
    },

    // Get the current session ID
    async getSessionId(): Promise<string | null> {
        try {
            const sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
            console.log('🔍 Retrieved session ID:', sessionId);
            return sessionId;
        } catch (error) {
            console.error('❌ Failed to retrieve session ID:', error);
            return null;
        }
    },

    // Clear the session ID
    async clearSessionId(): Promise<void> {
        try {
            await AsyncStorage.removeItem(SESSION_ID_KEY);
            console.log('🗑️ Session ID cleared');
        } catch (error) {
            console.error('❌ Failed to clear session ID:', error);
        }
    },

    // Get session ID with fallback
    async getSessionIdWithFallback(fallbackId: string = 'entry_009_simple'): Promise<string> {
        const storedId = await this.getSessionId();
        return storedId || fallbackId;
    },

    // Get all session IDs for current day (from mock data for now)
    async getCurrentDaySessionIds(): Promise<string[]> {
        try {
            // For now, return the session IDs from our mock data for the current day
            // In a real app, this would query the database for today's sessions
            const currentDaySessionIds = [
                'entry_009_simple',
                'entry_010_simple',
                'entry_011_simple'
            ];

            console.log('📅 Current day session IDs:', currentDaySessionIds);
            return currentDaySessionIds;
        } catch (error) {
            console.error('❌ Failed to get current day session IDs:', error);
            return ['entry_009_simple']; // Fallback
        }
    }
};
