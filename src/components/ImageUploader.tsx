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

const ImageUploader: React.FC<Props> = ({ onImagesChange, resetSignal }) => {
  const [previews, setPreviews] = useState<PreviewImage[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.size < 2 * 1024 * 1024); // 2MB制限
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
