import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useForm, SubmitHandler } from "react-hook-form";
import api from "../api/api";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import ImageUploader from "./ImageUploader";
import { usePrefectures } from "./PrefectureContext";
import axios from "axios";

const containerStyle = {
  width: "100%",
  height: "300px",
};

interface FormInputs {
  content: string;
}

const NewPostForm: React.FC = () => {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [address, setAddress] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(false);

  const { prefs, isLoading: prefsLoading, isError } = usePrefectures();
  const [selectedPrefId, setSelectedPrefId] = useState<number | "">("");
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [prefName, setPrefName] = useState("");
  const [cityName, setCityName] = useState("");
  const [banchiName, setBanchiName] = useState("");

  const [geoPrefName, setGeoPrefName] = useState("");
  const [geoCityName, setGeoCityName] = useState("");
  const [autoSelectCityEnabled, setAutoSelectCityEnabled] = useState(true);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>();

  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage("このブラウザでは位置情報が利用できません。");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCenter({ lat, lng });
        setMarkerPosition({ lat, lng });
        await geocodeLatLng(lat, lng);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setMessage("位置情報の取得に失敗しました。");
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (selectedPrefId === "") {
      setCities([]);
      return;
    }
    setCitiesLoading(true);
    api
      .get<{ id: number; name: string }[]>(
        `/api/prefectures/${selectedPrefId}/cities`
      )
      .then((res) => setCities(res.data))
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, [selectedPrefId]);

  useEffect(() => {
    if (!autoSelectCityEnabled) setGeoCityName("");
    if (
      autoSelectCityEnabled &&
      selectedPrefId !== "" &&
      !citiesLoading &&
      geoCityName
    ) {
      const matchedCity = cities.find((c) => c.name === geoCityName);
      if (matchedCity) {
        setSelectedCityId(matchedCity.id);
      }
    }
  }, [cities, citiesLoading, geoCityName, autoSelectCityEnabled]);

  // Lat,lngから住所を取得するして表示用アドレス欄にセットする関数。初回レンダー時とマップのピン移動の際は都道府県のセレクター選択も変更が入る。
  const geocodeLatLng = async (lat: number, lng: number) => {
    try {
      const res = await api.get(`/api/geocode?lat=${lat}&lng=${lng}`);
      const formatted = res.data.results[0]?.formatted_address;
      if (formatted) {
        const match = formatted.match(/(?:日本、)?(?:〒\d{3}-\d{4}\s)?(.+)/);
        setAddress(match ? match[1] : formatted);

        const prefTemp = res.data.results[0].address_components.find(
          (comp: any) => comp.types.includes("administrative_area_level_1")
        );
        const cityTemp = res.data.results[0].address_components.find(
          (comp: any) =>
            comp.types.includes("locality") ||
            comp.types.includes("administrative_area_level_2")
        );
        setGeoPrefName(prefTemp?.long_name ?? "");
        setGeoCityName(cityTemp?.long_name ?? "");
        // setAutoSelectCityEnabled(true);

        const matchedPref = prefs.find((p) => p.name === prefTemp.long_name);
        if (matchedPref) {
          setPrefName(matchedPref.name);
          setSelectedPrefId(matchedPref.id);
        }
      } else {
        setAddress("住所不明");
      }
    } catch (e) {
      setMessage("タイムアウト");
      window.location.href = "/login?error=expired";
    }
  };

  // 入力された住所から緯度経度を取得して地図を移動する関数
  const handleSearch = async () => {
    try {
      const fullAddress = `${prefName}${cityName}${banchiName}`;
      const res = await api.post("/api/geocode/address", {
        address: fullAddress,
      });
      const loc = res.data.results[0].geometry.location;

      setCenter(loc);
      setMarkerPosition(loc);
      await geocodeLatLng(loc.lat, loc.lng);
      if (!selectedCityId) setAddress("");
    } catch (err) {
      console.error(err);
      setMessage("住所が見つかりませんでした");
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!center) return;
    if (!selectedCityId) {
      setMessage("市区町村を選んでください。");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("latitude", center.lat.toString());
    formData.append("longitude", center.lng.toString());
    formData.append("address", address);
    formData.append("content", data.content);
    formData.append("cityId", selectedCityId?.toString() ?? "");
    formData.append("prefectureId", selectedPrefId?.toString() ?? "");

    if (images.length !== 0) {
      images.forEach((img) => formData.append("images", img));
    }

    try {
      await api.post("/api/postNew", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("投稿完了しました！");
      reset();
      setImages([]);
      setResetSignal(true); // プレビューを初期化
      window.location.href = "/";
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // サーバーからのエラー（例：バリデーション、403など）
          const errorMsg =
            typeof err.response.data === "string"
              ? err.response.data
              : err.response.data.message || "投稿に失敗しました。";
          setMessage(errorMsg);
        } else if (err.request) {
          // リクエストは送られたがレスポンスがない
          setMessage("サーバーからの応答がありませんでした。");
        } else {
          // 何らかのaxios内エラー
          setMessage("リクエスト処理中にエラーが発生しました。");
        }
      } else {
        // axios以外のエラー（コードミスなど）
        setMessage("予期せぬエラーが発生しました。");
      }
    } finally {
      setSubmitting(false);
      setResetSignal(false); // Signalを戻す
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>現在地を取得中...</p>
      </div>
    );
  }

  return (
    <Container className="mt-4">
      {message && <Alert variant="info">{message}</Alert>}

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center!}
            zoom={15}
          >
            {markerPosition && (
              <Marker
                position={markerPosition}
                draggable
                onDragEnd={(e) => {
                  const lat = e.latLng?.lat();
                  const lng = e.latLng?.lng();
                  if (lat && lng) {
                    const pos = { lat, lng };
                    setMarkerPosition(pos);
                    setCenter(pos);
                    geocodeLatLng(lat, lng);
                    setAutoSelectCityEnabled(true);
                  }
                }}
              />
            )}
          </GoogleMap>

          <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
            <form className="d-flex flex-wrap gap-2 align-items-center">
              <label>
                都道府県
                <select
                  value={selectedPrefId}
                  onChange={(e) => {
                    setAutoSelectCityEnabled(false);
                    setSelectedPrefId(Number(e.target.value));
                    const name = e.target.options[e.target.selectedIndex].text;
                    setPrefName(name);
                    setGeoCityName("");
                    setSelectedCityId(null);
                    setCityName("");
                  }}
                  className="form-select"
                >
                  <option value="" disabled>
                    選択してください
                  </option>
                  {prefs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                市区町村
                <select
                  disabled={!selectedPrefId || citiesLoading}
                  onChange={(e) => {
                    setCityName(e.target.options[e.target.selectedIndex].text);
                    setSelectedCityId(Number(e.target.value));
                  }}
                  className="form-select"
                >
                  {citiesLoading && <option>読み込み中…</option>}
                  {!citiesLoading && cities.length === 0 && <option>—</option>}
                  <option value="">選択してください</option>
                  {!citiesLoading &&
                    cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>
            </form>

            <Form.Control
              disabled={!cities}
              type="text"
              value={banchiName}
              onChange={(e) => setBanchiName(e.target.value)}
              placeholder="例: 1丁目2-3"
              className="flex-grow-1 min-w-0"
            />

            <Button
              variant="secondary"
              onClick={handleSearch}
              className="flex-shrink-0"
            >
              地図を移動
            </Button>
          </div>
        </div>

        <div className="col-md-6">
          <ImageUploader onImagesChange={setImages} resetSignal={resetSignal} />
        </div>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3">
          <Form.Label>住所</Form.Label>
          <Form.Control type="text" value={address} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>コメント</Form.Label>
          <Form.Control
            as="textarea"
            rows={1}
            placeholder="例: この場所で〇〇を発見！"
            maxLength={50}
            {...register("content", {
              required: "コメントは必須です。",
              maxLength: {
                value: 50,
                message: "50文字以内で入力してください。",
              },
            })}
          />
          {errors.content && (
            <Form.Text className="text-danger">
              {errors.content.message}
            </Form.Text>
          )}
        </Form.Group>

        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              投稿中...
            </>
          ) : (
            "投稿する"
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default NewPostForm;
