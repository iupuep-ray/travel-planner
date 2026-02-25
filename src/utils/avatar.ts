const BASE_URL = import.meta.env.BASE_URL;

const getImagePath = (path: string) => `${BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;

export const DEFAULT_AVATAR_IMAGES = Array.from({ length: 11 }, (_, index) =>
  getImagePath(`/newpic/defult_profile_pic${index + 1}.png`)
);

export const getDefaultAvatar = (seed: string): string => {
  const normalizedSeed = seed || 'member';
  const hash = Array.from(normalizedSeed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_AVATAR_IMAGES[hash % DEFAULT_AVATAR_IMAGES.length];
};
