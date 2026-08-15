from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request

# city -> (expires_at, payload)
_CACHE: dict[str, tuple[float, dict]] = {}
# city -> (expires_at, lat, lon, label, admin)
_GEO_CACHE: dict[str, tuple[float, float, float, str, str]] = {}

WEATHER_TTL = 30 * 60  # 30 min
GEO_TTL = 7 * 24 * 3600  # 7 days
HTTP_TIMEOUT = 3.5


def _get_json(url: str, timeout: float = HTTP_TIMEOUT) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "ResearchWorkbench/1.1"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _geocode(city: str) -> tuple[float, float, str, str] | None:
    key = city.strip().lower()
    now = time.time()
    hit = _GEO_CACHE.get(key)
    if hit and hit[0] > now:
        return hit[1], hit[2], hit[3], hit[4]

    geo_url = (
        "https://geocoding-api.open-meteo.com/v1/search?"
        + urllib.parse.urlencode({"name": city, "count": 1, "language": "zh", "format": "json"})
    )
    geo = _get_json(geo_url)
    results = geo.get("results") or []
    if not results:
        return None
    place = results[0]
    lat, lon = float(place["latitude"]), float(place["longitude"])
    label = place.get("name") or city
    admin = place.get("admin1") or ""
    _GEO_CACHE[key] = (now + GEO_TTL, lat, lon, label, admin)
    return lat, lon, label, admin


def fetch_weather(city: str = "上海") -> dict:
    """Open-Meteo geocoding + forecast (no API key), with short TTL cache."""
    city = (city or "上海").strip()
    cache_key = city.lower()
    now = time.time()
    cached = _CACHE.get(cache_key)
    if cached and cached[0] > now:
        return {**cached[1], "cached": True}

    try:
        geo = _geocode(city)
        if not geo:
            return {"ok": False, "city": city, "error": "未找到该城市"}
        lat, lon, label, admin = geo
        weather_url = (
            "https://api.open-meteo.com/v1/forecast?"
            + urllib.parse.urlencode(
                {
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability,is_day",
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                    "timezone": "auto",
                    "forecast_days": 1,
                }
            )
        )
        data = _get_json(weather_url)
        cur = data.get("current") or {}
        daily = data.get("daily") or {}
        code = int(cur.get("weather_code") or 0)
        is_day = int(cur.get("is_day") if cur.get("is_day") is not None else 1) == 1
        payload = {
            "ok": True,
            "city": label,
            "admin": admin,
            "temp": cur.get("temperature_2m"),
            "humidity": cur.get("relative_humidity_2m"),
            "wind": cur.get("wind_speed_10m"),
            "precip_prob": cur.get("precipitation_probability")
            if cur.get("precipitation_probability") is not None
            else (daily.get("precipitation_probability_max") or [None])[0],
            "tmax": (daily.get("temperature_2m_max") or [None])[0],
            "tmin": (daily.get("temperature_2m_min") or [None])[0],
            "weather_code": code,
            "weather_text": weather_text(code),
            "sky": sky_from_code(code),
            "is_day": is_day,
            "cached": False,
        }
        _CACHE[cache_key] = (now + WEATHER_TTL, payload)
        return payload
    except Exception as e:
        if cached:
            return {**cached[1], "cached": True, "stale": True}
        return {"ok": False, "city": city, "error": str(e)}


def sky_from_code(code: int) -> str:
    """Coarse sky bucket for UI backgrounds."""
    if code in (95, 96, 99):
        return "storm"
    if code in (71, 73, 75, 77, 85, 86):
        return "snow"
    if code in (61, 63, 65, 66, 67, 80, 81, 82):
        return "rain"
    if code in (51, 53, 55, 56, 57):
        return "drizzle"
    if code in (45, 48):
        return "fog"
    if code == 3:
        return "overcast"
    if code == 2:
        return "cloudy"
    if code == 1:
        return "partly"
    if code == 0:
        return "clear"
    return "cloudy"


def weather_text(code: int) -> str:
    mapping = {
        0: "晴",
        1: "晴间多云",
        2: "多云",
        3: "阴",
        45: "雾",
        48: "雾凇",
        51: "小毛毛雨",
        53: "毛毛雨",
        55: "大毛毛雨",
        61: "小雨",
        63: "中雨",
        65: "大雨",
        66: "冻雨",
        67: "强冻雨",
        71: "小雪",
        73: "中雪",
        75: "大雪",
        77: "雪粒",
        80: "阵雨",
        81: "中阵雨",
        82: "强阵雨",
        85: "阵雪",
        86: "强阵雪",
        95: "雷暴",
        96: "雷暴伴冰雹",
        99: "强雷暴冰雹",
    }
    return mapping.get(code, "天气更新中")

