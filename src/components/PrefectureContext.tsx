// src/context/PrefectureContext.tsx
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import api from "../api/api";
import { PrefContextType } from "./types/Types";
import { Pref } from "./types/Types";

const PrefContext = createContext<PrefContextType>({
  prefs: [],
  isLoading: false,
  isError: false,
});

const SESSION_STORAGE_KEY = "prefectures";

export const PrefProvider = ({ children }: { children: ReactNode }) => {
  const [prefs, setPrefs] = useState<Pref[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Pref[];
        setPrefs(parsed);
        setIsLoading(false);
      } catch (e) {
        console.warn(
          "都道府県キャッシュのパースに失敗しました。再取得します。",
          e
        );
        fetchPrefectures();
      }
    } else {
      fetchPrefectures();
    }
  }, []);

  const fetchPrefectures = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<Pref[]>("/api/prefectures");
      setPrefs(res.data);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res.data));
    } catch (error) {
      setIsError(true);
      console.error("都道府県データの取得に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PrefContext.Provider value={{ prefs, isLoading, isError }}>
      {children}
    </PrefContext.Provider>
  );
};

export const usePrefectures = () => useContext(PrefContext);
