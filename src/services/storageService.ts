import {
  compressImage as compressImageWithSupabase,
  uploadImage as uploadImageToSupabase,
  deleteImage as deleteImageFromSupabase,
} from '@/supabase/storage';

/**
 * 保留既有 service 介面，底層改走 Supabase Storage。
 */
export const compressImage = compressImageWithSupabase;

/**
 * 上傳圖片到 Supabase Storage。
 * @param file - 圖片檔案
 * @param path - 舊介面保留的路徑參數，僅用第一段資料夾名稱決定 bucket 內資料夾
 * @returns 圖片的公開 URL
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  const [folder = 'schedules'] = path.split('/');
  return uploadImageToSupabase(file, folder);
};

/**
 * 刪除圖片
 * @param pathOrUrl - 舊介面保留參數。若為 URL 則直接刪除；若為純路徑則目前不支援。
 */
export const deleteImage = async (pathOrUrl: string): Promise<void> => {
  if (!pathOrUrl.startsWith('http://') && !pathOrUrl.startsWith('https://')) {
    throw new Error('Supabase deleteImage expects a public URL.');
  }

  await deleteImageFromSupabase(pathOrUrl);
};

/**
 * 從 URL 取得儲存路徑
 * @param url - Supabase Storage 公開 URL
 * @returns bucket 內部路徑
 */
export const getPathFromURL = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/');
    const objectIndex = pathParts.findIndex((part) => part === 'object');
    const publicIndex = pathParts.findIndex((part) => part === 'public');
    const baseIndex = objectIndex >= 0 ? objectIndex : publicIndex;

    if (baseIndex < 0 || pathParts.length <= baseIndex + 2) {
      return '';
    }

    return pathParts.slice(baseIndex + 2).join('/');
  } catch (error) {
    console.error('Error getting path from URL:', error);
    return '';
  }
};

/**
 * 上傳成員頭像
 */
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  return uploadImage(file, `avatars/${userId}_${Date.now()}.webp`);
};

/**
 * 上傳行程圖片
 */
export const uploadScheduleImage = async (file: File, scheduleId: string): Promise<string> => {
  return uploadImage(file, `schedules/${scheduleId}_${Date.now()}.webp`);
};
