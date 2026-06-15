import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import ReactionTime from '@/pages/ReactionTime';
import NumberMemory from '@/pages/NumberMemory';
import TypingSpeed from '@/pages/TypingSpeed';
import AimTrainer from '@/pages/AimTrainer';
import ChimpTest from '@/pages/ChimpTest';
import ColorVision from '@/pages/ColorVision';
import SequenceMemory from '@/pages/SequenceMemory';
import StroopTest from '@/pages/StroopTest';
import MathSpeed from '@/pages/MathSpeed';
import AchievementCelebration from '@/components/AchievementCelebration';
import { useScoreStore } from '@/store/useScoreStore';

function AchievementWatcher() {
  const newlyUnlocked = useScoreStore((s) => s.newlyUnlockedAchievements);
  const clearNewly = useScoreStore((s) => s.clearNewlyUnlocked);
  const [celebrateIds, setCelebrateIds] = useState<string[]>([]);
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if (newlyUnlocked.length === 0) return;
    if (!showing) {
      setCelebrateIds(newlyUnlocked);
      setShowing(true);
      clearNewly();
    } else {
      setCelebrateIds((prev) => {
        const combined = [...prev];
        for (const id of newlyUnlocked) {
          if (!combined.includes(id)) combined.push(id);
        }
        return combined;
      });
      clearNewly();
    }
  }, [newlyUnlocked, showing, clearNewly]);

  if (!showing || celebrateIds.length === 0) return null;

  return (
    <AchievementCelebration
      achievementIds={celebrateIds}
      onClose={() => {
        setCelebrateIds([]);
        setShowing(false);
      }}
    />
  );
}

function RoutesWithWatcher() {
  const location = useLocation();
  return (
    <>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reaction" element={<ReactionTime />} />
        <Route path="/number-memory" element={<NumberMemory />} />
        <Route path="/typing" element={<TypingSpeed />} />
        <Route path="/aim" element={<AimTrainer />} />
        <Route path="/chimp" element={<ChimpTest />} />
        <Route path="/color-vision" element={<ColorVision />} />
        <Route path="/sequence-memory" element={<SequenceMemory />} />
        <Route path="/stroop" element={<StroopTest />} />
        <Route path="/math-speed" element={<MathSpeed />} />
      </Routes>
      <AchievementWatcher />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <RoutesWithWatcher />
    </Router>
  );
}
