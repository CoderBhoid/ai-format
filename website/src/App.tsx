import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Benefits from "./components/Benefits";
import DecayTimeline from "./components/DecayTimeline";
import Procedures from "./components/Procedures";
import DocPortal from "./components/DocPortal";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="relative min-h-screen bg-army text-neutral-100">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Benefits />
        <DecayTimeline />
        <Procedures />
        <DocPortal />
      </main>
      <Footer />
    </div>
  );
}
