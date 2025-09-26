export interface StoryAsset {
    id: string;
    title: string;
    summary: string;
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
                session_id: "entry_009_simple",
                title: "Getting started with the day",
                metadata: null,
                summary: "Morning routine walk to the office"
            },
            {
                session_id: "entry_010_simple",
                title: "Gamemode on",
                metadata: null,
                summary: "Playing FIFA with friends"
            },
            {
                session_id: "entry_011_simple",
                title: "Keycode vibes",
                metadata: null,
                summary: "Working on the keycode hackathon"
            }
        ]
    },
    {
        journal_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        created_at: "2025-09-24T14:22:15.000Z",
        sessions: [
            {
                session_id: "entry_012_simple",
                title: "Afternoon Walk",
                metadata: null
            },
            {
                session_id: "entry_009_simple",
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
        title: 'Getting started with the day',
        summary: 'Morning routine walk to the office',
        imageUri: 'https://stg.trypncl.com/walk.jpeg',
        createdAt: '2025-09-25T17:38:57.000Z',
        type: 'image',
        isViewed: false,
        journal_id: '3526ffe5-be8e-411e-beed-500dd69591d8',
        session_id: 'entry_009_simple',
    },
    {
        id: 'story-3526ffe5-be8e-411e-beed-500dd69591d8-2',
        title: 'Game mode on',
        summary: 'Playing FIFA with friends',
        imageUri: 'https://stg.trypncl.com/fifa.jpeg',
        createdAt: '2025-09-25T20:15:30.000Z',
        type: 'image',
        isViewed: false,
        journal_id: '3526ffe5-be8e-411e-beed-500dd69591d8',
        session_id: 'entry_010_simple',
    },
    {
        id: 'story-3526ffe5-be8e-411e-beed-500dd69591d8-3',
        title: 'Keycode vibes',
        summary: 'Working on the keycode hackathon',
        imageUri: 'https://stg.trypncl.com/work.jpeg',
        createdAt: '2025-09-25T08:30:15.000Z',
        type: 'image',
        isViewed: true,
        journal_id: '3526ffe5-be8e-411e-beed-500dd69591d8',
        session_id: 'entry_011_simple',
    },
    // Sept 24 - Multiple sessions
    {
        id: 'story-a1b2c3d4-e5f6-7890-abcd-ef1234567890-1',
        title: 'Afternoon Walk',
        summary: 'Afternoon walk to the park',
        imageUri: 'https://stg.trypncl.com/keycode.jpeg',
        createdAt: '2025-09-24T14:22:15.000Z',
        type: 'image',
        isViewed: true,
        journal_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        session_id: 'entry_012_simple',
    },
    {
        id: 'story-a1b2c3d4-e5f6-7890-abcd-ef1234567890-2',
        title: 'Evening Meditation',
        summary: 'Evening meditation to relax',
        imageUri: 'https://stg.trypncl.com/walk.jpeg',
        createdAt: '2025-09-24T19:45:20.000Z',
        type: 'image',
        isViewed: false,
        journal_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        session_id: 'entry_009_simple',
    },
    // Sept 23 - Single session
    {
        id: 'story-b2c3d4e5-f6a7-8901-bcde-f23456789012',
        title: 'Morning Coffee',
        summary: 'Morning coffee with friends',
        imageUri: 'https://stg.trypncl.com/fifa.jpeg',
        createdAt: '2025-09-23T09:15:30.000Z',
        type: 'image',
        isViewed: false,
        journal_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
        session_id: 'entry_010_simple',
    },
    // Sept 22 - Multiple sessions
    {
        id: 'story-c3d4e5f6-a7b8-9012-cdef-345678901234-1',
        title: 'City Sunset',
        summary: 'City sunset with friends',
        imageUri: 'https://stg.trypncl.com/work.jpeg',
        createdAt: '2025-09-22T16:45:20.000Z',
        type: 'image',
        isViewed: true,
        journal_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        session_id: 'entry_011_simple',
    },
    {
        id: 'story-c3d4e5f6-a7b8-9012-cdef-345678901234-2',
        title: 'Lunch Break',
        summary: 'Lunch break with friends',
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
        summary: 'Early morning with friends',
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
        summary: 'Garden blooms with friends',
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
        summary: 'Ocean waves with friends',
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

// Helper function to get journal entries for a specific date
export const getJournalEntriesForDate = (targetDate: string) => {
    const targetDateObj = new Date(targetDate);
    const targetDateString = targetDateObj.toISOString().split('T')[0]; // Get YYYY-MM-DD format

    return mockJournalEntries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        const entryDateString = entryDate.toISOString().split('T')[0];
        return entryDateString === targetDateString;
    });
};

// Helper function to create complete API response with story assets
export const createCompleteApiResponse = (sessionId: string) => {
    // Show entries for a specific date (e.g., today or a particular day)
    // For demo purposes, let's show entries for September 25, 2025
    const targetDate = '2025-09-25';
    const relevantEntries = getJournalEntriesForDate(targetDate);

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
export const mockCompleteApiResponse = createCompleteApiResponse('entry_009_simple');
