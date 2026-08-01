import { r as reactExports } from "./index-DF30SY2m.js";
function useUpload(options = {}) {
  const basePath = options.basePath ?? "/api/storage";
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [progress, setProgress] = reactExports.useState(0);
  const requestUploadUrl = reactExports.useCallback(
    async (file) => {
      const response = await fetch(`${basePath}/uploads/request-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream"
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get upload URL");
      }
      return response.json();
    },
    []
  );
  const uploadToPresignedUrl = reactExports.useCallback(
    async (file, uploadURL) => {
      const response = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream"
        }
      });
      if (!response.ok) {
        throw new Error("Failed to upload file to storage");
      }
    },
    []
  );
  const uploadFile = reactExports.useCallback(
    async (file) => {
      setIsUploading(true);
      setError(null);
      setProgress(0);
      try {
        setProgress(10);
        const uploadResponse = await requestUploadUrl(file);
        setProgress(30);
        await uploadToPresignedUrl(file, uploadResponse.uploadURL);
        setProgress(100);
        options.onSuccess?.(uploadResponse);
        return uploadResponse;
      } catch (err) {
        const error2 = err instanceof Error ? err : new Error("Upload failed");
        setError(error2);
        options.onError?.(error2);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [requestUploadUrl, uploadToPresignedUrl, options]
  );
  const getUploadParameters = reactExports.useCallback(
    async (file) => {
      const response = await fetch(`${basePath}/uploads/request-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream"
        })
      });
      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }
      const data = await response.json();
      return {
        method: "PUT",
        url: data.uploadURL,
        headers: { "Content-Type": file.type || "application/octet-stream" }
      };
    },
    []
  );
  return {
    uploadFile,
    getUploadParameters,
    isUploading,
    error,
    progress
  };
}
export {
  useUpload as u
};
