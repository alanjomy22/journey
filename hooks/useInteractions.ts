import { useCallback, useState } from 'react';

export interface PostInteraction {
    id: string;
    isLiked: boolean;
    isBookmarked: boolean;
}

export function useInteractions(initialPosts: PostInteraction[] = []) {
    const [posts, setPosts] = useState<PostInteraction[]>(initialPosts);

    const toggleLike = useCallback((postId: string) => {
        setPosts(prev => prev.map(post =>
            post.id === postId
                ? { ...post, isLiked: !post.isLiked }
                : post
        ));
    }, []);

    const toggleBookmark = useCallback((postId: string) => {
        setPosts(prev => prev.map(post =>
            post.id === postId
                ? { ...post, isBookmarked: !post.isBookmarked }
                : post
        ));
    }, []);

    const handleComment = useCallback((postId: string) => {
        console.log(`Comment on post ${postId}`);
        // Add comment logic here
    }, []);

    const handleShare = useCallback((postId: string) => {
        console.log(`Share post ${postId}`);
        // Add share logic here
    }, []);

    const handleMore = useCallback((postId: string) => {
        console.log(`More options for post ${postId}`);
        // Add more options logic here
    }, []);

    return {
        posts,
        toggleLike,
        toggleBookmark,
        handleComment,
        handleShare,
        handleMore,
    };
}
