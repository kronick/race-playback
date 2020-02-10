import { useState, useEffect } from "react";

export type FetchStatus = "loading" | "ready" | "error";
export default function usePrefetch(
  url: string,
  onReady?: (data: string) => void,
  onError?: (error: string) => void
) {
  const [fetchedData, setFetchedData] = useState("");
  const [status, setStatus] = useState<FetchStatus>("loading");

  // Start loading on component load
  useEffect(() => {
    setStatus("loading");
    fetch(url, {})
      .then(async resp => {
        const data = await resp.text();
        onReady?.(data);
        setFetchedData(data);
        setStatus("ready");
      })
      .catch(error => {
        onError?.(error);
        setStatus("error");
      });
  }, []);

  return { data: fetchedData, status };
}
