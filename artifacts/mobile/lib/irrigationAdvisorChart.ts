export interface SmdChartPoint {
  date: string;
  smd: number;
}

export interface SmdChartDataOptions {
  historical: SmdChartPoint[];
  currentSmd: number;
  currentDailyEtcMm: number;
  fieldCapacity: number;
  forecastDailyMm: Array<{ date: string; mm: number }> | null | undefined;
  forecastRainfall7dMm: number | null | undefined;
  today: string;
}

/**
 * Build the mobile chart's historical and forecast series.
 *
 * Historical SMD already includes today's water balance. Open-Meteo's daily
 * forecast commonly starts on today, so that overlapping entry must not be
 * applied after today's SMD or shown as a second point for the same date.
 */
export function buildSmdChartData({
  historical,
  currentSmd,
  currentDailyEtcMm,
  fieldCapacity,
  forecastDailyMm,
  forecastRainfall7dMm,
  today,
}: SmdChartDataOptions): { historical: SmdChartPoint[]; projected: SmdChartPoint[] } {
  const chartHistorical = historical.slice(-30);
  if (chartHistorical.length === 0) return { historical: chartHistorical, projected: [] };

  let forecastDays: Array<{ date: string; mm: number }> | null = null;
  if (forecastDailyMm && forecastDailyMm.length > 0) {
    const historicalEndDate = chartHistorical[chartHistorical.length - 1].date;
    forecastDays = forecastDailyMm
      .filter(day => day.date > historicalEndDate)
      .slice(0, 7);
  } else if (forecastRainfall7dMm != null) {
    const dailyMm = forecastRainfall7dMm / 7;
    forecastDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(`${today}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + index + 1);
      return { date: date.toISOString().slice(0, 10), mm: dailyMm };
    });
  }
  if (!forecastDays || forecastDays.length === 0) {
    return { historical: chartHistorical, projected: [] };
  }

  let smd = currentSmd;
  const projected = forecastDays.map(day => {
    smd = Math.max(0, Math.min(fieldCapacity, smd + currentDailyEtcMm - day.mm));
    return { date: day.date, smd: Number(smd.toFixed(1)) };
  });

  return { historical: chartHistorical, projected };
}