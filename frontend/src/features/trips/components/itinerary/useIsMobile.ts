import { useEffect, useState } from "react";

const QUERY = "(max-width: 640px)";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQueryList.addEventListener("change", onChange);
    setIsMobile(mediaQueryList.matches);
    return () => mediaQueryList.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}