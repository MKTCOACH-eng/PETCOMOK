// PETCOM Brand Colors - Paleta obligatoria
export const COLORS = {
  background: '#FFFFFF',
  backgroundAlt: '#F7F8FA',
  borders: '#E6E8EC',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  coral: '#e67c73',
  yellow: '#f7cb4d',
  green: '#41b375',
  blue: '#7baaf7',
  purple: '#ba67c8',
  success: '#41b375',
  warning: '#f7cb4d',
  error: '#e67c73',
} as const;

// Pet Types
export const PET_TYPES = [
  { id: 'dog', label: 'Perro', icon: '🐕' },
  { id: 'cat', label: 'Gato', icon: '🐈' },
  { id: 'bird', label: 'Ave', icon: '🦜' },
  { id: 'fish', label: 'Pez', icon: '🐠' },
  { id: 'rodent', label: 'Roedor', icon: '🐹' },
  { id: 'reptile', label: 'Reptil', icon: '🦎' },
] as const;

// Product Categories
export const CATEGORIES = [
  { id: 'food', label: 'Alimento' },
  { id: 'toys', label: 'Juguetes' },
  { id: 'accessories', label: 'Accesorios' },
  { id: 'hygiene', label: 'Higiene & Cuidado' },
  { id: 'health', label: 'Salud' },
  { id: 'furniture', label: 'Muebles & Camas' },
] as const;

// Order Status
export const ORDER_STATUS = [
  { id: 'pending', label: 'Pendiente' },
  { id: 'processing', label: 'Procesando' },
  { id: 'shipped', label: 'Enviado' },
  { id: 'delivered', label: 'Entregado' },
  { id: 'cancelled', label: 'Cancelado' },
] as const;

// Video Hero URL
export const HERO_VIDEO_URL = 'https://yxdamvwvnbkukcyzcemx.supabase.co/storage/v1/object/public/Hero_video/202602040234.mp4';
