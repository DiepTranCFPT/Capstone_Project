import React, { useState } from 'react';
import ChatBot from '~/components/home/ChatBot';
import AboutSection from '~/components/home/AboutSection';
import ExamsSection from '~/components/home/ExamsSection';
import ExamsTrendingSection from '~/components/home/ExamsTrendingSection';
import FeaturedMaterials from '~/components/home/FeaturedMaterials';
import Hero from '~/components/home/Hero';
import InstructorSection from '~/components/home/InstructorSection';
import LanguageNewsletter from '~/components/home/LanguageNewsletter';
import NewsletterSection from '~/components/home/NewsletterSection';
import StatsSection from '~/components/home/StatsSection';


const HomePages: React.FC = () => {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  return (
    <div>
      <Hero />
      <AboutSection />
      <FeaturedMaterials/>
      <StatsSection/>
      <InstructorSection/>
      <ExamsSection/>
      <ExamsTrendingSection />
      <NewsletterSection />
      <LanguageNewsletter />
      <button
        onClick={() => setIsChatBotOpen(!isChatBotOpen)}
        className="fixed bottom-4 right-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 animate-pulse"
        title="Chat with EduBot"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.05 1.05 4.42L2 22l5.58-1.05C9.95 21.64 11.46 22 13 22h7c1.1 0 2-.9 2-2V12c0-5.52-4.48-10-10-10z"/>
        </svg>
      </button>
      {isChatBotOpen && <ChatBot isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} />}
    </div>
  );
};

export default HomePages;
