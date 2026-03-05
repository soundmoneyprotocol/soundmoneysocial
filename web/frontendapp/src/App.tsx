import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";
import FeedPage from "./pages/FeedPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CommunityPage from "./pages/CommunityPage";

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
  "/community": {
    title: "Community - SoundMoney Social",
    description: "Discover amazing creators and join the SoundMoney movement",
  },
};

function AppContent() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

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

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/community" element={<CommunityPage />} />
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
