import React from "react";
import { Link } from "react-router-dom";
import { 
  FaGraduationCap, 
  FaUsers, 
  FaBookOpen, 
  FaTrophy, 
  FaClock, 
  FaRocket,
  FaCheckCircle,
  FaArrowRight
} from "react-icons/fa";

const Blog: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 to-teal-500 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            📚 Advanced Placement Program
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Unlock Your Academic <span className="text-yellow-300">Potential</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Prepare for college success with the world's most recognized academic program
          </p>
        </div>
      </section>

      {/* Section 1: What is AP Program */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full">
                <FaBookOpen className="w-4 h-4" />
                <span className="text-sm font-semibold">Section 1</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                What is the <span className="text-teal-600">AP Program</span>?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Advanced Placement (AP) is a program organized by the College Board that offers courses and exams equivalent to college coursework, allowing students to familiarize themselves with and deepen their college credits right from high school.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Established in the 1950s, the AP program helps high school students experience and get acquainted with the university learning environment right from the time they are in school. The AP program offers <strong className="text-teal-600">38 courses</strong> in <strong className="text-teal-600">7 areas</strong>: Arts, Science, English, History, Math, Computer Science, and Languages.
              </p>
              <p className="text-gray-600 leading-relaxed">
                The AP exam is usually held in May each year. Students participating in the AP program will learn according to the curriculum and assessment standards of the undergraduate level. A good AP exam result will prove your student's academic ability, thereby helping you increase your chances of getting admitted and receiving scholarships from universities in the future.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <FaUsers className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Join Our Community</h3>
                    <p className="text-white/80 text-sm">Connect with peers worldwide</p>
                  </div>
                </div>
                <p className="text-white/90 mb-6">
                  Connect with peers and student ambassadors to hear real experiences, tips, and advice about studying abroad.
                </p>
                <Link to="/community" className="w-full bg-white text-teal-600 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  Explore Community <FaArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-400 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Who is AP for */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-4">
              <FaGraduationCap className="w-4 h-4" />
              <span className="text-sm font-semibold">Section 2</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Who is the <span className="text-teal-600">AP Program</span> for?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              The Advanced Placement certificate is for secondary school students from grades 10 to 12, suitable for those who want to try their hand at the university education program and orient themselves to a suitable field of study early.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <FaRocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Passionate Learners</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                High school students who have the desire to participate in intensive learning and pursue their passion for their favorite major.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <FaTrophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Competitive Applicants</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Students who need to be admitted to universities, graduate schools, and highly competitive scholarship programs.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                <FaClock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Early Graduates</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Students who want to complete their undergraduate program early. AP programs can help you complete some college credits in advance.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/materials" className="bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold px-8 py-4 rounded-full hover:shadow-lg transition-all transform hover:-translate-y-1 inline-flex items-center gap-2">
              Register Now <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Why Study AP */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-4">
              <FaTrophy className="w-4 h-4" />
              <span className="text-sm font-semibold">Section 3</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Study <span className="text-teal-600">AP Programs</span>?
            </h2>
          </div>

          <div className="space-y-8">
            {/* Benefit 1 */}
            <div className="bg-gradient-to-r from-teal-50 to-white rounded-2xl p-8 border border-teal-100 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaTrophy className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Increase Your Competitive Advantage in University Admission
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    AP certificates are recognized by most schools, giving you a competitive advantage in the college admissions process. A good AP exam result will demonstrate a student's ability to acquire knowledge at the university level, increase your chances of admission, and help you win valuable scholarships.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                    <FaCheckCircle className="w-4 h-4" />
                    31% of U.S. schools prioritize AP certification for scholarships
                  </div>
                </div>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-gradient-to-r from-purple-50 to-white rounded-2xl p-8 border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaClock className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Save Costs and Time
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    An AP certificate can help exempt you from taking some credits or basic college courses, which in turn will make you more likely to graduate sooner. Graduating early also helps to significantly save on study and living costs.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                    <FaCheckCircle className="w-4 h-4" />
                    Higher on-time graduation rate for AP students
                  </div>
                </div>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-gradient-to-r from-orange-50 to-white rounded-2xl p-8 border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaRocket className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Helping Students Adapt to the University Environment Early
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Advanced Placement helps students have early access to higher education, thereby preparing them well for future journeys and even increasing opportunities for career development. When studying the AP program, students will have a clearer view of the field of study and the study program, orienting their passion from an early age.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                    <FaCheckCircle className="w-4 h-4" />
                    Develop research, analysis, and problem-solving skills
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
