export interface StoryAsset {
    id: string;
    title: string;
    imageUri: string;
    createdAt: string;
    type: 'image' | 'video' | 'text';
    isViewed?: boolean;
    journal_id?: string;
    session_id?: string;
}

// Mock journal entries data that matches the API response structure
export const mockJournalEntries = [
    {
        journal_id: "3526ffe5-be8e-411e-beed-500dd69591d8",
        created_at: "2025-09-25T17:38:57.000Z",
        sessions: [
            {
                session_id: "eeed484c-cd1f-45e6-abf1-f7ced8fc33a1",
                title: "Evening Reflection",
                metadata: null
            },
            {
                session_id: "aaabbbcc-dddd-eeee-ffff-111111111111",
                title: "Late Night Thoughts",
                metadata: null
            },
            {
                session_id: "bbbbcccc-dddd-eeee-ffff-222222222222",
                title: "Morning Gratitude",
                metadata: null
            }
        ]
    },
    {
        journal_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        created_at: "2025-09-24T14:22:15.000Z",
        sessions: [
            {
                session_id: "f1e2d3c4-b5a6-9780-1234-567890abcdef",
                title: "Afternoon Walk",
                metadata: null
            },
            {
                session_id: "ccccdddd-eeee-ffff-1111-333333333333",
                title: "Evening Meditation",
                metadata: null
            }
        ]
    },
    {
        journal_id: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
        created_at: "2025-09-23T09:15:30.000Z",
        sessions: [
            {
                session_id: "a9b8c7d6-e5f4-3210-9876-543210fedcba",
                title: "Morning Coffee",
                metadata: null
            }
        ]
    },
    {
        journal_id: "c3d4e5f6-a7b8-9012-cdef-345678901234",
        created_at: "2025-09-22T16:45:20.000Z",
        sessions: [
            {
                session_id: "98765432-1098-7654-3210-fedcba987654",
                title: "City Sunset",
                metadata: null
            },
            {
                session_id: "ddddcccc-bbbb-aaaa-9999-444444444444",
                title: "Lunch Break",
                metadata: null
            },
            {
                session_id: "eeeeffff-aaaa-bbbb-cccc-555555555555",
                title: "Early Morning",
                metadata: null
            }
        ]
    },
    {
        journal_id: "d4e5f6a7-b8c9-0123-defa-456789012345",
        created_at: "2025-09-21T11:30:45.000Z",
        sessions: [
            {
                session_id: "87654321-0987-6543-2109-edcba9876543",
                title: "Garden Blooms",
                metadata: null
            }
        ]
    },
    {
        journal_id: "e5f6a7b8-c9d0-1234-efab-567890123456",
        created_at: "2025-09-20T19:20:10.000Z",
        sessions: [
            {
                session_id: "76543210-9876-5432-1098-dcba98765432",
                title: "Ocean Waves",
                metadata: null
            }
        ]
    }
];

