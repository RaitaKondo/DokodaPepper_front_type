// src/App.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./components/AuthContext";
import { PrefProvider } from "./components/PrefectureContext";
import AppRoutes from "./components/AppRoutes";
import "./App.css";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    // 1. React Query のクライアントを全体に提供
    <QueryClientProvider client={queryClient}>
      {/* 2. 認証情報を全体に提供 */}
      <AuthProvider>
        {/* 3. 都道府県リストを全体に提供 */}
        <PrefProvider>
          {/* 4. ルーティング／画面遷移 */}
          <AppRoutes />
        </PrefProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
