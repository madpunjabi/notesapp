export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_f: number;
    temp_c: number;
    condition: {
      text: string;
      code: number;
      icon: string;
    };
    humidity: number;
    wind_mph: number;
    feelslike_f: number;
    feelslike_c: number;
  };
}

export interface WeatherConditionStyle {
  icon: string; // Lucide icon name
  gradient: string; // Tailwind gradient classes
  darkGradient: string; // Dark mode gradient classes
  tagline: string;
}

export interface CachedWeather {
  data: WeatherData;
  timestamp: number;
  location: { lat: number; lon: number };
}

export interface Coordinates {
  lat: number;
  lon: number;
}
