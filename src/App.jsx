import { useState, Suspense, lazy } from "react";
import { useTheme } from "./hooks/useTheme";
import { useArabicFont } from "./hooks/useArabicFont";
import { PremiumProvider } from "./context/PremiumContext";
import NavBar from "./components/NavBar";
import ThemeToggle from "./components/ThemeToggle";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import "./App.css";

// Code splitting : Home reste chargé immédiatement (première page vue),
// les autres pages sont chargées à la demande pour réduire le poids du
// bundle initial — utile sur réseau mobile plus lent.
const Quran = lazy(() => import("./pages/Quran"));
const Qibla = lazy(() => import("./pages/Qibla"));
const Dhikr = lazy(() => import("./pages/Dhikr"));
const HijriCalendar = lazy(() => import("./pages/HijriCalendar"));
const Sira = lazy(() => import("./pages/Sira"));

const PAGES = {
  home: Home,
  quran: Quran,
  qibla: Qibla,
  dhikr: Dhikr,
  hijri: HijriCalendar,
  sira: Sira,
};

function PageLoading() {
  return <p style={{ textAlign: "center", color: "var(--sand-dim)", padding: "48px 0", fontFamily: "var(--font-body)" }}>Chargement…</p>;
}

export default function App() {
  const [active, setActive] = useState("home");
  const [showSplash, setShowSplash] = useState(true);
  const { preference, setTheme } = useTheme();
  useArabicFont(); // applique --font-arabic globalement dès le montage
  const ActivePage = PAGES[active];

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <PremiumProvider>
      <div className="app-topbar">
        <ThemeToggle preference={preference} onChange={setTheme} />
      </div>
      <main>
        <Suspense fallback={<PageLoading />}>
          <ActivePage />
        </Suspense>
      </main>
      <NavBar active={active} onChange={setActive} />
    </PremiumProvider>
  );
}
