import { supabase, isSupabaseConfigured } from './config';
import imageCompression from 'browser-image-compression';

const BUCKET_NAME = 'travel-images';

// 圖片壓縮選項（符合規格：長邊上限 1200px、檔案大小 500KB 以下、轉換為 WebP）
const compressionOptions = {
  maxSizeMB: 0.5, // 500KB
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: 'image/webp',
};

/**
 * 壓縮圖片
 */
export const compressImage = async (file: File): Promise<File> => {
  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw error;
  }
};

/**
 * 上傳圖片到 Supabase Storage
 */
export const uploadImage = async (file: File, folder: string = 'schedules'): Promise<string> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please set up Supabase Storage.');
  }

  try {
    // 壓縮圖片
    const compressedFile = await compressImage(file);

    // 生成唯一檔名
    const fileExt = 'webp';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 上傳到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, compressedFile, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // 取得公開 URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};

/**
 * 上傳多張圖片
 */
export const uploadImages = async (files: File[], folder: string = 'schedules'): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImage(file, folder));
  return Promise.all(uploadPromises);
};

/**
 * 刪除圖片
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    // 從 URL 中提取檔案路徑
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(BUCKET_NAME) + 1).join('/');

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Image deletion failed:', error);
    throw error;
  }
};

/**
 * 刪除多張圖片
 */
export const deleteImages = async (imageUrls: string[]): Promise<void> => {
  const deletePromises = imageUrls.map(url => deleteImage(url));
  await Promise.all(deletePromises);
};

/**
 * 檢查圖片上傳功能是否可用
 */
export const isImageUploadAvailable = (): boolean => {
  return isSupabaseConfigured;
};
