import React, { useState } from 'react';
import { Container, Header, Card, Button, Avatar, Badge, Input } from '@/components';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';

interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked: boolean;
}

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Alex Producer',
        initials: 'AP',
      },
      content: 'Just released my new track on SoundMoney! Check it out and support independent music 🎵',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 5,
      liked: false,
    },
    {
      id: '2',
      author: {
        name: 'Music Lover',
        initials: 'ML',
      },
      content: 'The quality of music on SoundMoney is incredible. Supporting artists directly is the future!',
      timestamp: '4 hours ago',
      likes: 42,
      comments: 8,
      liked: false,
    },
  ]);

  const toggleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
  };

  const postStyles: React.CSSProperties = {
    marginBottom: theme.spacing.lg,
  };

  const postHeaderStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  };

  const authorStyles: React.CSSProperties = {
    flex: 1,
  };

  const authorNameStyles: React.CSSProperties = {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
    fontSize: theme.typography.fontSize.base,
  };

  const timestampStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
  };

  const contentStyles: React.CSSProperties = {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeight.normal,
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.md,
    borderTop: `1px solid ${theme.colors.gray[800]}`,
    paddingTop: theme.spacing.md,
  };

  const actionButtonStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    background: 'none',
    border: 'none',
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    padding: 0,
  };

  const createPostStyles: React.CSSProperties = {
    marginBottom: theme.spacing.lg,
  };

  return (
    <Container maxWidth="lg" padding="lg">
      <Header title="Social Feed" subtitle="Share your music and connect with the community" />

      {user && (
        <Card style={createPostStyles}>
          <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <Avatar alt={user.username} initials={user.username.charAt(0).toUpperCase()} size="md" />
            <div style={{ flex: 1 }}>
              <Input
                placeholder="What's on your mind?"
                style={{ marginBottom: theme.spacing.sm }}
              />
              <div style={{ display: 'flex', gap: theme.spacing.sm, justifyContent: 'flex-end' }}>
                <Button variant="secondary" size="sm">
                  Cancel
                </Button>
                <Button variant="primary" size="sm">
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div style={containerStyles}>
        {posts.map((post) => (
          <Card key={post.id} style={postStyles}>
            <div style={postHeaderStyles}>
              <Avatar alt={post.author.name} initials={post.author.initials} size="md" />
              <div style={authorStyles}>
                <p style={authorNameStyles}>{post.author.name}</p>
                <p style={timestampStyles}>{post.timestamp}</p>
              </div>
            </div>

            <p style={contentStyles}>{post.content}</p>

            <div style={actionsStyles}>
              <button
                style={actionButtonStyles}
                onClick={() => toggleLike(post.id)}
              >
                <span>{post.liked ? '❤️' : '🤍'}</span>
                <span>{post.likes} Likes</span>
              </button>
              <button style={actionButtonStyles}>
                <span>💬</span>
                <span>{post.comments} Comments</span>
              </button>
              <button style={actionButtonStyles}>
                <span>🔗</span>
                <span>Share</span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default FeedPage;
