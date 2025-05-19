import React, { useState } from "react";

interface PreviewImage {
  file: File;
  previewUrl: string;
}

const MAX_FILE_SIZE_MB = 2;
const VALID_TYPES = ["image/jpeg", "image/png"];

const ImageUploader: React.FC = () => {
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!VALID_TYPES.includes(file.type)) {
      return "JPEGまたはPNG形式のみ対応しています。";
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return "ファイルサイズは2MB以下にしてください。";
    }
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);

      fileArray.forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.src = reader.result as string;

          img.onload = () => {
            const resizedDataUrl = resizeImage(img, 800, 800); // max width/height
            setImages((prev) => [
              ...prev,
              { file, previewUrl: resizedDataUrl },
            ]);
            setError(null);
          };
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const resizeImage = (
    img: HTMLImageElement,
    maxWidth: number,
    maxHeight: number
  ): string => {
    const canvas = document.createElement("canvas");
    let width = img.width;
    let height = img.height;

    // アスペクト比を保ってリサイズ
    if (width > height) {
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg");
  };

  const handleDelete = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const formData = new FormData();
    images.forEach((imgObj, idx) => {
      formData.append("images", imgObj.file);
    });

    try {
      const response = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("アップロード成功！");
      } else {
        alert("アップロードに失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">画像アップロード</h3>
      <input
        type="file"
        accept="image/*"
        multiple
        className="form-control mb-3"
        onChange={handleFileChange}
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {images.map((img, idx) => (
          <div className="col-md-3 mb-3" key={idx}>
            <div className="card">
              <img
                src={img.previewUrl}
                className="card-img-top"
                alt={`preview-${idx}`}
              />
              <div className="card-body text-center">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(idx)}
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length > 0 && (
        <button className="btn btn-primary mt-3" onClick={handleUpload}>
          アップロード
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
