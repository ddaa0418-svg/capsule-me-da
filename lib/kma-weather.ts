import type { CapsuleWeather } from "@/lib/weather";

const KMA_BASE = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0";
const SEOUL_GRID = { nx: 60, ny: 127 };

type KmaItem = {
  category?: string;
  obsrValue?: string;
  fcstValue?: string;
  fcstDate?: string;
  fcstTime?: string;
  baseDate?: string;
  baseTime?: string;
};

type KmaResponse = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: { items?: { item?: KmaItem | KmaItem[] } };
  };
};

function toGrid(lat: number, lon: number) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;
  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
}

function kstParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

function shiftKstHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 3_600_000);
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function ymd(parts: ReturnType<typeof kstParts>) {
  return `${parts.year}${pad2(parts.month)}${pad2(parts.day)}`;
}

function ncstBase(now = new Date()) {
  const current = kstParts(now);
  const base =
    current.minute < 10 ? kstParts(shiftKstHours(now, -1)) : current;

  return { baseDate: ymd(base), baseTime: `${pad2(base.hour)}00` };
}

function fcstBase(now = new Date()) {
  const current = kstParts(now);
  const base =
    current.minute < 45 ? kstParts(shiftKstHours(now, -1)) : current;

  return { baseDate: ymd(base), baseTime: `${pad2(base.hour)}30` };
}

function asItems(value: KmaItem | KmaItem[] | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function toMeasuredNumber(value: string | undefined) {
  if (value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || Math.abs(parsed) >= 900) {
    return null;
  }

  return parsed;
}

function describeCondition(pty: string | undefined, sky: string | undefined) {
  switch (pty) {
    case "1":
      return "비";
    case "2":
      return "비/눈";
    case "3":
      return "눈";
    case "4":
      return "소나기";
    case "5":
      return "빗방울";
    case "6":
      return "빗방울눈날림";
    case "7":
      return "눈날림";
    default:
      break;
  }

  switch (sky) {
    case "1":
      return "맑음";
    case "3":
      return "구름많음";
    case "4":
      return "흐림";
    default:
      return "알 수 없음";
  }
}

function formatObservedAt(baseDate: string, baseTime: string) {
  if (baseDate.length !== 8 || baseTime.length < 4) {
    return `${baseDate} ${baseTime}`;
  }

  return `${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)} ${baseTime.slice(0, 2)}:${baseTime.slice(2, 4)}`;
}

function serviceKey() {
  const key = process.env.DATA_GO_KR_SERVICE_KEY;

  if (!key) {
    throw new Error("DATA_GO_KR_SERVICE_KEY is not set");
  }

  return key;
}

async function fetchKma(path: string, params: Record<string, string>) {
  const search = new URLSearchParams({
    pageNo: "1",
    dataType: "JSON",
    ...params,
  });
  const url = `${KMA_BASE}${path}?serviceKey=${serviceKey()}&${search.toString()}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const text = await response.text();

  try {
    return JSON.parse(text) as KmaResponse;
  } catch {
    throw new Error(`KMA API returned non-JSON: ${text.slice(0, 180)}`);
  }
}

function resultCode(payload: KmaResponse) {
  return payload.response?.header?.resultCode ?? "";
}

function isOk(code: string) {
  return code === "00" || code === "0";
}

function isNoData(code: string) {
  return code === "03";
}

async function fetchNcst(nx: number, ny: number, now = new Date()) {
  const first = ncstBase(now);
  const payload = await fetchKma("/getUltraSrtNcst", {
    numOfRows: "20",
    base_date: first.baseDate,
    base_time: first.baseTime,
    nx: String(nx),
    ny: String(ny),
  });
  const code = resultCode(payload);

  if (isOk(code)) {
    return payload;
  }

  if (!isNoData(code)) {
    throw new Error(payload.response?.header?.resultMsg ?? "KMA ncst error");
  }

  const retry = ncstBase(shiftKstHours(now, -1));
  const retried = await fetchKma("/getUltraSrtNcst", {
    numOfRows: "20",
    base_date: retry.baseDate,
    base_time: retry.baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  if (!isOk(resultCode(retried))) {
    throw new Error(retried.response?.header?.resultMsg ?? "KMA ncst nodata");
  }

  return retried;
}

async function fetchSky(nx: number, ny: number, now = new Date()) {
  const first = fcstBase(now);
  const payload = await fetchKma("/getUltraSrtFcst", {
    numOfRows: "60",
    base_date: first.baseDate,
    base_time: first.baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  if (!isOk(resultCode(payload))) {
    return undefined;
  }

  const skyItems = asItems(payload.response?.body?.items?.item)
    .filter((item) => item.category === "SKY")
    .sort((left, right) =>
      `${left.fcstDate ?? ""}${left.fcstTime ?? ""}`.localeCompare(
        `${right.fcstDate ?? ""}${right.fcstTime ?? ""}`,
      ),
    );

  return skyItems[0]?.fcstValue;
}

export async function getCurrentWeather(lat?: number, lon?: number): Promise<CapsuleWeather> {
  const hasCoords =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lon === "number" &&
    Number.isFinite(lon);
  const grid = hasCoords ? toGrid(lat, lon) : SEOUL_GRID;
  const nx = grid.nx >= 1 && grid.nx <= 149 ? grid.nx : SEOUL_GRID.nx;
  const ny = grid.ny >= 1 && grid.ny <= 253 ? grid.ny : SEOUL_GRID.ny;

  const [ncst, sky] = await Promise.all([fetchNcst(nx, ny), fetchSky(nx, ny)]);
  const items = asItems(ncst.response?.body?.items?.item);
  const values = Object.fromEntries(
    items.flatMap((item) =>
      item.category ? [[item.category, item.obsrValue ?? ""]] : [],
    ),
  );
  const first = items[0];

  return {
    temperature: toMeasuredNumber(values.T1H),
    humidity: toMeasuredNumber(values.REH),
    rainfall: toMeasuredNumber(values.RN1),
    condition: describeCondition(values.PTY, sky),
    observedAt: formatObservedAt(first?.baseDate ?? "", first?.baseTime ?? ""),
  };
}
