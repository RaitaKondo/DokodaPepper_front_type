import { useLocation, useParams } from "react-router-dom";
import { Post } from "../types/Types";
import { useEffect, useState } from "react";
import axios from "axios";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Card, Container, Row, Col, Carousel, Button } from "react-bootstrap";
import { useAuthContext } from "../AuthContext";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const PostDetail: React.FC = () => {
  const { state } = useLocation();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(state?.post || null);
  const { user } = useAuthContext();

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
  });

  useEffect(() => {
    if (!post && id) {
      axios.get<Post>(`http://localhost:8080/api/posts/${id}`).then((res) => {
        setPost(res.data);
      });
    }
  }, [id, post]);

  useEffect(() => {
    if (post) {
      setCenter({ lat: post.latitude, lng: post.longitude });
      setMarkerPosition({ lat: post.latitude, lng: post.longitude });
    }
  }, [post]);

  if (!isLoaded) return <div>マップ読み込み中...</div>;
  if (!post) return <div>投稿読み込み中...</div>;

  return (
    <Container className="my-4">
      <Row>
        <Col md={8}>
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center!}
              zoom={16}
            >
              <Marker position={markerPosition!} />
            </GoogleMap>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>{post.content}</Card.Title>
              <Card.Text>
                <strong>住所：</strong>
                {post.address}
                <br />
                <strong>投稿者：</strong>
                {post.userName}
                <br />
                <strong>投稿日時：</strong>
                {new Date(post.createdAt).toLocaleString()}
                <br />
                <strong>更新日時：</strong>
                {new Date(post.updatedAt).toLocaleString()}
                <br />
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {post.images && post.images.length > 0 && (
        <Row className="mt-4">
          <Col>
            <Carousel>
              {post.images.map((img) => (
                <Carousel.Item key={img.id}>
                  <img
                    className="d-block w-100"
                    src={`http://localhost:8080${img.imageUrl}`}
                    alt={`Image ${img.sortOrder}`}
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>
        </Row>
      )}

      {user?.username === post.userName && <Button>Edit</Button>}
    </Container>
  );
};

export default PostDetail;
