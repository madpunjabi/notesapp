import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  // Validate parameters
  if (!lat || !lon) {
    return Response.json(
      { error: 'Missing required parameters: lat and lon' },
      { status: 400 }
    );
  }

  // Validate coordinates are valid numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return Response.json(
      { error: 'Invalid coordinates' },
      { status: 400 }
    );
  }

  // Get API key from environment
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    console.error('WEATHER_API_KEY not found in environment variables');
    return Response.json(
      { error: 'Weather service configuration error' },
      { status: 500 }
    );
  }

  try {
    // Fetch from WeatherAPI.com
    const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`;

    const response = await fetch(weatherUrl, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WeatherAPI error:', response.status, errorText);

      if (response.status === 401) {
        return Response.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      if (response.status === 429) {
        return Response.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }

      return Response.json(
        { error: 'Failed to fetch weather data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the weather data
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Weather API fetch error:', error);
    return Response.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
