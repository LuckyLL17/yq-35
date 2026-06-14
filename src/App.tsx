import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ReactionTime from "@/pages/ReactionTime";
import NumberMemory from "@/pages/NumberMemory";
import TypingSpeed from "@/pages/TypingSpeed";
import AimTrainer from "@/pages/AimTrainer";
import ChimpTest from "@/pages/ChimpTest";
import ColorVision from "@/pages/ColorVision";
import SequenceMemory from "@/pages/SequenceMemory";
import StroopTest from "@/pages/StroopTest";
import MathSpeed from "@/pages/MathSpeed";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
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
    </Router>
  );
}
