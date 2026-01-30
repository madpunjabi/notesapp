import { WeatherData, WeatherConditionStyle, CachedWeather, Coordinates } from '@/types/weather';

const CACHE_KEY = 'weather-cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds
const LOCATION_THRESHOLD = 10; // km - invalidate cache if moved more than this

/**
 * Weather condition code mapping to icons, gradients, and taglines
 * Based on WeatherAPI.com condition codes
 */
export const weatherConditions: Record<number, WeatherConditionStyle> = {
  // Sunny/Clear
  1000: {
    icon: 'Sun',
    gradient: 'from-amber-200 via-orange-200 to-peach-200',
    darkGradient: 'dark:from-amber-900 dark:via-orange-900 dark:to-peach-900',
    tagline: 'Perfect weather to tackle your tasks!',
  },
  // Partly cloudy
  1003: {
    icon: 'CloudSun',
    gradient: 'from-blue-100 via-sky-100 to-peach-100',
    darkGradient: 'dark:from-blue-900 dark:via-sky-900 dark:to-peach-900',
    tagline: 'A great day to make progress!',
  },
  // Cloudy
  1006: {
    icon: 'Cloud',
    gradient: 'from-gray-200 via-slate-200 to-gray-300',
    darkGradient: 'dark:from-gray-800 dark:via-slate-800 dark:to-gray-900',
    tagline: 'Cozy weather for focused work!',
  },
  // Overcast
  1009: {
    icon: 'Cloud',
    gradient: 'from-gray-300 via-slate-300 to-gray-400',
    darkGradient: 'dark:from-gray-800 dark:via-slate-800 dark:to-gray-900',
    tagline: 'Stay focused and push through!',
  },
  // Mist
  1030: {
    icon: 'CloudFog',
    gradient: 'from-gray-300 via-slate-300 to-blue-200',
    darkGradient: 'dark:from-gray-800 dark:via-slate-800 dark:to-blue-900',
    tagline: 'A calm, misty day for deep work!',
  },
  // Patchy rain possible / Light drizzle
  1063: {
    icon: 'CloudDrizzle',
    gradient: 'from-blue-300 via-slate-300 to-gray-400',
    darkGradient: 'dark:from-blue-900 dark:via-slate-900 dark:to-gray-950',
    tagline: 'Perfect day to stay in and get things done!',
  },
  // Patchy snow possible
  1066: {
    icon: 'CloudSnow',
    gradient: 'from-blue-50 via-cyan-100 to-blue-200',
    darkGradient: 'dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900',
    tagline: 'Stay warm and check off those tasks!',
  },
  // Thundery outbreaks possible
  1087: {
    icon: 'CloudLightning',
    gradient: 'from-purple-400 via-slate-500 to-gray-700',
    darkGradient: 'dark:from-purple-900 dark:via-slate-950 dark:to-gray-950',
    tagline: 'Channel that storm energy into your tasks!',
  },
  // Light rain
  1183: {
    icon: 'CloudRain',
    gradient: 'from-blue-400 via-slate-400 to-gray-500',
    darkGradient: 'dark:from-blue-900 dark:via-slate-900 dark:to-gray-950',
    tagline: 'Rainy day productivity mode!',
  },
  // Moderate or heavy rain
  1195: {
    icon: 'CloudRainWind',
    gradient: 'from-blue-500 via-slate-500 to-gray-600',
    darkGradient: 'dark:from-blue-900 dark:via-slate-950 dark:to-gray-950',
    tagline: 'Weather outside is frightful, productivity is delightful!',
  },
};

/**
 * Get weather condition style by code
 * Falls back to cloudy if code not found
 */
export function getWeatherStyle(code: number): WeatherConditionStyle {
  return weatherConditions[code] || weatherConditions[1006]; // Default to cloudy
}

/**
 * Get user's current location using browser Geolocation API
 */
export async function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Get approximate location by IP address (fallback)
 */
export async function getLocationByIP(): Promise<Coordinates> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch location by IP');
    }
    const data = await response.json();
    return {
      lat: data.latitude,
      lon: data.longitude,
    };
  } catch (error) {
    console.error('IP location fetch failed:', error);
    // Fallback to San Francisco
    return {
      lat: 37.7749,
      lon: -122.4194,
    };
  }
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get cached weather data if valid
 */
export function getCachedWeather(currentLocation?: Coordinates): WeatherData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cachedData: CachedWeather = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - cachedData.timestamp > CACHE_TTL) {
      return null;
    }

    // Check if location has changed significantly
    if (currentLocation) {
      const distance = calculateDistance(
        cachedData.location.lat,
        cachedData.location.lon,
        currentLocation.lat,
        currentLocation.lon
      );

      if (distance > LOCATION_THRESHOLD) {
        return null;
      }
    }

    return cachedData.data;
  } catch (error) {
    console.error('Error reading weather cache:', error);
    return null;
  }
}

/**
 * Cache weather data
 */
export function setCachedWeather(data: WeatherData, location: Coordinates): void {
  try {
    const cacheData: CachedWeather = {
      data,
      timestamp: Date.now(),
      location,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching weather data:', error);
    // Fail silently - caching is not critical
  }
}

/**
 * Fetch weather data from our API route
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to fetch weather');
  }

  return response.json();
}

/**
 * Get weather data with caching and location detection
 */
export async function getWeather(): Promise<WeatherData> {
  let location: Coordinates;

  // Try to get user's location
  try {
    location = await getUserLocation();
  } catch (error) {
    console.log('Geolocation denied or unavailable, using IP location');
    location = await getLocationByIP();
  }

  // Check cache first
  const cached = getCachedWeather(location);
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const weatherData = await fetchWeather(location.lat, location.lon);

  // Cache the result
  setCachedWeather(weatherData, location);

  return weatherData;
}
