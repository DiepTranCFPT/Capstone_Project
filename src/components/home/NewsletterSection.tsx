import React from "react";

const NewsletterSection: React.FC = () => {
  return (
    <div className="w-full bg-emerald-950 py-16 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 relative z-10">
        {/* Left image */}
        <div className="flex-1 flex justify-center">
          <img
            src="https://placehold.co/633x465"
            alt="course"
            className="rounded-xl shadow-lg"
          />
        </div>

        {/* Right content */}
        <div className="flex-1 text-white">
          {/* badge */}
          <div className="flex items-center gap-2 bg-white text-black border border-black/20 rounded-full px-4 py-2 w-fit mb-4">
            <div className="w-7 h-7 bg-slate-300/60 rounded-full flex items-center justify-center">
              <img
                src="https://placehold.co/24x25"
                alt="icon"
                className="w-5 h-5"
              />
            </div>
            <span className="text-sm">Subscribe Newsletter</span>
          </div>

          {/* heading */}
          <h2 className="text-3xl font-bold mb-4">
            Find Your Best Course With Us
          </h2>

          {/* description */}
          <p className="text-zinc-400 mb-6">
            Quality technologies via fully tested methods of empowerment.
            Proactively disseminate web enabled best practices after cross
            functional expertise.
          </p>

          {/* form */}
          <form className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Course Name"
              className="flex-1 px-4 py-3 rounded-full border border-zinc-300 bg-transparent text-white placeholder-zinc-400 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="flex-1 px-4 py-3 rounded-full border border-zinc-300 bg-transparent text-white placeholder-zinc-400 focus:outline-none"
            />
          </form>

          <button className="bg-teal-400 hover:bg-teal-500 transition text-white font-bold px-6 py-3 rounded-full text-sm">
            Subscribe Now
          </button>
        </div>
      </div>

      {/* decorations */}
      <img
        src="https://placehold.co/142x129"
        alt="decoration"
        className="absolute top-8 right-12 w-36 h-32 opacity-80"
      />
      <div className="absolute bottom-6 right-8 w-11 h-11 bg-teal-400 rounded-md flex items-center justify-center">
        <span className="text-white text-lg">↑</span>
      </div>
    </div>
  );
};

export default NewsletterSection;
