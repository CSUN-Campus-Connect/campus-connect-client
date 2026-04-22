"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  Box,
  Stack,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";

import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import GrainIcon from "@mui/icons-material/Grain";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import AcUnitIcon from "@mui/icons-material/AcUnit";

import { WidgetHeader } from "./WidgetHeader";

// CSUN coords (Northridge)
const CSUN_COORDS = {
  latitude: 34.2400,
  longitude: -118.5290,
};

type CurrentWeather = {
  temperature: number;
  windSpeed: string;        // e.g. "5 mph" or "5 to 10 mph"
  windDirection: string;    // e.g. "NW"
  humidity: number | null;  // %
  precipProb: number | null; // %
  shortForecast: string;
  startTime: string;
};

type HourlyData = {
  time: string;
  temperature: number;
  precipProb: number | null;
  shortForecast: string;
};

type WeatherState = {
  current: CurrentWeather | null;
  nextHours: HourlyData[];
};

export const WeatherWidget: React.FC<{ onDelete?: () => void }> = ({
  onDelete,
}) => {
  const [weather, setWeather] = React.useState<WeatherState>({
    current: null,
    nextHours: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const weatherIconFromText = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("thunder")) return { label: text, Icon: ThunderstormIcon };
    if (lower.includes("snow") || lower.includes("sleet"))
      return { label: text, Icon: AcUnitIcon };
    if (lower.includes("rain") || lower.includes("shower") || lower.includes("drizzle"))
      return { label: text, Icon: GrainIcon };
    if (lower.includes("cloud") || lower.includes("overcast"))
      return { label: text, Icon: CloudIcon };
    if (lower.includes("sunny") || lower.includes("clear"))
      return { label: text, Icon: WbSunnyIcon };
    return { label: text, Icon: CloudIcon };
  };

  React.useEffect(() => {
    let cancel = false;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) Get NWS gridpoint info for CSUN (need to move to backend in future to avoid CORS issues and hide API )
        const pointsRes = await fetch(
          `https://api.weather.gov/points/${CSUN_COORDS.latitude},${CSUN_COORDS.longitude}`,
          {
            headers: {
              Accept: "application/geo+json",
            },
          }
        );

        if (!pointsRes.ok) {
          throw new Error("Failed to load NWS point metadata");
        }

        const pointsData = await pointsRes.json();
        const hourlyUrl: string | undefined =
          pointsData?.properties?.forecastHourly;

        if (!hourlyUrl) {
          throw new Error("Hourly forecast URL missing from NWS response");
        }

        // 2) Get the hourly forecast for this gridpoint
        const hourlyRes = await fetch(hourlyUrl, {
          headers: {
            Accept: "application/geo+json",
          },
        });

        if (!hourlyRes.ok) {
          throw new Error("Failed to load NWS hourly forecast");
        }

        const hourlyData = await hourlyRes.json();
        const periods: any[] = hourlyData?.properties?.periods ?? [];
        if (!periods.length) {
          throw new Error("No forecast periods returned by NWS");
        }

        // Find period whose startTime is closest to "now" – treat as current
        const now = Date.now();
        let bestIdx = 0;
        let bestDiff = Number.POSITIVE_INFINITY;

        for (let i = 0; i < periods.length; i++) {
          const t = new Date(periods[i].startTime).getTime();
          const diff = Math.abs(t - now);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestIdx = i;
          }
        }

        const currentPeriod = periods[bestIdx];

        const current: CurrentWeather = {
          temperature: currentPeriod.temperature, // already in °F by default
          windSpeed: currentPeriod.windSpeed ?? "",
          windDirection: currentPeriod.windDirection ?? "",
          humidity:
            currentPeriod.relativeHumidity?.value ??
            null,
          precipProb:
            currentPeriod.probabilityOfPrecipitation?.value ??
            null,
          shortForecast: currentPeriod.shortForecast ?? "Weather",
          startTime: currentPeriod.startTime,
        };

        // Next 6 hours after current
        const nextHours: HourlyData[] = [];
        for (let i = bestIdx + 1; i < periods.length && nextHours.length < 6; i++) {
          const p = periods[i];
          nextHours.push({
            time: p.startTime,
            temperature: p.temperature,
            precipProb: p.probabilityOfPrecipitation?.value ?? null,
            shortForecast: p.shortForecast ?? "",
          });
        }

        if (!cancel) {
          setWeather({ current, nextHours });
        }
      } catch (err: any) {
        if (!cancel) {
          setError(err.message || "Failed to load weather");
        }
      }

      if (!cancel) {
        setLoading(false);
      }
    };

    fetchWeather();
    // refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => {
      cancel = true;
      clearInterval(interval);
    };
  }, []);

  const current = weather.current;
  const iconInfo = current
    ? weatherIconFromText(current.shortForecast)
    : null;
  const Icon = iconInfo?.Icon ?? CloudIcon;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <WidgetHeader title="CSUN Weather (NWS)" onDelete={onDelete} />

      <CardContent
        sx={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {loading && (
          <>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary">
              Fetching official NWS campus forecast…
            </Typography>
          </>
        )}

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        {!loading && !error && current && (
          <>
            {/* Updated Time */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: -1 }}
            >
              Updated: {formatTime(current.startTime)}
            </Typography>

            {/* Current Conditions */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "50%",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <Icon sx={{ fontSize: 34 }} aria-hidden="true" />
                </Box>

                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {Math.round(current.temperature)}°F
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {iconInfo?.label}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={0.5} alignItems="flex-end">
                <Chip
                  size="small"
                  label="Northridge, CA • NWS"
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  Wind {current.windSpeed || "N/A"}{" "}
                  {current.windDirection || ""}
                </Typography>
                {current.humidity != null && (
                  <Typography variant="caption" color="text.secondary">
                    Humidity {Math.round(current.humidity)}%
                  </Typography>
                )}
                {current.precipProb != null && (
                  <Typography variant="caption" color="text.secondary">
                    Precip {Math.round(current.precipProb)}%
                  </Typography>
                )}
              </Stack>
            </Stack>

            {/* Next Hours Forecast */}
            <Typography variant="subtitle2">Next hours</Typography>

            <Stack direction="row" spacing={1} sx={{ overflowX: "auto" }}>
              {weather.nextHours.map((h) => {
                const info = weatherIconFromText(h.shortForecast);
                const HIcon = info.Icon;
                return (
                  <Box
                    key={h.time}
                    sx={{
                      minWidth: 90,
                      p: 1,
                      border: "1px solid #eee",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(h.time)}
                    </Typography>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <HIcon fontSize="small" aria-hidden="true" />
                      <Typography variant="body2">
                        {Math.round(h.temperature)}°F
                      </Typography>
                    </Stack>

                    {h.precipProb != null && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {Math.round(h.precipProb)} percent rain
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};
