import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionTier } from '../contexts/SubscriptionContext';
import { Loading } from '../components';

/**
 * DashboardRouter - Smart routing based on user subscription & creator status
 *
 * Routes:
 * - Team/Pro-Artist → /artist-dashboard
 * - Creator (soundmoney-ai) → /onboarding
 * - Regular User → /feed
 */

export const DashboardRouter: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    // TODO: Fetch user subscription & creator status from API
    // For now, redirecting to feed as default
    checkUserTierAndRoute();
  }, [user, isLoading, navigate]);

  const checkUserTierAndRoute = async () => {
    try {
      // Example: Fetch user subscription from API
      const accessToken = sessionStorage.getItem('soundmoney_access_token');
      if (!accessToken) {
        navigate('/feed');
        return;
      }

      // TODO: Call API endpoint to get subscription status
      // const response = await fetch(`${API_BASE}/api/subscriptions/${user.id}`, {
      //   headers: { Authorization: `Bearer ${accessToken}` }
      // });
      // const { subscription_tier, is_creator } = await response.json();

      // FOR NOW: Default to feed (update once you have subscription data)
      // Use unknown type to allow any comparison during development
      const subscription_tier: any = 'soundmoney-ai'; // TODO: Get from API
      const is_creator = false; // TODO: Get from API

      if (subscription_tier === 'artist-pro' || subscription_tier === 'team') {
        // Artist dashboard for paid creators
        navigate('/artist-dashboard');
      } else if (is_creator && subscription_tier === 'soundmoney-ai') {
        // Onboarding for new creators
        navigate('/onboarding');
      } else {
        // Feed for listeners
        navigate('/feed');
      }
    } catch (error) {
      console.error('Error routing user:', error);
      navigate('/feed');
    }
  };

  return <Loading fullScreen />;
};

export default DashboardRouter;
