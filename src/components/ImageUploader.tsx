import React, { useState } from "react";
import { Form } from "react-bootstrap";

interface PreviewImage {
  file: File;
  previewUrl: string;
}

interface Props {
  onImagesChange: (images: File[]) => void;
  resetSignal: boolean;
}

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 2;

const ImageUploader: React.FC<Props> = ({ onImagesChange, resetSignal }) => {
  const [previews, setPreviews] = useState<PreviewImage[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    for (const file of files) {
      if (validFiles.length >= MAX_IMAGES) {
        alert(`最大${MAX_IMAGES}枚までです。画像は5枚まで選択済みです。`);
        break;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`${file.name} は ${MAX_SIZE_MB}MB を超えています`);
        continue;
      }
      const fileKeySet = new Set(
        previews.map((p) => p.file.name + p.file.size)
      );
      const isDuplicate = fileKeySet.has(file.name + file.size);
      if (isDuplicate) continue;
      validFiles.push(file);
    }

    onImagesChange(validFiles);

    const previewPromises = validFiles.map((file) => {
      return new Promise<PreviewImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ file, previewUrl: reader.result as string });
        };
        reader.onerror = () => {
          reject(new Error("ファイル読み込みエラー"));
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then(setPreviews);
  };

  React.useEffect(() => {
    if (resetSignal) {
      setPreviews([]);
    }
  }, [resetSignal]);

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>画像（複数可）</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
      </Form.Group>

      <div className="row">
        {previews.map((img, idx) => (
          <div className="col-md-4 mb-2" key={idx}>
            <img
              src={img.previewUrl}
              alt={`preview-${idx}`}
              className="img-fluid rounded"
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ImageUploader;
