import { useState } from "react";
import { API_URL } from "../utils/api";

export default function ImageUploader({ onUpload, multiple = false }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview((prev) => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);

        // Upload to server
        const formData = new FormData();
        formData.append("file", file);
        
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/files`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        
        const result = await response.json();
        if (result.success) {
          uploadedUrls.push(result.data);
        }
      }

      onUpload(multiple ? uploadedUrls : uploadedUrls[0]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Lỗi khi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="sr-only">Chọn file</span>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50"
        />
      </label>
      
      {uploading && (
        <p className="text-sm text-gray-600">Đang upload...</p>
      )}
      
      {preview.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {preview.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Preview ${idx}`}
              loading="lazy"
              className="w-full h-24 object-cover rounded-md"
            />
          ))}
        </div>
      )}
    </div>
  );
}
