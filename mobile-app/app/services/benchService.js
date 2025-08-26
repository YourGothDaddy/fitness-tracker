import axiosInstance from "@/app/services/authService";

const nowMs = () => global.performance?.now?.() || Date.now();

export async function bench(name, fn, iterations = 3) {
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const t0 = nowMs();
    // eslint-disable-next-line no-await-in-loop
    await fn();
    const t1 = nowMs();
    samples.push(t1 - t0);
  }
  samples.sort((a, b) => a - b);
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const p95 =
    samples[Math.max(0, Math.floor(samples.length * 0.95) - 1)] || avg;
  return {
    name,
    iterations: samples.length,
    avg_ms: avg,
    p95_ms: p95,
    min_ms: samples[0],
    max_ms: samples[samples.length - 1],
  };
}

export async function runMobileBenchmarks() {
  const today = new Date();
  const start = new Date(today.getTime() - 7 * 86400000);
  const end = today;

  const scenarios = [
    {
      key: "activity_overview",
      fn: async () =>
        axiosInstance.get(`/api/activity/activity-overview`, {
          params: { date: today.toISOString() },
        }),
    },
    {
      key: "activity_overview_period",
      fn: async () =>
        axiosInstance.get(`/api/activity/activity-overview-period`, {
          params: {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        }),
    },
    {
      key: "activity_levels",
      fn: async () => axiosInstance.get(`/api/activity/activity-levels`),
    },
    {
      key: "activity_types",
      fn: async () => axiosInstance.get(`/api/activity/types`),
    },
  ];

  const results = {};
  for (const s of scenarios) {
    // eslint-disable-next-line no-await-in-loop
    const r = await bench(s.key, s.fn, 3);
    results[s.key] = r;
  }

  const payload = {
    timestampUtc: new Date().toISOString(),
    device: "mobile-app",
    metrics: results,
  };

  const res = await axiosInstance.post(`/api/benchmark/client`, payload);
  return res.data;
}
