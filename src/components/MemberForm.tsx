import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { uploadAvatar } from '@/services/storageService';
import { useAuth } from '@/contexts/AuthContext';
import AvatarCropper from './AvatarCropper';

interface MemberFormProps {
  initialData?: MemberFormData;
  onSubmit: (data: MemberFormData) => void;
  onCancel: () => void;
}

export interface MemberFormData {
  name: string;
  email: string;
  avatar?: string;
}

const MemberForm = ({ initialData, onSubmit, onCancel }: MemberFormProps) => {
  // 預設頭像列表
  const BASE_URL = import.meta.env.BASE_URL;
  const getImagePath = (path: string) => `${BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;
  const DEFAULT_AVATARS = [
    getImagePath('pic/defult-profile-pic1.png'),
    getImagePath('pic/defult-profile-pic2.png'),
    getImagePath('pic/defult-profile-pic3.png'),
  ];
  const { user } = useAuth();
  const [formData, setFormData] = useState<MemberFormData>(
    initialData || {
      name: '',
      email: '',
      avatar: undefined,
    }
  );
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialData?.avatar);
  const [showDefaultAvatars, setShowDefaultAvatars] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案');
        return;
      }

      // 檢查檔案大小（限制 5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片檔案大小不得超過 5MB');
        return;
      }

      // 讀取檔案並開啟裁切器
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageToCrop(result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // 將 Blob 轉換為 File
    const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    setUploadedFile(croppedFile);

    // 產生預覽 URL
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPreviewUrl(previewUrl);

    // 關閉裁切器
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let avatarUrl = formData.avatar;

      // 如果有新上傳的檔案，先上傳到 Firebase Storage
      if (uploadedFile && user) {
        avatarUrl = await uploadAvatar(uploadedFile, user.uid);
      }

      // 提交表單資料
      onSubmit({
        ...formData,
        avatar: avatarUrl,
      });
    } catch (error) {
      console.error('上傳頭像失敗:', error);
      alert('上傳頭像失敗，請稍後再試');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = () => {
    setPreviewUrl(undefined);
    setFormData({ ...formData, avatar: undefined });
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectDefaultAvatar = (avatarUrl: string) => {
    setPreviewUrl(avatarUrl);
    setFormData({ ...formData, avatar: avatarUrl });
    setUploadedFile(null);
    setShowDefaultAvatars(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-cream-light pt-6 px-6 pb-32 rounded-t-[32px] max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-brown">
          {isEditMode ? '編輯成員' : '新增成員'}
        </h2>
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-cream flex items-center justify-center transition-transform active:scale-95"
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.CLOSE]} className="text-brown text-xl" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Avatar Upload */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-brown mb-3">頭像（選填）</label>
          <div className="flex items-center gap-4">
            {/* Avatar Preview */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: '#7AC5AD' }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                formData.name.charAt(0) || '?'
              )}
            </div>

            {/* Upload Buttons */}
            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="block w-full py-3 px-4 rounded-[20px] bg-primary text-white text-center font-bold cursor-pointer transition-transform active:scale-95"
              >
                <FontAwesomeIcon icon={['fas', ICON_NAMES.CAMERA]} className="mr-2" />
                {previewUrl ? '更換頭像' : '上傳頭像'}
              </label>
              <button
                type="button"
                onClick={() => setShowDefaultAvatars(!showDefaultAvatars)}
                className="block w-full py-3 px-4 rounded-[20px] bg-accent text-white text-center font-bold transition-transform active:scale-95"
              >
                <FontAwesomeIcon icon={['fas', ICON_NAMES.IMAGE]} className="mr-2" />
                選擇預設頭像
              </button>
              {previewUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="block w-full py-3 px-4 rounded-[20px] bg-red-100 text-red-500 text-center font-bold transition-transform active:scale-95"
                >
                  <FontAwesomeIcon icon={['fas', ICON_NAMES.DELETE]} className="mr-2" />
                  移除頭像
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-brown opacity-60 mt-2">
            支援 JPG、PNG、GIF 格式，檔案大小不超過 5MB
          </p>

          {/* Default Avatars Selection */}
          {showDefaultAvatars && (
            <div className="mt-4 p-4 rounded-[20px] bg-white border-2 border-cream">
              <h4 className="text-sm font-bold text-brown mb-3">選擇預設頭像</h4>
              <div className="grid grid-cols-3 gap-3">
                {DEFAULT_AVATARS.map((avatarUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectDefaultAvatar(avatarUrl)}
                    className={`relative rounded-full overflow-hidden transition-all active:scale-95 ${
                      previewUrl === avatarUrl
                        ? 'ring-4 ring-primary'
                        : 'hover:ring-2 hover:ring-primary/50'
                    }`}
                  >
                    <img
                      src={avatarUrl}
                      alt={`預設頭像 ${index + 1}`}
                      className="w-full h-full object-cover aspect-square"
                    />
                    {previewUrl === avatarUrl && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={['fas', ICON_NAMES.CHECK]}
                          className="text-white text-2xl drop-shadow-lg"
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-brown mb-2">
            姓名
            <span className="text-accent ml-1">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
            placeholder="例如：小明"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-brown mb-2">
            Email
            <span className="text-accent ml-1">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
            placeholder="例如：ming@example.com"
          />
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
            disabled={isUploading}
            className="flex-1 py-4 rounded-[24px] bg-primary text-white font-bold shadow-soft transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? '上傳中...' : isEditMode ? '儲存變更' : '新增成員'}
          </button>
        </div>
      </form>

      {/* Avatar Cropper */}
      {showCropper && (
        <AvatarCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default MemberForm;
