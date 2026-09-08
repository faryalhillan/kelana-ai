"use client";

import { useState, useEffect, useRef } from "react";
import { COUNTRIES, type Country } from "@/lib/countries";

type CountrySelectProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export default function CountrySelect({ value, onChange, required = false }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find((c) => c.name === value);

  const handleSelect = (countryName: string) => {
    onChange(countryName);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="country-select-wrapper" ref={dropdownRef}>
      <div className="country-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        {selectedCountry ? (
          <div className="selected-country">
            <span className="country-code-badge">{selectedCountry.code}</span>
            <span>{selectedCountry.name}</span>
          </div>
        ) : (
          <span className="placeholder">Select a country{required ? " *" : ""}</span>
        )}
        <svg
          className={`dropdown-icon ${isOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="country-dropdown">
          <div className="country-search">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="country-search-input"
              autoFocus
            />
          </div>
          <div className="country-list">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <div
                  key={country.code}
                  className={`country-item ${value === country.name ? "selected" : ""}`}
                  onClick={() => handleSelect(country.name)}
                >
                  <span className="country-code-badge">{country.code}</span>
                  <span>{country.name}</span>
                  {value === country.name && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="check-icon">
                      <path
                        d="M13 4L6 11L3 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              ))
            ) : (
              <div className="country-item no-results">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
