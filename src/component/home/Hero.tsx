const Hero : React.FC = () => {
  return (
    <section className="w-full bg-gray-200">
      <div className="max-w-[1440px] mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
        {/* Left content */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center bg-white rounded-full px-4 py-1 w-fit">
            <span className="text-sm text-gray-700">Welcome to Online Education</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-snug">
            Start learning from the world’s{" "}
            <span className="text-teal-700 font-normal">best institutions</span>
          </h1>

          <div className="flex items-center gap-4">
            <button className="bg-teal-500 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-600">
              Get Started
            </button>
            <button className="flex items-center gap-2 text-black font-medium">
              <span className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow">
                ▶
              </span>
              Watch the video
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Avatars */}
            <div className="flex -space-x-3">
              <img src="https://placehold.co/55x55" className="w-12 h-12 rounded-full border-2 border-white" />
              <img src="https://placehold.co/55x55" className="w-12 h-12 rounded-full border-2 border-white" />
              <img src="https://placehold.co/55x55" className="w-12 h-12 rounded-full border-2 border-white" />
              <img src="https://placehold.co/55x55" className="w-12 h-12 rounded-full border-2 border-white" />
            </div>
            <span className="text-gray-800">10k Enrolment</span>
          </div>

          <p className="text-2xl font-bold">
            Explore <span className="text-teal-700">1350+</span> Courses within Subject
          </p>
        </div>

        {/* Right image */}
        <div className="flex-1 relative flex justify-center">
          <img
            src="https://placehold.co/464x550"
            className="rounded-[40px] shadow-lg"
          />
          <div className="absolute bottom-10 right-10 bg-white p-4 rounded-lg shadow">
            <p className="text-teal-700 text-2xl font-bold">256+</p>
            <p className="text-gray-700 text-sm font-semibold">CRASHED COURSES</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
