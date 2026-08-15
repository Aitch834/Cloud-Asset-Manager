/**
 * Web stub for expo-image-picker — native module not available on web.
 */
export const requestMediaLibraryPermissionsAsync = async () => ({ status: "denied" });
export const requestCameraPermissionsAsync = async () => ({ status: "denied" });
export const launchImageLibraryAsync = async () => ({ canceled: true, assets: [] });
export const launchCameraAsync = async () => ({ canceled: true, assets: [] });
export const MediaTypeOptions = { All: "All", Videos: "Videos", Images: "Images" };
export const UIImagePickerPresentationStyle = {};
export const CameraType = { back: "back", front: "front" };
