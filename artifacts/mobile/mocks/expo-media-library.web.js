/**
 * Web stub for expo-media-library — native module not available on web.
 */
export const requestPermissionsAsync = async () => ({ status: "denied" });
export const getPermissionsAsync = async () => ({ status: "denied" });
export const saveToLibraryAsync = async () => {};
export const createAssetAsync = async () => null;
export const getAssetsAsync = async () => ({ assets: [], endCursor: "", hasNextPage: false, totalCount: 0 });
export const deleteAssetsAsync = async () => false;
export const MediaTypeValue = { photo: "photo", video: "video", audio: "audio", unknown: "unknown" };
export const SortByValue = { default: "default", creationTime: "creationTime", modificationTime: "modificationTime", mediaType: "mediaType", width: "width", height: "height", duration: "duration" };
