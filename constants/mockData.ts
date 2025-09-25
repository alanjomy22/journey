// Mock data for the social media app

export const mockStories = [
    { id: '1', username: 'Sarah', isAddStory: false },
    { id: '2', username: 'Mike', isAddStory: false },
    { id: '3', username: 'Emma', isAddStory: false },
    { id: '4', username: 'Alex', isAddStory: false },
];

export const mockPosts = [
    {
        id: '1',
        username: 'sarah_photography',
        location: 'New York, NY',
        caption: 'Beautiful sunset in Central Park! 🌅',
        likes: 'Liked by mike_travels and 124 others',
        timeAgo: '2 hours ago',
        isLiked: false,
    },
    {
        id: '2',
        username: 'mike_travels',
        location: 'Tokyo, Japan',
        caption: 'Amazing street food in Tokyo! 🍜',
        likes: 'Liked by emma_foodie and 89 others',
        timeAgo: '4 hours ago',
        isLiked: true,
    },
    {
        id: '3',
        username: 'emma_foodie',
        location: 'Paris, France',
        caption: 'Best croissant I\'ve ever had! 🥐',
        likes: 'Liked by sarah_photography and 67 others',
        timeAgo: '6 hours ago',
        isLiked: false,
    },
];

export const mockActivities = [
    {
        id: '1',
        type: 'like' as const,
        username: 'Sarah',
        action: 'liked your photo',
        timeAgo: '2 minutes ago',
    },
    {
        id: '2',
        type: 'follow' as const,
        username: 'Mike',
        action: 'started following you',
        timeAgo: '1 hour ago',
    },
    {
        id: '3',
        type: 'comment' as const,
        username: 'Emma',
        action: 'commented on your post',
        timeAgo: '3 hours ago',
    },
    {
        id: '4',
        type: 'like' as const,
        username: 'Alex',
        action: 'and 5 others liked your photo',
        timeAgo: '5 hours ago',
    },
    {
        id: '5',
        type: 'follow' as const,
        username: 'Lisa',
        action: 'started following you',
        timeAgo: '1 day ago',
    },
];

export const mockRecentSearches = [
    '#photography',
    '#travel',
    '#food',
    '#nature',
    '#art',
];

export const mockNewPostOptions = [
    {
        id: '1',
        iconName: 'camera-line',
        title: 'Camera',
    },
    {
        id: '2',
        iconName: 'image-line',
        title: 'Photo Library',
    },
    {
        id: '3',
        iconName: 'text',
        title: 'Text Post',
    },
    {
        id: '4',
        iconName: 'video-line',
        title: 'Video',
    },
];

export const mockProfileData = {
    username: '@johndoe',
    displayName: 'John Doe',
    bio: 'Photography enthusiast 📸 | Travel lover ✈️ | Coffee addict ☕',
    posts: 156,
    followers: '1.2K',
    following: 890,
};

export const mockJournalEntries = [
    {
        id: '1',
        day: 'Monday',
        date: '2024-01-01',
        month: 'January',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
        preview: 'Had a wonderful day at the beach. The waves were perfect and the sunset was breathtaking.',
    },
    {
        id: '2',
        day: 'Tuesday',
        date: '2024-01-02',
        month: 'January',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
        preview: 'Took a peaceful walk through the autumn forest. The golden leaves created a magical atmosphere.',
    },
    {
        id: '3',
        day: 'Wednesday',
        date: '2024-01-03',
        month: 'January',
        image: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=400&h=300&fit=crop',
        preview: 'Discovered a beautiful sunflower field today. Nature never fails to amaze me.',
    },
    {
        id: '4',
        day: 'Thursday',
        date: '2024-01-04',
        month: 'January',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        preview: 'Mountain hiking adventure! The valley views were absolutely stunning.',
    },
    {
        id: '5',
        day: 'Friday',
        date: '2024-01-05',
        month: 'January',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        preview: 'Evening by the lake was so serene. Perfect way to end the week.',
    },
    {
        id: '6',
        day: 'Saturday',
        date: '2024-01-06',
        month: 'January',
        image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop',
        preview: 'Quiet morning by the lake with coffee and reflection. Feeling grateful.',
    },
];
