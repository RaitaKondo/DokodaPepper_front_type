import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import ImageUploader from "./ImageUploader";
import { usePrefectures } from "./PrefectureContext";

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
  const [searchAddress, setSearchAddress] = useState("");
  const [resetSignal, setResetSignal] = useState(false);

  const { prefs, isLoading: prefsLoading, isError } = usePrefectures();
  const [selectedPrefId, setSelectedPrefId] = useState<number | "">("");
  const [selectedCityId, setSelectedCityId] = useState<number | "">("");
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [prefName, setPrefName] = useState("");
  const [cityName, setCityName] = useState("");
  const [banchiName, setBanchiName] = useState("");

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
    axios
      .get<{ id: number; name: string }[]>(
        `http://localhost:8080/api/prefectures/${selectedPrefId}/cities`
      )
      .then((res) => setCities(res.data))
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, [selectedPrefId]);

  // Last,lngから住所を取得するして表示用アドレス欄にセットする関数
  const geocodeLatLng = async (lat: number, lng: number) => {
    const res = await axios.get(
      `http://localhost:8080/api/geocode?lat=${lat}&lng=${lng}`
    );
    const formatted = res.data.results[0]?.formatted_address;
    if (formatted) {
      const match = formatted.match(/(?:日本、)?(?:〒\d{3}-\d{4}\s)?(.+)/);
      setAddress(match ? match[1] : formatted);
    } else {
      setAddress("住所不明");
    }
  };

  // 入力された住所から緯度経度を取得して地図を移動する関数
  const handleSearch = async () => {
    try {
      const fullAddress = `${prefName}${cityName}${banchiName}`;
      const res = await axios.post(
        "http://localhost:8080/api/geocode/address",
        {
          address: fullAddress,
        }
      );

      const loc = res.data.results[0].geometry.location;
      setCenter(loc);
      setMarkerPosition(loc);
      await geocodeLatLng(loc.lat, loc.lng);
    } catch (err) {
      console.error(err);
      setMessage("住所が見つかりませんでした");
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!center) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("latitude", center.lat.toString());
    formData.append("longitude", center.lng.toString());
    formData.append("address", address);
    formData.append("content", data.content);
    formData.append("cityId", selectedCityId?.toString() ?? "");

    images.forEach((img) => formData.append("images", img));

    try {
      console.log("FormData:", formData);
      console.log("FormData entries:", Array.from(formData.entries()));
      await axios.post("http://localhost:8080/api/postNew", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("投稿完了しました！");
      reset();
      setImages([]);
      setResetSignal(true); // プレビューを初期化
    } catch (err) {
      console.error(err);
      setMessage("投稿に失敗しました。");
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
                  }
                }}
              />
            )}
          </GoogleMap>

          <div className="mt-3 d-flex">
            <form>
              <label>
                都道府県
                <select
                  value={selectedPrefId}
                  onChange={(e) => {
                    setSelectedPrefId(Number(e.target.value));
                    const name = e.target.options[e.target.selectedIndex].text;
                    setPrefName(name);
                  }}
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
                >
                  {citiesLoading && <option>読み込み中…</option>}
                  {!citiesLoading && cities.length === 0 && <option>—</option>}
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
              className="me-2"
            />
            <Button variant="secondary" onClick={handleSearch}>
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
            rows={3}
            placeholder="例: この場所で〇〇を発見！"
            {...register("content", { required: "コメントは必須です。" })}
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
