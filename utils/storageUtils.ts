import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage management utilities to prevent SQLite_FULL errors
 */

export interface StorageInfo {
    totalKeys: number;
    estimatedSize: number;
    oldestEntry?: string;
    newestEntry?: string;
}

/**
 * Get storage information and estimate usage
 */
export async function getStorageInfo(): Promise<StorageInfo> {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const imageKeys = keys.filter(key =>
            key.startsWith('captured_image_') || key.startsWith('journal_')
        );

        let estimatedSize = 0;
        let oldestTimestamp = Infinity;
        let newestTimestamp = 0;
        let oldestEntry = '';
        let newestEntry = '';

        // Sample a few entries to estimate size
        const sampleSize = Math.min(10, imageKeys.length);
        for (let i = 0; i < sampleSize; i++) {
            const key = imageKeys[i];
            const value = await AsyncStorage.getItem(key);
            if (value) {
                estimatedSize += value.length;

                // Extract timestamp from key
                const timestampMatch = key.match(/(\d+)$/);
                if (timestampMatch) {
                    const timestamp = parseInt(timestampMatch[1]);
                    if (timestamp < oldestTimestamp) {
                        oldestTimestamp = timestamp;
                        oldestEntry = key;
                    }
                    if (timestamp > newestTimestamp) {
                        newestTimestamp = timestamp;
                        newestEntry = key;
                    }
                }
            }
        }

        // Extrapolate total size
        if (sampleSize > 0) {
            estimatedSize = (estimatedSize / sampleSize) * imageKeys.length;
        }

        return {
            totalKeys: imageKeys.length,
            estimatedSize: Math.round(estimatedSize / 1024), // KB
            oldestEntry: oldestTimestamp !== Infinity ? oldestEntry : undefined,
            newestEntry: newestTimestamp > 0 ? newestEntry : undefined,
        };
    } catch (error) {
        console.error('Error getting storage info:', error);
        return { totalKeys: 0, estimatedSize: 0 };
    }
}

/**
 * Clean up old storage entries to free space
 */
export async function cleanupOldEntries(maxEntries: number = 50): Promise<number> {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const imageKeys = keys.filter(key =>
            key.startsWith('captured_image_') || key.startsWith('journal_')
        );

        if (imageKeys.length <= maxEntries) {
            return 0; // No cleanup needed
        }

        // Sort by timestamp (newest first)
        const sortedKeys = imageKeys.sort((a, b) => {
            const timestampA = parseInt(a.match(/(\d+)$/)?.[1] || '0');
            const timestampB = parseInt(b.match(/(\d+)$/)?.[1] || '0');
            return timestampB - timestampA;
        });

        // Keep the newest entries, remove the rest
        const keysToRemove = sortedKeys.slice(maxEntries);

        await AsyncStorage.multiRemove(keysToRemove);

        console.log(`Cleaned up ${keysToRemove.length} old storage entries`);
        return keysToRemove.length;
    } catch (error) {
        console.error('Error cleaning up storage:', error);
        return 0;
    }
}

/**
 * Check if storage is getting full and warn user
 */
export async function checkStorageHealth(): Promise<{
    isHealthy: boolean;
    warning?: string;
    recommendation?: string;
}> {
    try {
        const info = await getStorageInfo();

        // Warning thresholds
        const sizeWarningThreshold = 50 * 1024; // 50MB in KB
        const countWarningThreshold = 100; // 100 entries

        if (info.estimatedSize > sizeWarningThreshold || info.totalKeys > countWarningThreshold) {
            return {
                isHealthy: false,
                warning: `Storage is getting full (${info.estimatedSize}KB, ${info.totalKeys} entries)`,
                recommendation: 'Consider cleaning up old entries or reducing image quality'
            };
        }

        return { isHealthy: true };
    } catch (error) {
        console.error('Error checking storage health:', error);
        return { isHealthy: false, warning: 'Unable to check storage status' };
    }
}

/**
 * Emergency cleanup - remove oldest entries when storage is full
 */
export async function emergencyCleanup(): Promise<boolean> {
    try {
        // Remove oldest 25% of entries
        const keys = await AsyncStorage.getAllKeys();
        const imageKeys = keys.filter(key =>
            key.startsWith('captured_image_') || key.startsWith('journal_')
        );

        if (imageKeys.length === 0) {
            return false;
        }

        const entriesToRemove = Math.max(1, Math.floor(imageKeys.length * 0.25));

        // Sort by timestamp (oldest first)
        const sortedKeys = imageKeys.sort((a, b) => {
            const timestampA = parseInt(a.match(/(\d+)$/)?.[1] || '0');
            const timestampB = parseInt(b.match(/(\d+)$/)?.[1] || '0');
            return timestampA - timestampB;
        });

        const keysToRemove = sortedKeys.slice(0, entriesToRemove);
        await AsyncStorage.multiRemove(keysToRemove);

        console.log(`Emergency cleanup: removed ${keysToRemove.length} entries`);
        return true;
    } catch (error) {
        console.error('Error during emergency cleanup:', error);
        return false;
    }
}
