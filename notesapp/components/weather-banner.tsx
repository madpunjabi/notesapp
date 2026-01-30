'use client';

import { useEffect, useState } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  LucideIcon
} from 'lucide-react';
import { WeatherData } from '@/types/weather';
import { getWeather, getWeatherStyle } from '@/lib/weather-utils';
import { cn } from '@/lib/utils';

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudRain,
  CloudRainWind,
};

export function WeatherBanner() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadWeather() {
      try {
        const data = await getWeather();
        setWeather(data);
        setError(false);
      } catch (err) {
        console.error('Failed to load weather:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse h-14 mb-4" />
    );
  }

  // Error state or no weather - fail silently
  if (error || !weather) {
    return null;
  }

  const weatherStyle = getWeatherStyle(weather.current.condition.code);
  const IconComponent = iconMap[weatherStyle.icon] || Cloud;

  return (
    <div className="relative overflow-hidden rounded-lg mb-4 p-3 animate-in fade-in duration-500 opacity-90 hover:opacity-100 transition-opacity">
      {/* Dynamic gradient background - more subtle */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br transition-colors duration-500 opacity-40',
          weatherStyle.gradient,
          weatherStyle.darkGradient
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          {/* Left side: Weather info */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Weather icon */}
            <div className="flex-shrink-0">
              <IconComponent
                className="w-6 h-6 md:w-7 md:h-7 text-gray-700 dark:text-gray-200"
                strokeWidth={1.5}
              />
            </div>

            {/* Temperature & condition */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                {Math.round(weather.current.temp_f)}°F
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                {weather.current.condition.text}
              </div>
              <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                • {weather.location.name}
              </div>
            </div>
          </div>

          {/* Right side: Extra details */}
          <div className="flex gap-3 md:gap-4 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span>💧</span>
              <span>{weather.current.humidity}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span>💨</span>
              <span className="hidden sm:inline">{Math.round(weather.current.wind_mph)} mph</span>
              <span className="sm:hidden">{Math.round(weather.current.wind_mph)}</span>
            </span>
          </div>
        </div>

        {/* Motivational tagline */}
        <div className="mt-1 text-xs italic text-gray-600 dark:text-gray-400">
          {weatherStyle.tagline}
        </div>
      </div>
    </div>
  );
}
