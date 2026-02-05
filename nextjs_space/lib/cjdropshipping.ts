// CJdropshipping API Integration
// Documentation: https://developers.cjdropshipping.com/

const CJ_API_URL = 'https://developers.cjdropshipping.com/api2.0/v1';
const CJ_API_KEY = process.env.CJ_API_KEY || '';

// Types
export interface CJProduct {
  pid: string;
  productName: string;
  productNameEn: string;
  productSku: string;
  productImage: string;
  productWeight: number;
  productType: string;
  categoryId: string;
  categoryName: string;
  sellPrice: number;
  sourceFrom: string;
  variants: CJVariant[];
  description?: string;
  packingWeight?: number;
  packingLength?: number;
  packingWidth?: number;
  packingHeight?: number;
}

export interface CJVariant {
  vid: string;
  variantName: string;
  variantNameEn: string;
  variantSku: string;
  variantImage: string;
  variantWeight: number;
  variantSellPrice: number;
  variantVolume?: number;
  variantProperty?: string;
}

export interface CJCategory {
  categoryId: string;
  categoryName: string;
  categoryNameEn: string;
  parentId: string;
}

export interface CJOrder {
  orderId: string;
  orderNum: string;
  orderStatus: string;
  shippingCountryCode: string;
  shippingProvince: string;
  shippingCity: string;
  shippingAddress: string;
  shippingCustomerName: string;
  shippingPhone: string;
  shippingZip: string;
  productAmount: number;
  postageAmount: number;
  orderAmount: number;
  createDate: string;
  trackingNumber?: string;
  logisticName?: string;
}

export interface CJShippingRate {
  logisticName: string;
  logisticAging: string;
  logisticPrice: number;
  logisticPriceCn: number;
}

export interface CJApiResponse<T> {
  code: number;
  result: boolean;
  message: string;
  data: T;
  requestId?: string;
}

