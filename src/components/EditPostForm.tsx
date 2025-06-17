import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useForm, SubmitHandler } from "react-hook-form";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/api";
import {
  Container,
  Row,
  Col,
  Carousel,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import ImageUploader from "./ImageUploader";
import { usePrefectures } from "./PrefectureContext";
import { Post } from "./types/Types";
import LoginPage from "./Login";

const containerStyle = {
  width: "100%",
  height: "300px",
};

interface FormInputs {
  content: string;
}

const EditPostForm: React.FC = () => {
  const { state } = useLocation();
  const [post, setPost] = useState<Post | null>(state?.post || null);
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
    if (
      post &&
      Object.values(post).every((v) => v !== null && v !== undefined)
    ) {
      setSelectedPrefId(post.prefectureId);
      setPrefName(post.prefectureName);
      setSelectedCityId(post.city.id);
      setCityName(post.city.name);
      setAddress(post.address);
    } else {
      console.log("no valid values..");
    }

    (async () => {
      const lat = post!.latitude;
      const lng = post!.longitude;
      setCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
      await geocodeLatLng(lat, lng);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selectedPrefId === "") {
      setCities([]);
      return;
    }
    setCitiesLoading(true);
    axios
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

  // Last,lngから住所を取得するして表示用アドレス欄にセットする関数。初回レンダー時とマップのピン移動の際は都道府県のラジエーター選択も変更が入る。
  const geocodeLatLng = async (lat: number, lng: number) => {
    try {
      const res = await axios.get(`/api/geocode?lat=${lat}&lng=${lng}`);
      const formatted = res.data.results[0]?.formatted_address;
      console.log(res);
      if (formatted) {
        const match = formatted.match(/(?:日本、)?(?:〒\d{3}-\d{4}\s)?(.+)/);
        setAddress(match ? match[1] : formatted);

        const prefTemp = res.data.results[0].address_components.find(
          (comp: any) => comp.types.includes("administrative_area_level_1")
        );
        console.log(prefTemp);
        const cityTemp = res.data.results[0].address_components.find(
          (comp: any) =>
            comp.types.includes("locality") ||
            comp.types.includes("administrative_area_level_2")
        );
        console.log(cityTemp);
        setGeoPrefName(prefTemp?.long_name ?? "");
        setGeoCityName(cityTemp?.long_name ?? "");
        // setAutoSelectCityEnabled(true);

        const matchedPref = prefs.find((p) => p.name === prefTemp.long_name);
        console.log(matchedPref);
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
      console.log(fullAddress);
      const res = await axios.post("/api/geocode/address", {
        address: fullAddress,
      });
      console.log(res);
      const loc = res.data.results[0].geometry.location;

      setCenter(loc);
      setMarkerPosition(loc);
      await geocodeLatLng(loc.lat, loc.lng);
      console.log(selectedCityId);
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
    console.log(selectedCityId);
    formData.append("cityId", selectedCityId?.toString() ?? "");
    formData.append("prefectureId", selectedPrefId?.toString() ?? "");

    if (images.length !== 0) {
      images.forEach((img) => formData.append("images", img));
    }

    try {
      console.log("FormData:", formData);
      console.log("FormData entries:", Array.from(formData.entries()));
      await axios.post(`/api/posts/${post?.postId}/edited`, formData, {
        withCredentials: true,
      });
      setMessage("投稿完了しました！");
      reset();
      setImages([]);
      setResetSignal(true); // プレビューを初期化
      window.location.href = "/";
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
            {markerPosition && <Marker position={markerPosition} />}
          </GoogleMap>
        </div>

        <div className="col-md-6">
          {post?.images && post.images.length > 0 && (
            <Row className="mb-3">
              <Col>
                <Carousel>
                  {post.images.map((img) => (
                    <Carousel.Item key={img.id}>
                      <img
                        className="d-block w-100"
                        src={`${process.env.REACT_APP_API_URL}${img.imageUrl}`}
                        alt={`Image ${img.sortOrder}`}
                        style={{ maxHeight: "300px", objectFit: "cover" }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              </Col>
            </Row>
          )}
        </div>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3">
          <Form.Label>住所</Form.Label>
          <Form.Control type="text" value={address} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>コメント</Form.Label>

          {/* 新しいコメント入力欄 */}
          <Form.Control
            as="textarea"
            rows={1}
            placeholder={post?.content}
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
            "更新する"
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default EditPostForm;
