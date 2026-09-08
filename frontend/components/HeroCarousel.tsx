"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const destinations = [
  {
    name: "New York",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=2400&q=85",
    description: "The city that never sleeps"
  },
  {
    name: "Tokyo",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2400&q=85",
    description: "Where tradition meets future"
  },
  {
    name: "Bali",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2400&q=85",
    description: "Island paradise awaits"
  },
  {
    name: "Paris",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2400&q=85",
    description: "The city of lights and love"
  },
  {
    name: "Dubai",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=85",
    description: "Luxury in the desert"
  }
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + destinations.length) % destinations.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % destinations.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="hero-carousel">
      <div className="carousel-container">
        {destinations.map((destination, index) => (
          <div
            key={destination.name}
            className={`carousel-slide ${index === currentIndex ? "active" : ""} ${
              index === (currentIndex - 1 + destinations.length) % destinations.length ? "previous" : ""
            } ${index === (currentIndex + 1) % destinations.length ? "next" : ""}`}
          >
            <Image
              src={destination.image}
              alt={`${destination.name} - ${destination.description}`}
              fill
              className="carousel-image"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            <div className="carousel-overlay" />
            <div className="carousel-content">
              <span className="carousel-location">{destination.name}</span>
              <p className="carousel-description">{destination.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="carousel-nav carousel-nav-left"
        aria-label="Previous destination"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goToNext}
        className="carousel-nav carousel-nav-right"
        aria-label="Next destination"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {destinations.map((destination, index) => (
          <button
            key={destination.name}
            onClick={() => goToSlide(index)}
            className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
            aria-label={`Go to ${destination.name}`}
          />
        ))}
      </div>
    </div>
  );
}
