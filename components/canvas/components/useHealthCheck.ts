import { useEffect, useRef, useState } from "react";

export const isIP = (ip: string) => {
  return ip.split(".").length === 4;
};

export enum Health {
  UNKNOWN = "unknown",
  HEALTHY = "healthy",
  UNHEALTHY = "unhealthy",
}
export const useHealthCheck = (ip?: string, ms = 10000, failThreshold = 5) => {
  const [health, setHealth] = useState<Health>(Health.UNKNOWN);
  const [lastChecked, setLastChecked] = useState(Date.now());
  const [checking, setChecking] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const jitter = Number(Math.random() * ms);

  const checkHealth = () => {
    setChecking(true);
    fetch("/api/ping?ip=" + ip)
      .then((res) => {
        if (res.status !== 200) throw new Error("ping failed");

        setFailCount(0);
        setHealth(Health.HEALTHY);
      })
      .catch(() => {
        setFailCount((p) => p + 1);
      })
      .finally(() => {
        setChecking(false);
        setLastChecked(Date.now());
        timerRef.current = setTimeout(checkHealth, ms + jitter);
      });
  };

  useEffect(() => {
    if (!ip || !isIP(ip)) return;
    checkHealth();
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ip, ms]);

  // set unhealthy if we've failed more than the threshold
  useEffect(() => {
    if (failCount > failThreshold) {
      setHealth(Health.UNHEALTHY);
    }
  }, [failCount, failThreshold]);

  return [health, checking, lastChecked] as const;
};

export const getHealthColor = (health: Health) => {
  switch (health) {
    case Health.HEALTHY:
      return {
        text: "#61C9A8",
        background: "#F9F9F9",
      };
    case Health.UNHEALTHY:
      return {
        text: "#F9F9F9",
        background: "#E34A6F",
      };
    default:
      // unknown
      return {
        text: "#273243",
        background: "#F9F9F9",
      };
  }
};
