import React, { useEffect } from 'react';
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
import { useOngoingExams } from '~/hooks/useOngoingExams';
import { useAuth } from '~/hooks/useAuth';


const HomePages: React.FC = () => {
  const { showOngoingExamToast } = useOngoingExams();
  const { isAuthenticated } = useAuth();

  // Show toast notification for ongoing exams when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        showOngoingExamToast();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, showOngoingExamToast]);

  return (
    <div>
      <Hero />
      <AboutSection />
      <FeaturedMaterials />
      <StatsSection />
      <InstructorSection />
      <ExamsSection />
      <ExamsTrendingSection />
      <NewsletterSection />
      <LanguageNewsletter />

      {/* Floating AI ChatBot */}
      <ChatBot />
    </div>
  );
};

export default HomePages;
