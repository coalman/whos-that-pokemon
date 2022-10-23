import { useState, type Key } from "react";

export default function useResetKey(): [Key, () => void] {
  const [key, setKey] = useState(0);

  function reset(): void {
    setKey((prev) => (prev > 1e6 ? 0 : prev + 1));
  }

  return [key, reset];
}
