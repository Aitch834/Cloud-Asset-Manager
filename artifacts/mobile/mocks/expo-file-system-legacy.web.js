/**
 * Web stub for expo-file-system/legacy — native module not available on web.
 */
export const cacheDirectory = "cache://";
export const documentDirectory = "documents://";
export const downloadAsync = async (uri, fileUri) => ({ uri: fileUri, status: 200, headers: {}, md5: undefined });
export const readAsStringAsync = async () => "";
export const writeAsStringAsync = async () => {};
export const deleteAsync = async () => {};
export const moveAsync = async () => {};
export const copyAsync = async () => {};
export const makeDirectoryAsync = async () => {};
export const readDirectoryAsync = async () => [];
export const getInfoAsync = async () => ({ exists: false, isDirectory: false, uri: "", size: 0, modificationTime: 0 });
export const EncodingType = { UTF8: "utf8", Base64: "base64" };
