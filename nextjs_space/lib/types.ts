// Core Types for PETCOM

export type PetType = 'dog' | 'cat' | 'bird' | 'fish' | 'rodent' | 'reptile';
export type CategoryType = 'food' | 'toys' | 'accessories' | 'hygiene' | 'health' | 'furniture';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  isAdmin?: boolean;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  type: PetType;
  breed?: string;
  age?: number;
  weight?: number;
  photoUrl?: string;
  isActive?: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  petTypes: PetType[];
  stock: number;
  featured?: boolean;
  tags?: string[];
  recommendationReason?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  discount: number;
  shippingAddress?: string;
  items: OrderItem[];
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  author?: string;
  relatedProducts?: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  activePetId?: string;
  emailNotifications: boolean;
  recommendations: boolean;
}
