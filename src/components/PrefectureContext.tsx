// src/context/PrefectureContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PrefContextType } from "./types/Types";
import { Pref } from "./types/Types";

const PrefContext = createContext<PrefContextType>({
  prefs: [],
  isLoading: false,
  isError: false,
});

const fetchPrefectures = async (): Promise<Pref[]> => {
  const res = await axios.get<Pref[]>("http://localhost:8080/api/prefectures");
  console.log(res.data);
  return res.data;
};

export const PrefProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, isError } = useQuery<Pref[]>({
    queryKey: ["prefectures"],
    queryFn: fetchPrefectures,
    staleTime: 1000 * 60 * 60 * 24, // 1日キャッシュ内は再フェッチしない
    gcTime: 1000 * 60 * 60 * 24 * 7, // 1週間キャッシュ保持
  });

  return (
    <PrefContext.Provider
      value={{
        prefs: data ?? [],
        isLoading,
        isError,
      }}
    >
      {children}
    </PrefContext.Provider>
  );
};

export const usePrefectures = () => useContext(PrefContext);
