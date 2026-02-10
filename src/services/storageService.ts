import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';

/**
 * 圖片壓縮選項
 * 根據專案規格：長邊上限 1200px、檔案大小 500KB 以下、轉換為 WebP
 */
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5, // 500KB
  maxWidthOrHeight: 1200, // 長邊上限
  useWebWorker: true,
  fileType: 'image/webp', // 強制轉換為 WebP
};

/**
 * 壓縮圖片檔案
 */
export const compressImage = async (file: File): Promise<File> => {
  try {
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};

/**
 * 上傳圖片到 Firebase Storage
 * @param file - 圖片檔案
 * @param path - 儲存路徑（例如：avatars/user123.webp 或 schedules/img123.webp）
 * @returns 圖片的下載 URL
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    // 壓縮圖片
    const compressedFile = await compressImage(file);

    // 建立 Storage reference
    const storageRef = ref(storage, path);

    // 上傳檔案
    await uploadBytes(storageRef, compressedFile, {
      contentType: 'image/webp',
    });

    // 取得下載 URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * 刪除圖片
 * @param path - 儲存路徑
 */
export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * 從 URL 取得儲存路徑
 * @param url - Firebase Storage URL
 * @returns 儲存路徑
 */
export const getPathFromURL = (url: string): string => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/\/o\/(.+?)\?/);
    return match ? match[1] : '';
  } catch (error) {
    console.error('Error getting path from URL:', error);
    return '';
  }
};

/**
 * 上傳成員頭像
 * @param file - 圖片檔案
 * @param userId - 使用者 ID
 * @returns 頭像的下載 URL
 */
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  const path = `avatars/${userId}_${Date.now()}.webp`;
  return uploadImage(file, path);
};

/**
 * 上傳行程圖片
 * @param file - 圖片檔案
 * @param scheduleId - 行程 ID
 * @returns 圖片的下載 URL
 */
export const uploadScheduleImage = async (file: File, scheduleId: string): Promise<string> => {
  const path = `schedules/${scheduleId}_${Date.now()}.webp`;
  return uploadImage(file, path);
};
