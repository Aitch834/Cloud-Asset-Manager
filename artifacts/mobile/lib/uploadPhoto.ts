import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { getMobileAuthToken } from "@/lib/authToken";

export async function getAuthToken(): Promise<string | null> {
  return getMobileAuthToken();
}

export function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

export async function uploadPhotoToStorage(
  photoUri: string,
  apiBase: string,
  fileName = "attachment.jpg",
): Promise<string | null> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const presignRes = await fetch(`${apiBase}/api/storage/uploads/request-url`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: fileName, size: 0, contentType: "image/jpeg" }),
    });
    if (!presignRes.ok) return null;
    const { uploadURL, objectPath } = await presignRes.json();

    const fileRes = await fetch(photoUri);
    const blob = await fileRes.blob();
    const putRes = await fetch(uploadURL, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": blob.type || "image/jpeg" },
    });
    if (!putRes.ok) return null;
    return objectPath as string;
  } catch {
    return null;
  }
}

export async function postRecordAttachment(
  apiBase: string,
  farmId: string | number,
  recordType: string,
  recordId: string,
  objectPath: string,
  fileName = "attachment.jpg",
): Promise<boolean> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${apiBase}/api/farms/${farmId}/record-attachments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        recordType,
        recordId: String(recordId),
        fileUrl: `/api/storage${objectPath}`,
        fileKey: objectPath,
        fileName,
        fileSize: null,
        mimeType: "image/jpeg",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pickPhoto(promptTitle: string): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert(
      promptTitle,
      "Photograph a document or use an existing photo.",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Camera access is needed to take a photo.");
              resolve(null);
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              quality: 0.85,
              allowsEditing: false,
            });
            if (!result.canceled && result.assets[0]) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              resolve(result.assets[0].uri);
            } else {
              resolve(null);
            }
          },
        },
        {
          text: "Photo Library",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Photo library access is needed.");
              resolve(null);
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              quality: 0.85,
              allowsEditing: false,
            });
            if (!result.canceled && result.assets[0]) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              resolve(result.assets[0].uri);
            } else {
              resolve(null);
            }
          },
        },
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
      ],
    );
  });
}