// Story assets that correspond to journal entries
export const mockStoryAssets: StoryAsset[] = [
    // Sept 25 - Multiple sessions
    {
        id: 'story-3526ffe5-be8e-411e-beed-500dd69591d8-1',
        title: 'Evening Reflection',
        imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-25T17:38:57.000Z',
        type: 'image',
        isViewed: false,
        journal_id: '3526ffe5-be8e-411e-beed-500dd69591d8',
        session_id: 'eeed484c-cd1f-45e6-abf1-f7ced8fc33a1',
    },
    {
        id: 'story-3526ffe5-be8e-411e-beed-500dd69591d8-2',
        title: 'Late Night Thoughts',
        imageUri: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-25T20:15:30.000Z',
        type: 'image',
        isViewed: false,
        journal_id: '3526ffe5-be8e-411e-beed-500dd69591d8',
        session_id: 'aaabbbcc-dddd-eeee-ffff-111111111111',
    },
    {
        id: 'story-3526ffe5-be8e-411e-beed-500dd69591d8-3',
        title: 'Morning Gratitude',
        imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-25T08:30:15.000Z',
        type: 'image',
        isViewed: true,
        journal_id: '3526ffe5-be8e-411e-beed-500dd69591d8',
        session_id: 'bbbbcccc-dddd-eeee-ffff-222222222222',
    },
    // Sept 24 - Multiple sessions
    {
        id: 'story-a1b2c3d4-e5f6-7890-abcd-ef1234567890-1',
        title: 'Afternoon Walk',
        imageUri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-24T14:22:15.000Z',
        type: 'image',
        isViewed: true,
        journal_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        session_id: 'f1e2d3c4-b5a6-9780-1234-567890abcdef',
    },
    {
        id: 'story-a1b2c3d4-e5f6-7890-abcd-ef1234567890-2',
        title: 'Evening Meditation',
        imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-24T19:45:20.000Z',
        type: 'image',
        isViewed: false,
        journal_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        session_id: 'ccccdddd-eeee-ffff-1111-333333333333',
    },
    // Sept 23 - Single session
    {
        id: 'story-b2c3d4e5-f6a7-8901-bcde-f23456789012',
        title: 'Morning Coffee',
        imageUri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-23T09:15:30.000Z',
        type: 'image',
        isViewed: false,
        journal_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
        session_id: 'a9b8c7d6-e5f4-3210-9876-543210fedcba',
    },
    // Sept 22 - Multiple sessions
    {
        id: 'story-c3d4e5f6-a7b8-9012-cdef-345678901234-1',
        title: 'City Sunset',
        imageUri: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-22T16:45:20.000Z',
        type: 'image',
        isViewed: true,
        journal_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        session_id: '98765432-1098-7654-3210-fedcba987654',
    },
    {
        id: 'story-c3d4e5f6-a7b8-9012-cdef-345678901234-2',
        title: 'Lunch Break',
        imageUri: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-22T12:30:45.000Z',
        type: 'image',
        isViewed: false,
        journal_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        session_id: 'ddddcccc-bbbb-aaaa-9999-444444444444',
    },
    {
        id: 'story-c3d4e5f6-a7b8-9012-cdef-345678901234-3',
        title: 'Early Morning',
        imageUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-22T07:15:10.000Z',
        type: 'image',
        isViewed: true,
        journal_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        session_id: 'eeeeffff-aaaa-bbbb-cccc-555555555555',
    },
    // Sept 21 - Single session
    {
        id: 'story-d4e5f6a7-b8c9-0123-defa-456789012345',
        title: 'Garden Blooms',
        imageUri: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-21T11:30:45.000Z',
        type: 'image',
        isViewed: false,
        journal_id: 'd4e5f6a7-b8c9-0123-defa-456789012345',
        session_id: '87654321-0987-6543-2109-edcba9876543',
    },
    // Sept 20 - Single session
    {
        id: 'story-e5f6a7b8-c9d0-1234-efab-567890123456',
        title: 'Ocean Waves',
        imageUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        createdAt: '2025-09-20T19:20:10.000Z',
        type: 'image',
        isViewed: true,
        journal_id: 'e5f6a7b8-c9d0-1234-efab-567890123456',
        session_id: '76543210-9876-5432-1098-dcba98765432',
    },
];

// Helper function to get recent stories (last 7 days)
export const getRecentStories = (stories: StoryAsset[] = mockStoryAssets): StoryAsset[] => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return stories
        .filter(story => new Date(story.createdAt) >= sevenDaysAgo)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Helper function to get unviewed stories count
export const getUnviewedCount = (stories: StoryAsset[] = mockStoryAssets): number => {
    return stories.filter(story => !story.isViewed).length;
};

// Helper function to get story assets for a specific journal entry
export const getStoryAssetsForJournal = (journalId: string): StoryAsset[] => {
    return mockStoryAssets.filter(story => story.journal_id === journalId);
};

// Helper function to create complete API response with story assets
export const createCompleteApiResponse = (sessionId: string) => {
    // Filter journal entries that have the specified session
    const relevantEntries = mockJournalEntries.filter(entry =>
        entry.sessions.some(session => session.session_id === sessionId)
    );

    // Add story assets to each journal entry
    const entriesWithStories = relevantEntries.map(entry => ({
        ...entry,
        story_assets: getStoryAssetsForJournal(entry.journal_id)
    }));

    return {
        success: true,
        data: entriesWithStories,
        total: entriesWithStories.length,
        session_id: sessionId
    };
};

// Complete mock API response with story assets
export const mockCompleteApiResponse = createCompleteApiResponse('eeed484c-cd1f-45e6-abf1-f7ced8fc33a1');
