import React, { useEffect, useState } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import axios from "axios";
import { Button, Form, Spinner, Alert, Container } from "react-bootstrap";
import { get } from "http";
import ImageUploader from "./ImageUploader";

const containerStyle = {
  width: "100%",
  height: "300px",
};

const NewPostForm: React.FC = () => {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [address, setAddress] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState<string>("");

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
  });

  // 現在地の取得と逆ジオコーディング
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

        try {
          geocodeLatLng(lat, lng);
        } catch (err) {
          console.error(err + "48行目");
          setAddress("住所取得に失敗しました");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setMessage("位置情報の取得に失敗しました。");
        setLoading(false);
      }
    );
  }, []);

  const geocodeLatLng = async (lat: number, lng: number) => {
    const res = await axios.get(
      `http://localhost:8080/api/geocode?lat=${lat}&lng=${lng}`
    );
    console.log(res.data);
    const formatted = res.data.results[0]?.formatted_address;
    if (formatted) {
      const match = formatted.match(/(?:日本、)?(?:〒\d{3}-\d{4}\s)?(.+)/);
      setAddress(match ? match[1] : formatted);
    } else {
      setAddress("住所不明");
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/geocode/address",
        {
          address: searchAddress,
        }
      );
      const location = res.data.results[0].geometry.location;
      setCenter({ lat: location.lat, lng: location.lng });
      setMarkerPosition({ lat: location.lat, lng: location.lng });
      // setAddress(res.data.results[0].formatted_address);
      const formatted = res.data.results[0]?.formatted_address;

      if (formatted) {
        const match = formatted.match(/(?:日本、)?(?:〒\d{3}-\d{4}\s)?(.+)/);
        setAddress(match ? match[1] : formatted);
      } else {
        setAddress("住所不明");
      }
    } catch (err) {
      console.error("住所検索に失敗しました", err);
      setMessage("住所が見つかりませんでした");
    }
  };

  // 投稿ボタン
  const handleSubmit = async () => {
    if (!center) return;

    try {
      await axios.post(
        "http://localhost:8080/api/postsNew",
        {
          latitude: center.lat,
          longitude: center.lng,
          address,
          content,
        },
        { withCredentials: true }
      );
      setMessage("投稿完了しました！");
      setContent("");
    } catch (err) {
      console.error(err);
      setMessage("投稿に失敗しました。");
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
        {/* 地図（左） */}
        <div className="col-md-6 mb-3">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center!}
            zoom={15}
          >
            {markerPosition && (
              <Marker
                position={markerPosition}
                draggable={true}
                onDragEnd={(e) => {
                  const lat = e.latLng?.lat();
                  const lng = e.latLng?.lng();
                  if (lat && lng) {
                    setMarkerPosition({ lat, lng });
                    setCenter({ lat, lng });
                    geocodeLatLng(lat, lng);
                  }
                }}
              />
            )}
          </GoogleMap>

          <div className="col-md-12">
            <Form.Group className="mb-3 row">
              <div className="col-sm-10">
                <Form.Control
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="例: 新宿"
                />
                <Button variant="secondary" onClick={handleSearch}>
                  地図を移動
                </Button>
              </div>
            </Form.Group>
          </div>
        </div>

        {/* 住所フォーム（右） */}

        <div className="col-md-6">
          <ImageUploader />
        </div>
      </div>

      <Form className="mt-4">
        <Form.Group className="mb-3">
          <Form.Label>住所</Form.Label>
          <Form.Control type="text" value={address} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>コメント</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={content}
            placeholder="例: この場所で〇〇を見つけました"
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" onClick={handleSubmit}>
          投稿する
        </Button>
      </Form>
    </Container>
  );
};

export default NewPostForm;
