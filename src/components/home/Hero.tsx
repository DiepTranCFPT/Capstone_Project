const Hero : React.FC = () => {
  return (
    <section className="w-full bg-[#E0E9E7]">
      <div className="max-w-[1440px] mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
        {/* Left content */}
        <div className="flex-1 space-y-6 hero-fade" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center bg-white rounded-full px-4 py-1 w-fit">
            <span className="text-sm text-gray-700">Welcome to Online Education</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-snug">
           Master AP Subjects with Premium’s{" "}
            <span className="text-teal-700 font-normal">Curated Learning Resources.</span>
          </h1>

          <div className="flex items-center gap-4">
            <button className="bg-teal-500 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-600 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              Get Started
            </button>
          </div>

          <p className="text-2xl font-bold">
            Explore <span className="text-teal-700">20+</span> Courses within Subject
          </p>
        </div>

        {/* Right image */}
        <div className="flex-1 relative flex justify-center hero-float">
          <img
            src="https://img.freepik.com/free-photo/digital-nomad-portrait-young-woman-using-laptop-park-sitting-bench-working-studying-online_116547-30730.jpg"
            alt="Nữ sinh viên đang học với laptop ngoài công viên"
            className="rounded-[40px] shadow-lg object-cover"
          />
          <div className="absolute bottom-10 right-10 bg-white p-4 rounded-lg shadow">
            <p className="text-teal-700 text-2xl font-bold">5+</p>
            <p className="text-gray-700 text-sm font-semibold">CRASHED COURSES</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
