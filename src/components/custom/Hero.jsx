import React from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-20 bg-[#0d1117] text-white">
      {/* Heading */}
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-blue-400 drop-shadow-lg">
        Your Journey Starts with <span className="text-white">NextTrip.AI</span>
      </h1>

      {/* Subheading */}
      <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-400">
        Smart, personalized travel plans powered by AI — tailored to your budget, time, and vibe. Plan less, explore more.
      </p>

      {/* CTA Button */}
      <Link to="/create-trip" className="mt-8">
        <Button className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-md transition-all">
          Start Planning Now
        </Button>
      </Link>

      {/* Hero Image */}
      <img
        src="/Bg_image.jpg"
        alt="Travel Planner"
        className="mt-14 max-w-[700px] w-full rounded-xl shadow-lg border border-gray-700"
      />
    </section>
  );
}

export default Hero;