// Helper function for API calls
async function cjRequest<T>(
  endpoint: string,
  method: string = 'GET',
  body?: object
): Promise<CJApiResponse<T>> {
  if (!CJ_API_KEY) {
    throw new Error('CJ_API_KEY not configured');
  }

  const response = await fetch(`${CJ_API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'CJ-Access-Token': CJ_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  
  if (!response.ok || data.code !== 200) {
    console.error('CJdropshipping API Error:', data);
    throw new Error(data.message || 'CJdropshipping API Error');
  }

  return data;
}

// ============ PRODUCT FUNCTIONS ============

// Search products by keyword
export async function searchProducts(
  keyword: string,
  pageNum: number = 1,
  pageSize: number = 20
): Promise<{ list: CJProduct[]; total: number }> {
  const response = await cjRequest<{ list: CJProduct[]; total: number }>(
    '/product/list',
    'POST',
    {
      productNameEn: keyword,
      pageNum,
      pageSize,
    }
  );
  return response.data;
}

// Get product details by ID
export async function getProductById(pid: string): Promise<CJProduct> {
  const response = await cjRequest<CJProduct>(
    `/product/query?pid=${pid}`,
    'GET'
  );
  return response.data;
}

// Get product details by SKU
export async function getProductBySku(sku: string): Promise<CJProduct> {
  const response = await cjRequest<CJProduct>(
    `/product/query?productSku=${sku}`,
    'GET'
  );
  return response.data;
}

// Get product categories
export async function getCategories(): Promise<CJCategory[]> {
  const response = await cjRequest<CJCategory[]>('/product/getCategory', 'GET');
  return response.data;
}

// Get shipping rates for a product
export async function getShippingRates(
  startCountryCode: string,
  endCountryCode: string,
  productWeight: number,
  productSku: string
): Promise<CJShippingRate[]> {
  const response = await cjRequest<CJShippingRate[]>(
    '/logistic/freightCalculate',
    'POST',
    {
      startCountryCode,
      endCountryCode,
      products: [{
        quantity: 1,
        vid: productSku,
        weight: productWeight,
      }],
    }
  );
  return response.data;
}

// ============ ORDER FUNCTIONS ============

// Create order in CJdropshipping
export async function createOrder(orderData: {
  orderNumber: string;
  shippingZip: string;
  shippingCountry: string;
  shippingProvince: string;
  shippingCity: string;
  shippingAddress: string;
  shippingCustomerName: string;
  shippingPhone: string;
  products: {
    vid: string;
    quantity: number;
  }[];
  logisticName?: string;
  remark?: string;
}): Promise<{ orderId: string; orderNum: string }> {
  const response = await cjRequest<{ orderId: string; orderNum: string }>(
    '/shopping/order/createOrder',
    'POST',
    {
      orderNumber: orderData.orderNumber,
      shippingZip: orderData.shippingZip,
      shippingCountryCode: orderData.shippingCountry,
      shippingProvince: orderData.shippingProvince,
      shippingCity: orderData.shippingCity,
      shippingAddress: orderData.shippingAddress,
      shippingCustomerName: orderData.shippingCustomerName,
      shippingPhone: orderData.shippingPhone,
      products: orderData.products,
      logisticName: orderData.logisticName || 'CJPacket Ordinary',
      remark: orderData.remark || 'PETCOM Order',
    }
  );
  return response.data;
}

// Get order details
export async function getOrderById(orderId: string): Promise<CJOrder> {
  const response = await cjRequest<CJOrder>(
    `/shopping/order/getOrderDetail?orderId=${orderId}`,
    'GET'
  );
  return response.data;
}

// Get order tracking
export async function getOrderTracking(orderId: string): Promise<{
  trackingNumber: string;
  logisticName: string;
  trackInfo: { date: string; status: string; desc: string }[];
}> {
  const response = await cjRequest<{
    trackingNumber: string;
    logisticName: string;
    trackInfo: { date: string; status: string; desc: string }[];
  }>(
    `/logistic/getTrackInfo?orderId=${orderId}`,
    'GET'
  );
  return response.data;
}

// List orders
export async function listOrders(
  pageNum: number = 1,
  pageSize: number = 50,
  orderStatus?: string
): Promise<{ list: CJOrder[]; total: number }> {
  const body: Record<string, unknown> = { pageNum, pageSize };
  if (orderStatus) body.orderStatus = orderStatus;
  
  const response = await cjRequest<{ list: CJOrder[]; total: number }>(
    '/shopping/order/list',
    'POST',
    body
  );
  return response.data;
}

// Confirm order (pay for order)
export async function confirmOrder(orderId: string): Promise<boolean> {
  const response = await cjRequest<boolean>(
    '/shopping/order/confirmOrder',
    'POST',
    { orderId }
  );
  return response.result;
}

// ============ INVENTORY FUNCTIONS ============

// Check product inventory/availability
export async function checkInventory(
  vid: string,
  quantity: number = 1
): Promise<{ available: boolean; stock: number }> {
  try {
    const response = await cjRequest<{ available: boolean; stock: number }>(
      '/product/stock',
      'POST',
      { vid, quantity }
    );
    return response.data;
  } catch {
    // If API fails, assume available
    return { available: true, stock: 999 };
  }
}

// ============ UTILITY FUNCTIONS ============

// Check if CJ API is configured
export function isCJConfigured(): boolean {
  return !!CJ_API_KEY;
}

// Convert CJ product to PETCOM product format
export function convertToLocalProduct(cjProduct: CJProduct, margin: number = 50) {
  const costPrice = cjProduct.sellPrice;
  const salePrice = Math.ceil(costPrice * (1 + margin / 100));
  
  return {
    name: cjProduct.productNameEn || cjProduct.productName,
    description: cjProduct.description || `${cjProduct.productNameEn}\n\nImported from CJdropshipping`,
    price: salePrice,
    compareAtPrice: Math.ceil(salePrice * 1.2),
    costPrice: costPrice,
    images: [cjProduct.productImage],
    sku: `CJ-${cjProduct.productSku}`,
    weight: cjProduct.productWeight,
    stock: 999, // Dropshipping - virtual stock
    supplierSku: cjProduct.productSku,
    supplierPrice: costPrice,
    supplierUrl: `https://cjdropshipping.com/product/${cjProduct.pid}`,
    isDropshipping: true,
    cjProductId: cjProduct.pid,
    variants: cjProduct.variants?.map(v => ({
      name: v.variantNameEn || v.variantName,
      sku: v.variantSku,
      price: Math.ceil(v.variantSellPrice * (1 + margin / 100)),
      costPrice: v.variantSellPrice,
      image: v.variantImage,
    })),
  };
}

// CJ Order Status mapping
export const CJ_ORDER_STATUS = {
  'CREATED': { label: 'Creada', color: 'bg-gray-100 text-gray-800' },
  'IN_CART': { label: 'En Carrito', color: 'bg-blue-100 text-blue-800' },
  'UNPAID': { label: 'Sin Pagar', color: 'bg-yellow-100 text-yellow-800' },
  'UNSHIPPED': { label: 'Por Enviar', color: 'bg-orange-100 text-orange-800' },
  'SHIPPED': { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800' },
  'DELIVERED': { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  'CANCELLED': { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

// Pet-related categories in CJdropshipping
export const CJ_PET_CATEGORIES = [
  'Pet Supplies',
  'Pet Food',
  'Pet Clothing',
  'Pet Toys',
  'Pet Grooming',
  'Pet Accessories',
  'Dog Supplies',
  'Cat Supplies',
  'Bird Supplies',
  'Fish Supplies',
];
