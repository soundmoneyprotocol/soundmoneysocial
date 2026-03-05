import React from 'react';
import { Container, Header, Card, Badge } from '@/components';
import { theme } from '../theme/theme';
import { formatNumber } from '../utils/formatters';

interface AnalyticsData {
  views: number;
  engagementRate: number;
  avgTimeOnPage: string;
  topPosts: Array<{
    title: string;
    views: number;
    engagement: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    views: number;
  }>;
}

const AnalyticsPage: React.FC = () => {
  const [analytics] = React.useState<AnalyticsData>({
    views: 45230,
    engagementRate: 8.5,
    avgTimeOnPage: '2m 34s',
    topPosts: [
      { title: 'New Track Release', views: 5200, engagement: 12.5 },
      { title: 'Behind the Scenes', views: 3840, engagement: 15.2 },
      { title: 'Community Update', views: 2950, engagement: 7.8 },
    ],
    timeSeriesData: [
      { date: 'Mon', views: 1200 },
      { date: 'Tue', views: 1900 },
      { date: 'Wed', views: 1500 },
      { date: 'Thu', views: 2200 },
      { date: 'Fri', views: 2800 },
      { date: 'Sat', views: 3200 },
      { date: 'Sun', views: 2400 },
    ],
  });

  const containerStyles: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const metricsGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  };

  const metricCardStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
  };

  const metricLabelStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
    marginBottom: theme.spacing.sm,
  };

  const metricValueStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    margin: 0,
  };

  const chartContainerStyles: React.CSSProperties = {
    marginBottom: theme.spacing.xl,
  };

  const chartBarContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '200px',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  };

  const barStyles: (height: number) => React.CSSProperties = (height) => ({
    flex: 1,
    height: `${(height / 3200) * 100}%`,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    minHeight: '20px',
    position: 'relative',
  });

  const barLabelStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '-24px',
    left: '0',
    right: '0',
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  };

  const topPostsListStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const postItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
  };

  const postInfoStyles: React.CSSProperties = {
    flex: 1,
  };

  const postTitleStyles: React.CSSProperties = {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
    marginBottom: theme.spacing.xs,
  };

  const postStatsStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
  };

  return (
    <Container maxWidth="lg" padding="lg" style={containerStyles}>
      <Header
        title="Analytics"
        subtitle="Track your engagement and performance metrics"
      />

      <div style={metricsGridStyles}>
        <Card style={metricCardStyles}>
          <p style={metricLabelStyles}>Total Views</p>
          <p style={metricValueStyles}>{formatNumber(analytics.views)}</p>
          <Badge variant="success" size="sm" style={{ marginTop: theme.spacing.md }}>
            ↑ 12% this week
          </Badge>
        </Card>

        <Card style={metricCardStyles}>
          <p style={metricLabelStyles}>Engagement Rate</p>
          <p style={metricValueStyles}>{analytics.engagementRate}%</p>
          <Badge variant="info" size="sm" style={{ marginTop: theme.spacing.md }}>
            Above average
          </Badge>
        </Card>

        <Card style={metricCardStyles}>
          <p style={metricLabelStyles}>Avg. Time on Page</p>
          <p style={metricValueStyles} style={{ fontSize: theme.typography.fontSize.xl }}>
            {analytics.avgTimeOnPage}
          </p>
          <Badge variant="info" size="sm" style={{ marginTop: theme.spacing.md }}>
            Very engaged
          </Badge>
        </Card>
      </div>

      <Card style={chartContainerStyles}>
        <h3 style={{ marginTop: 0, color: theme.colors.text.primary }}>Views This Week</h3>
        <div style={chartBarContainerStyles}>
          {analytics.timeSeriesData.map((data, index) => (
            <div key={index} style={{ flex: 1, position: 'relative', height: '100%' }}>
              <div style={barStyles(data.views)}>
                <div style={barLabelStyles}>{data.date}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '40px', fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, textAlign: 'center' }}>
          Each bar represents daily views. Total: {formatNumber(analytics.timeSeriesData.reduce((sum, d) => sum + d.views, 0))}
        </div>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0, color: theme.colors.text.primary }}>Top Performing Posts</h3>
        <div style={topPostsListStyles}>
          {analytics.topPosts.map((post, index) => (
            <div key={index} style={postItemStyles}>
              <div style={postInfoStyles}>
                <p style={postTitleStyles}>{post.title}</p>
                <p style={postStatsStyles}>
                  {formatNumber(post.views)} views • {post.engagement}% engagement
                </p>
              </div>
              <Badge variant="success">{index + 1}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </Container>
  );
};

export default AnalyticsPage;
