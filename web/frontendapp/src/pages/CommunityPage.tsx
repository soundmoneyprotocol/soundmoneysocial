import React, { useState } from 'react';
import { Container, Header, Card, Button, Avatar, Badge, Input } from '@/components';
import { theme } from '../theme/theme';
import { formatNumber } from '../utils/formatters';

interface Creator {
  id: string;
  name: string;
  initials: string;
  followers: number;
  following: boolean;
  category: string;
  bio: string;
}

const CommunityPage: React.FC = () => {
  const [creators, setCreators] = useState<Creator[]>([
    {
      id: '1',
      name: 'Luna Studios',
      initials: 'LS',
      followers: 2400,
      following: false,
      category: 'Electronic',
      bio: 'Creating unique electronic soundscapes',
    },
    {
      id: '2',
      name: 'Jazz Vibes',
      initials: 'JV',
      followers: 1850,
      following: false,
      category: 'Jazz',
      bio: 'Modern jazz fusion artist',
    },
    {
      id: '3',
      name: 'Indie Folk',
      initials: 'IF',
      followers: 3200,
      following: true,
      category: 'Folk',
      bio: 'Singer-songwriter storytelling',
    },
    {
      id: '4',
      name: 'Hip Hop Kings',
      initials: 'HK',
      followers: 4100,
      following: false,
      category: 'Hip Hop',
      bio: 'Authentic hip-hop beats',
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Electronic', 'Jazz', 'Folk', 'Hip Hop', 'Pop', 'Rock'];

  const toggleFollow = (creatorId: string) => {
    setCreators((prevCreators) =>
      prevCreators.map((creator) =>
        creator.id === creatorId
          ? { ...creator, following: !creator.following }
          : creator
      )
    );
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const filterStyles: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.md,
    overflowX: 'auto',
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  };

  const categoryButtonStyles: (isActive: boolean) => React.CSSProperties = (isActive) => ({
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: isActive ? theme.colors.primary : theme.colors.background.tertiary,
    color: isActive ? theme.colors.white : theme.colors.text.primary,
    border: isActive ? 'none' : `1px solid ${theme.colors.gray[700]}`,
    borderRadius: theme.borderRadius.full,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  });

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing.lg,
  };

  const creatorCardStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing.lg,
  };

  const creatorNameStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: `${theme.spacing.md} 0 ${theme.spacing.xs} 0`,
  };

  const categoryBadgeStyles: React.CSSProperties = {
    marginBottom: theme.spacing.md,
  };

  const bioStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: `${theme.spacing.md} 0`,
    minHeight: '40px',
  };

  const statsStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    padding: `${theme.spacing.md} 0`,
    borderTop: `1px solid ${theme.colors.gray[800]}`,
    borderBottom: `1px solid ${theme.colors.gray[800]}`,
    marginBottom: theme.spacing.md,
  };

  const statStyles: React.CSSProperties = {
    textAlign: 'center',
  };

  const statValueStyles: React.CSSProperties = {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    margin: 0,
  };

  const statLabelStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    margin: `${theme.spacing.xs} 0 0 0`,
  };

  return (
    <Container maxWidth="lg" padding="lg" style={containerStyles}>
      <Header
        title="Community"
        subtitle="Discover amazing creators and join the SoundMoney movement"
      />

      <div style={filterStyles}>
        {categories.map((category) => (
          <button
            key={category}
            style={categoryButtonStyles(selectedCategory === category)}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div style={gridStyles}>
        {creators.map((creator) => (
          <Card key={creator.id} style={creatorCardStyles} hoverable>
            <Avatar alt={creator.name} initials={creator.initials} size="lg" />
            <h3 style={creatorNameStyles}>{creator.name}</h3>
            <Badge variant="info" style={categoryBadgeStyles}>
              {creator.category}
            </Badge>
            <p style={bioStyles}>{creator.bio}</p>

            <div style={statsStyles}>
              <div style={statStyles}>
                <p style={statValueStyles}>{formatNumber(creator.followers)}</p>
                <p style={statLabelStyles}>Followers</p>
              </div>
            </div>

            <Button
              variant={creator.following ? 'secondary' : 'primary'}
              size="sm"
              style={{ width: '100%' }}
              onClick={() => toggleFollow(creator.id)}
            >
              {creator.following ? '✓ Following' : 'Follow'}
            </Button>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default CommunityPage;
