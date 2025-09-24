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
