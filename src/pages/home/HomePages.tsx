import React from 'react'
import AboutSection from '~/components/home/AboutSection';
import ExamsSection from '~/components/home/ExamsSection';
import ExamsTrendingSection from '~/components/home/ExamsTrendingSection';
import FeaturedMaterials from '~/components/home/FeaturedMaterials';
import Hero from '~/components/home/Hero';
import InstructorSection from '~/components/home/InstructorSection';
import LanguageNewsletter from '~/components/home/LanguageNewsletter';
import NewsletterSection from '~/components/home/NewsletterSection';
import StatsSection from '~/components/home/StatsSection';


const HomePages : React.FC  = () => {
  return (
    <div> 
      <Hero />
      <AboutSection/>
      <FeaturedMaterials/>
      <StatsSection/>
      <InstructorSection/>
      <ExamsSection/>
      <ExamsTrendingSection/>
      <NewsletterSection/>
      <LanguageNewsletter/>
    </div>
  )
}

export default HomePages;
