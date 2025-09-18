import React from 'react'
import AboutSection from '~/component/home/AboutSection';
import ExamsSection from '~/component/home/ExamsSection';
import ExamsTrendingSection from '~/component/home/ExamsTrendingSection';
import FeaturedMaterials from '~/component/home/FeaturedMaterials';
import Hero from '~/component/home/Hero';
import InstructorSection from '~/component/home/InstructorSection';
import LanguageNewsletter from '~/component/home/LanguageNewsletter';
import NewsletterSection from '~/component/home/NewsletterSection';
import StatsSection from '~/component/home/StatsSection';


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
