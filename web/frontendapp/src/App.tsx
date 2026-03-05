import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import SolarahPodcasts from "./pages/SolarahPodcasts";
import Dashboard from "./pages/Dashboard";

// Page metadata
const pageMetadata: { [key: string]: { title: string; description: string } } = {
  "/": {
    title: "SoundMoney Social - Share Music, Earn Rewards",
    description: "Connect with artists and earn BEZY tokens by sharing and engaging with music on SoundMoney Social",
  },
  "/dashboard": {
    title: "Dashboard - SoundMoney Social",
    description: "View your profile, earnings, and engagement metrics",
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
    <Routes>
      <Route path="/" element={<SolarahPodcasts />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
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
