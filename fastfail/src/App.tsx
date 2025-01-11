import { useState, useEffect } from "react";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: { description: string }[];
  wind: { speed: number };
  timezone: number; // Поле для временной зоны
}

function Clock() {
  const [date, setDate] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState("Москва");
  const [error, setError] = useState<string | null>(null);

  const API_KEY = "56f4776b143990bd48020567fcc09dcb";

  const tick = () => {
    setDate(new Date());
  };

  const fetchWeather = async () => {
    try {
      setError(null);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ru`
      );
      if (!response.ok) {
        throw new Error(
          `Ошибка загрузки данных о погоде: ${response.status} ${response.statusText}`
        );
      }
      const data: WeatherData = await response.json();
      setWeather(data);
    } catch (error: any) {
      setError(error.message || "Неизвестная ошибка");
      setWeather(null);
    }
  };

  const getLocalTime = () => {
    if (!weather) return date; // Если данных о погоде нет, возвращаем локальное время
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000; // UTC-время
    return new Date(utcTime + weather.timezone * 1000); // Локальное время в городе
  };

  const getGreeting = () => {
    const localTime = getLocalTime();
    const hours = localTime.getHours();

    if (hours >= 5 && hours < 12) {
      return "Доброе утро!";
    } else if (hours >= 12 && hours < 18) {
      return "Добрый день!";
    } else if (hours >= 18 && hours < 22) {
      return "Добрый вечер!";
    } else {
      return "Доброй ночи!";
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (city) fetchWeather();
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [city]);

  useEffect(() => {
    const timerID = setInterval(tick, 1000);
    return () => clearInterval(timerID);
  }, []);

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        color: "#fbc02d",
        background: "#282c34",
      }}
    >
      <div className="container">
        <h1>{getGreeting()}</h1>
        <h2>Время в {city}: {getLocalTime().toLocaleTimeString()}</h2>
        {error ? (
          <p style={{ color: "red" }}>Ошибка: {error}</p>
        ) : weather ? (
          <div style={{ marginTop: "20px" }}>
            <h3>Погода в {weather.name}</h3>
            <p>
              Температура: {weather.main.temp}°C, {weather.weather[0].description}
            </p>
            <p>Влажность: {weather.main.humidity}%</p>
            <p>Скорость ветра: {weather.wind.speed} м/с</p>
          </div>
        ) : (
          <p>Загрузка погоды...</p>
        )}
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Введите город"
          style={{
            marginTop: "20px",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #fbc02d",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

export default Clock;
