import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import PostCard from "./boilerTemplates/PostCard";
import { Post, Pref } from "./types/Types";
import { PageResponse } from "./types/Types";
import { usePrefectures } from "./PrefectureContext";
import { Button } from "react-bootstrap";
import { useAuthContext } from "./AuthContext";

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { prefs, isLoading: prefsLoading, isError } = usePrefectures();
  const [selectedPrefId, setSelectedPrefId] = useState<number | "">("");
  const [rehydrated, setRehydrated] = useState<boolean>(false); // ★ 追加
  const isFirstRun = useRef(true);

  const { setIsAuthenticated, user } = useAuthContext();
  console.log(user?.username);

  const json = sessionStorage.getItem("prefectures");

  let localPrefs: Pref[] = [];

  if (json) {
    try {
      localPrefs = JSON.parse(json) as Pref[];
    } catch (error) {
      console.error("prefectures の読み込みに失敗:", error);
    }
  }

  // 投稿取得（全件）
  const fetchPost = async (page: number) => {
    try {
      const response = await axios.get<PageResponse<Post>>(
        `http://localhost:8080/api/posts?page=${page}`
      );
      setPosts(response.data.content);
      setTotalPages(response.data.totalPages);
      sessionStorage.setItem("posts", JSON.stringify(response.data.content));
    } catch (error) {
      window.location.href = "/login?error=expired";
    } finally {
      setLoading(false);
    }
  };

  // 投稿取得（都道府県でフィルター）
  const handleFilter = async () => {
    try {
      const response = await axios.get<PageResponse<Post>>(
        `http://localhost:8080/api/posts/prefecture/${selectedPrefId}?page=${page}`
      );
      setPosts(response.data.content);
      setTotalPages(response.data.totalPages);

      // sessionStorage に保存
      sessionStorage.setItem("posts", JSON.stringify(response.data.content));
      sessionStorage.setItem("selectedPrefId", selectedPrefId.toString());
      sessionStorage.setItem("page", page.toString());
      sessionStorage.setItem("totalPages", response.data.totalPages.toString());
    } catch (error) {
      window.location.href = "/login?error=expired";
    } finally {
      setLoading(false);
    }
  };

  // 初回マウント時に sessionStorage から復元
  useEffect(() => {
    const savedPrefId = Number(sessionStorage.getItem("selectedPrefId"));
    const savedPage = sessionStorage.getItem("page");
    const savedPosts = sessionStorage.getItem("posts");
    const savedTotalPages = sessionStorage.getItem("totalPages");

    // 有効な都道府県ID（1〜47）かチェック（1未満と48以上は無効）
    if (savedPrefId > 0 && savedPrefId < 48) {
      setSelectedPrefId(savedPrefId);
    } else {
      setSelectedPrefId("");
    }

    if (savedPage !== null) setPage(Number(savedPage));
    if (savedTotalPages !== null) setTotalPages(Number(savedTotalPages));
    if (savedPosts && savedPrefId) {
      setPosts(JSON.parse(savedPosts) as Post[]);
      setLoading(false);
    } else {
      fetchPost(savedPage ? Number(savedPage) : 0);
    }

    console.log("oi76");
    setRehydrated(true); // ★ すべて終わったらここで true にする
  }, []);

  // page or selectedPrefId の変更時に再取得
  useEffect(() => {
    if (!rehydrated) return; // ★ 完了するまで待つ

    // 初回は復元目的なのでここで return
    if (isFirstRun.current) {
      console.log("oi85");
      isFirstRun.current = false;
      return;
    }

    setLoading(true);
    if (selectedPrefId !== "") {
      handleFilter();
    } else {
      fetchPost(page);
    }

    sessionStorage.setItem("page", page.toString());
    sessionStorage.setItem("selectedPrefId", selectedPrefId.toString());
  }, [page, selectedPrefId, rehydrated]);

  // UI
  if (loading) return <div>読み込み中...</div>;
  if (posts.length === 0) return <div>投稿が見つかりません</div>;

  return (
    <div className="card" style={{ width: "80vw", border: "none" }}>
      <label>
        都道府県でフィルター
        <select
          value={selectedPrefId}
          onChange={(e) => {
            setSelectedPrefId(Number(e.target.value) || "");
            setPage(0);
          }}
          className="form-select"
        >
          <option value="">すべてを表示</option>
          {prefs !== null
            ? prefs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            : localPrefs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
        </select>
      </label>

      <div className="card-body">
        <div className="container mt-4">
          <h1 className="text-center mb-4">最新投稿</h1>

          <div className="row">
            {posts.map((post) => (
              <div
                className="col-md-4 mb-4 d-flex justify-content-center"
                key={post.postId}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
            <Button
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage((prev) => prev - 1)}
            >
              前
            </Button>
            <span>
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              次
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
