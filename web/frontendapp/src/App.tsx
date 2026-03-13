import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";
import { Loading } from "./components";
import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CommunityPage from "./pages/CommunityPage";
import YouTubeMusicPortalPage from "./pages/YouTubeMusicPortalPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import PayoutsPage from "./pages/PayoutsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ReferralsPage from "./pages/ReferralsPage";
import TicketsPage from "./pages/TicketsPage";
import TeamPage from "./pages/TeamPage";

// Page metadata
const pageMetadata: { [key: string]: { title: string; description: string } } = {
  "/": {
    title: "Social Feed - SoundMoney",
    description: "Connect with artists and earn BEZY tokens by sharing and engaging with music",
  },
  "/dashboard": {
    title: "Dashboard - SoundMoney Social",
    description: "View your profile, earnings, and engagement metrics",
  },
  "/analytics": {
    title: "Analytics - SoundMoney Social",
    description: "Track your performance and engagement analytics",
  },
  "/music-portal": {
    title: "Music Portal - SoundMoney",
    description: "Manage your streaming track catalog and view earnings",
  },
  "/community": {
    title: "Community - SoundMoney Social",
    description: "Discover amazing creators and join the SoundMoney movement",
  },
  "/team": {
    title: "Team Management - SoundMoney",
    description: "Manage your team and connect AI-powered analytics integrations",
  },
};

function AppContent() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;
  const { isLoading, isAuthenticated } = useAuth();

  // Scroll to top on route change
  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  // Update document title and meta description
  useEffect(() => {
    const metadata = pageMetadata[pathname] || {
      title: "SoundMoney Social",
      description: "Social platform for music creators and fans",
    };

    document.title = metadata.title;

    const metaDescriptionTag: HTMLMetaElement | null = document.querySelector(
      'head > meta[name="description"]'
    );
    if (metaDescriptionTag) {
      metaDescriptionTag.content = metadata.description;
    }
  }, [pathname]);

  // Show loading while checking auth
  if (isLoading) {
    return <Loading fullScreen />;
  }

  // Redirect to auth if not authenticated and trying to access protected route
  const isProtectedRoute = pathname !== "/auth" && !isAuthenticated;
  if (isProtectedRoute) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      {isAuthenticated && <Navigation />}
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<FeedPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/music-portal" element={<YouTubeMusicPortalPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/payouts" element={<PayoutsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
