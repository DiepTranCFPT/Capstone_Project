import React from 'react'

const Section: React.FC = () => {
    return (
        <section className="bg-white py-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500 opacity-10 rounded-full -translate-y-1/4 translate-x-1/4"></div>
            <div className="absolute top-8 right-8 w-32 h-32 border-4 border-teal-200 rounded-full"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-800">Exam Test</h1>
                <p className="text-gray-500 mt-2">Home / Exam Test / <span className="text-teal-500 font-semibold">Explore</span></p>
            </div>
        </section>
    )
}

export default Section