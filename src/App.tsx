import { useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, CloudSnow } from 'lucide-react';

interface WeatherData {
  city: string;
  current: {
    temp: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
  };
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

const WeatherIcon = ({ condition }: { condition: string }) => {
  const lower = condition.toLowerCase();
  if (lower.includes('rain') || lower.includes('drizzle')) {
    return <CloudRain className="w-16 h-16 text-blue-400" />;
  }
  if (lower.includes('cloud')) {
    return <Cloud className="w-16 h-16 text-gray-400" />;
  }
  if (lower.includes('snow')) {
    return <CloudSnow className="w-16 h-16 text-blue-200" />;
  }
  return <Sun className="w-16 h-16 text-yellow-400" />;
};

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Replace YOUR_API_KEY with your OpenWeatherMap API key
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error('City not found');
      }

      const data = await response.json();

      // Process current weather
      const current = {
        temp: Math.round(data.list[0].main.temp),
        feelsLike: Math.round(data.list[0].main.feels_like),
        condition: data.list[0].weather[0].main,
        humidity: data.list[0].main.humidity,
        windSpeed: Math.round(data.list[0].wind.speed * 3.6),
        pressure: data.list[0].main.pressure,
        visibility: Math.round(data.list[0].visibility / 1000),
      };

      // Process 3-day forecast (using noon data for each day)
      const forecast = [];
      const processedDates = new Set();
      
      for (const item of data.list) {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toLocaleDateString();
        
        if (!processedDates.has(dateStr) && date.getHours() === 12) {
          processedDates.add(dateStr);
          forecast.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            condition: item.weather[0].main,
          });
          
          if (forecast.length === 3) break;
        }
      }

      setWeather({
        city: data.city.name,
        current,
        forecast,
      });
    } catch (err) {
      setError('Unable to fetch weather data. Please check the city name and try again.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🌤️ Weather Forecast
        </h1>

        <div className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather(e)}
              placeholder="Enter city name (e.g., London, New York)..."
              className="flex-1 px-4 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {weather && (
          <div className="space-y-6">
            {/* Current Weather Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {weather.city}
              </h2>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <WeatherIcon condition={weather.current.condition} />
                  <div>
                    <div className="text-6xl font-bold text-gray-800">
                      {weather.current.temp}°C
                    </div>
                    <div className="text-xl text-gray-600">
                      {weather.current.condition}
                    </div>
                    <div className="text-gray-500">
                      Feels like {weather.current.feelsLike}°C
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Humidity</div>
                    <div className="font-semibold">{weather.current.humidity}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Wind className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Wind</div>
                    <div className="font-semibold">{weather.current.windSpeed} km/h</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Gauge className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Pressure</div>
                    <div className="font-semibold">{weather.current.pressure} hPa</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Eye className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Visibility</div>
                    <div className="font-semibold">{weather.current.visibility} km</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Day Forecast Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {weather.forecast.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="text-center">
                    <div className="font-semibold text-gray-800 mb-4">
                      {day.date}
                    </div>
                    <div className="flex justify-center mb-4">
                      <WeatherIcon condition={day.condition} />
                    </div>
                    <div className="text-lg text-gray-600 mb-2">
                      {day.condition}
                    </div>
                    <div className="flex justify-center gap-4 text-gray-700">
                      <div>
                        <div className="text-sm text-gray-500">High</div>
                        <div className="text-2xl font-bold">{day.high}°</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Low</div>
                        <div className="text-2xl font-bold">{day.low}°</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!weather && !loading && !error && (
          <div className="text-center text-white text-lg">
            👆 Enter a city name to get started!
          </div>
        )}
      </div>
    </div>
  );
}

export default App;