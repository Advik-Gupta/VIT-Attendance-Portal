export const saveToStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;

  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};
