import { useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { useArabicFont } from "./hooks/useArabicFont";
import NavBar from "./components/NavBar";
import ThemeToggle from "./components/ThemeToggle";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import Quran from "./pages/Quran";
import Qibla from "./pages/Qibla";
import Dhikr from "./pages/Dhikr";
import HijriCalendar from "./pages/HijriCalendar";
import Sira from "./pages/Sira";
import "./App.css";

const PAGES = {
  home: Home,
  quran: Quran,
  qibla: Qibla,
  dhikr: Dhikr,
  hijri: HijriCalendar,
  sira: Sira,
};

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
    <>
      <div className="app-topbar">
        <ThemeToggle preference={preference} onChange={setTheme} />
      </div>
      <main>
        <ActivePage />
      </main>
      <NavBar active={active} onChange={setActive} />
    </>
  );
}
