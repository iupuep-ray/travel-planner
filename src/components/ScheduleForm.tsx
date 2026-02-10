import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { uploadScheduleImage } from '@/services/storageService';
import type { ScheduleType, Schedule } from '@/types';

interface ScheduleFormProps {
  type: Exclude<ScheduleType, 'flight'>;
  onSubmit: (data: ScheduleFormData) => void;
  onCancel: () => void;
  editingSchedule?: Schedule | null;
}

export interface ScheduleFormData {
  name: string;
  address: string;
  startDateTime: string;
  endDateTime: string;
  checkIn?: string;
  checkOut?: string;
  url?: string;
  notes?: string;
  shoppingItems?: string[];
  images?: string[];
}

const ScheduleForm = ({ type, onSubmit, onCancel, editingSchedule }: ScheduleFormProps) => {
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    address: '',
    startDateTime: '',
    endDateTime: '',
    url: '',
    notes: '',
    shoppingItems: [],
    images: [],
  });

  const [currentShoppingItem, setCurrentShoppingItem] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // 編輯模式：載入現有資料
  useEffect(() => {
    if (editingSchedule && editingSchedule.type !== 'flight') {
      if (editingSchedule.type === 'lodging') {
        setFormData({
          name: editingSchedule.name,
          address: editingSchedule.address,
          startDateTime: '',
          endDateTime: '',
          checkIn: editingSchedule.checkIn,
          checkOut: editingSchedule.checkOut,
          url: editingSchedule.url || '',
          notes: editingSchedule.notes || '',
          shoppingItems: [],
          images: editingSchedule.images || [],
        });
      } else if (editingSchedule.type === 'shopping') {
        setFormData({
          name: editingSchedule.name,
          address: editingSchedule.address,
          startDateTime: editingSchedule.startDateTime,
          endDateTime: editingSchedule.endDateTime || '',
          url: editingSchedule.url || '',
          notes: editingSchedule.notes || '',
          shoppingItems: editingSchedule.shoppingItems || [],
          images: editingSchedule.images || [],
        });
      } else {
        setFormData({
          name: editingSchedule.name,
          address: editingSchedule.address,
          startDateTime: editingSchedule.startDateTime,
          endDateTime: editingSchedule.endDateTime || '',
          url: editingSchedule.url || '',
          notes: editingSchedule.notes || '',
          shoppingItems: [],
          images: editingSchedule.images || [],
        });
      }
    }
  }, [editingSchedule]);

  const getTitle = () => {
    const isEditing = !!editingSchedule;
    const titles = {
      lodging: isEditing ? '編輯住宿' : '新增住宿',
      restaurant: isEditing ? '編輯餐廳' : '新增餐廳',
      spot: isEditing ? '編輯景點' : '新增景點',
      shopping: isEditing ? '編輯購物' : '新增購物',
    };
    return titles[type];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 如果有新上傳的圖片,先上傳圖片
    if (imageFiles.length > 0) {
      try {
        setUploadingImages(true);
        const tempId = editingSchedule?.id || `temp_${Date.now()}`;
        const uploadPromises = imageFiles.map(file => uploadScheduleImage(file, tempId));
        const uploadedUrls = await Promise.all(uploadPromises);

        // 合併已有的圖片和新上傳的圖片
        const allImages = [...(formData.images || []), ...uploadedUrls];
        onSubmit({ ...formData, images: allImages });
      } catch (error) {
        console.error('圖片上傳失敗:', error);
        alert('圖片上傳失敗,請稍後再試');
      } finally {
        setUploadingImages(false);
      }
    } else {
      onSubmit(formData);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setFormData({
      ...formData,
      images: (formData.images || []).filter((_, i) => i !== index),
    });
  };

  const addShoppingItem = () => {
    if (currentShoppingItem.trim()) {
      setFormData({
        ...formData,
        shoppingItems: [...(formData.shoppingItems || []), currentShoppingItem.trim()],
      });
      setCurrentShoppingItem('');
    }
  };

  const removeShoppingItem = (index: number) => {
    setFormData({
      ...formData,
      shoppingItems: formData.shoppingItems?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-cream-light p-6 rounded-t-[32px] max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-brown">{getTitle()}</h2>
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-cream flex items-center justify-center transition-transform active:scale-95"
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.CLOSE]} className="text-brown text-xl" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-brown mb-2">
            {type === 'lodging' ? '住宿名稱' : type === 'restaurant' ? '餐廳名稱' : type === 'spot' ? '景點名稱' : '商店名稱'}
            <span className="text-accent ml-1">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
            placeholder="請輸入名稱"
          />
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-brown mb-2">
            地址
            <span className="text-accent ml-1">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
            placeholder="請輸入地址"
          />
        </div>

        {/* DateTime Fields - 住宿使用 check-in/out，其他使用 start/end */}
        {type === 'lodging' ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-bold text-brown mb-2">
                  入住日期
                  <span className="text-accent ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-3 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brown mb-2">
                  退房日期
                  <span className="text-accent ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-3 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown text-sm"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-bold text-brown mb-2">
                  開始時間
                  <span className="text-accent ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDateTime}
                  onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                  className="w-full px-3 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brown mb-2">結束時間</label>
                <input
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                  className="w-full px-3 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown text-sm"
                />
              </div>
            </div>
          </>
        )}

        {/* Shopping Items - 僅購物類型顯示 */}
        {type === 'shopping' && (
          <div className="mb-4">
            <label className="block text-sm font-bold text-brown mb-2">購物清單</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentShoppingItem}
                onChange={(e) => setCurrentShoppingItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addShoppingItem())}
                className="flex-1 px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
                placeholder="輸入物品名稱後按 Enter"
              />
              <button
                type="button"
                onClick={addShoppingItem}
                className="px-6 py-3 rounded-[20px] bg-primary text-white font-bold transition-transform active:scale-95"
              >
                <FontAwesomeIcon icon={['fas', ICON_NAMES.ADD]} />
              </button>
            </div>
            {formData.shoppingItems && formData.shoppingItems.length > 0 && (
              <div className="space-y-2">
                {formData.shoppingItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-2 rounded-[16px] bg-white"
                  >
                    <span className="text-brown">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeShoppingItem(index)}
                      className="text-accent hover:text-accent-dark transition-colors"
                    >
                      <FontAwesomeIcon icon={['fas', ICON_NAMES.CLOSE]} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* URL */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-brown mb-2">網址</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
            placeholder="https://"
          />
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-brown mb-2">備註</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown resize-none"
            placeholder="輸入備註資訊..."
          />
        </div>

        {/* Images Upload */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-brown mb-2">
            <FontAwesomeIcon icon={['fas', ICON_NAMES.IMAGE]} className="mr-2" />
            照片上傳
          </label>

          {/* Existing Images */}
          {formData.images && formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {formData.images.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-[12px] overflow-hidden">
                  <img src={url} alt={`圖片 ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs transition-transform active:scale-95"
                  >
                    <FontAwesomeIcon icon={['fas', ICON_NAMES.DELETE]} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Preview New Images */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-[12px] overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`預覽 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageFile(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs transition-transform active:scale-95"
                  >
                    <FontAwesomeIcon icon={['fas', ICON_NAMES.DELETE]} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 truncate">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className="block w-full py-3 px-4 rounded-[20px] bg-cream text-brown font-bold text-center cursor-pointer transition-transform active:scale-95 border-2 border-dashed border-brown">
            <FontAwesomeIcon icon={['fas', ICON_NAMES.ADD]} className="mr-2" />
            選擇圖片
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
          <p className="text-xs text-brown opacity-60 mt-2 text-center">
            圖片將自動壓縮為 WebP 格式，長邊最大 1200px
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 rounded-[24px] bg-cream text-brown font-bold transition-transform active:scale-95"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={uploadingImages}
            className="flex-1 py-4 rounded-[24px] bg-primary text-white font-bold shadow-soft transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImages ? '上傳中...' : editingSchedule ? '儲存變更' : '新增行程'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;
