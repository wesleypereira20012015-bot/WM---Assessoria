import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Hero from "@/components/sections/Hero";
import ProofBar from "@/components/sections/ProofBar";
import HowItWorks from "@/components/sections/HowItWorks";
import Services from "@/components/sections/Services";
import CalculatorSection from "@/components/sections/CalculatorSection";
import Results from "@/components/sections/Results";
import Risks from "@/components/sections/Risks";
import About from "@/components/sections/About";
import FAQ from "@/components/sections/FAQ";
import CTABand from "@/components/ui/CTABand";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProofBar />
        <HowItWorks />
        <Services />
        <CalculatorSection />
        <Results />
        <Risks />
        <About />
        <FAQ />
        <CTABand />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
