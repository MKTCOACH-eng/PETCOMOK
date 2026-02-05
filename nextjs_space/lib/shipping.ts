// Envia.com Integration - Simulated for Development
// When ready for production, replace simulated functions with real API calls

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
}

export interface PackageInfo {
  weight: number; // kg
  length: number; // cm
  width: number;  // cm
  height: number; // cm
  declaredValue: number; // MXN
}

export interface ShippingRate {
  id: string;
  carrier: string;
  carrierName: string;
  carrierLogo: string;
  serviceType: string;
  serviceName: string;
  deliveryDays: number;
  estimatedDelivery: string;
  price: number;
  currency: string;
  zone: string;
}

export interface ShipmentResult {
  success: boolean;
  shipmentId: string;
  trackingNumber: string;
  trackingUrl: string;
  labelUrl: string;
  carrier: string;
  serviceName: string;
  estimatedDelivery: Date;
}

export interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  description: string;
  location: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  carrierName: string;
  status: string;
  statusLabel: string;
  estimatedDelivery: string;
  events: TrackingEvent[];
}

// Carrier configurations
export const CARRIERS = {
  fedex: {
    name: 'FedEx',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/FedEx_Corporation_-_2016_Logo.svg/200px-FedEx_Corporation_-_2016_Logo.svg.png',
    services: [
      { type: 'express', name: 'FedEx Express', days: 1, baseCost: 250 },
      { type: 'standard', name: 'FedEx Standard', days: 3, baseCost: 150 },
      { type: 'economy', name: 'FedEx Economy', days: 5, baseCost: 99 },
    ],
  },
  dhl: {
    name: 'DHL',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/DHL_Logo.svg/200px-DHL_Logo.svg.png',
    services: [
      { type: 'express', name: 'DHL Express', days: 1, baseCost: 280 },
      { type: 'standard', name: 'DHL Standard', days: 3, baseCost: 160 },
    ],
  },
  estafeta: {
    name: 'Estafeta',
    logo: 'https://cdn.theorg.com/d16cdae2-fea2-4861-94e6-3e039a5a845e_medium.jpg',
    services: [
      { type: 'express', name: 'Estafeta Día Siguiente', days: 1, baseCost: 180 },
      { type: 'standard', name: 'Estafeta Terrestre', days: 4, baseCost: 95 },
      { type: 'economy', name: 'Estafeta Económico', days: 6, baseCost: 75 },
    ],
  },
  redpack: {
    name: 'Redpack',
    logo: 'https://www.redpack.com.mx/wp-content/uploads/2021/06/logored.png',
    services: [
      { type: 'express', name: 'Redpack Express', days: 2, baseCost: 140 },
      { type: 'standard', name: 'Redpack Regular', days: 4, baseCost: 85 },
    ],
  },
  paquetexpress: {
    name: 'Paquetexpress',
    logo: 'https://play-lh.googleusercontent.com/SIkRIoUcgdqGCyxV3tvlQJCuWNqXOUPicE4x2iZ0muOLXY7YZJDdBJSi70FdmxNQtPs',
    services: [
      { type: 'standard', name: 'Terrestre', days: 5, baseCost: 70 },
      { type: 'economy', name: 'Económico', days: 7, baseCost: 55 },
    ],
  },
};

// Mexico states and zones for shipping calculation
export const MEXICO_ZONES: Record<string, { name: string; zone: number }> = {
  'AGS': { name: 'Aguascalientes', zone: 2 },
  'BC': { name: 'Baja California', zone: 4 },
  'BCS': { name: 'Baja California Sur', zone: 4 },
  'CAM': { name: 'Campeche', zone: 3 },
  'CHIS': { name: 'Chiapas', zone: 4 },
  'CHIH': { name: 'Chihuahua', zone: 3 },
  'CDMX': { name: 'Ciudad de México', zone: 1 },
  'COAH': { name: 'Coahuila', zone: 2 },
  'COL': { name: 'Colima', zone: 2 },
  'DGO': { name: 'Durango', zone: 3 },
  'GTO': { name: 'Guanajuato', zone: 1 },
  'GRO': { name: 'Guerrero', zone: 3 },
  'HGO': { name: 'Hidalgo', zone: 1 },
  'JAL': { name: 'Jalisco', zone: 1 },
  'MEX': { name: 'Estado de México', zone: 1 },
  'MICH': { name: 'Michoacán', zone: 2 },
  'MOR': { name: 'Morelos', zone: 1 },
  'NAY': { name: 'Nayarit', zone: 2 },
  'NL': { name: 'Nuevo León', zone: 2 },
  'OAX': { name: 'Oaxaca', zone: 3 },
  'PUE': { name: 'Puebla', zone: 1 },
  'QRO': { name: 'Querétaro', zone: 1 },
  'QROO': { name: 'Quintana Roo', zone: 4 },
  'SLP': { name: 'San Luis Potosí', zone: 2 },
  'SIN': { name: 'Sinaloa', zone: 3 },
  'SON': { name: 'Sonora', zone: 4 },
  'TAB': { name: 'Tabasco', zone: 3 },
  'TAM': { name: 'Tamaulipas', zone: 2 },
  'TLAX': { name: 'Tlaxcala', zone: 1 },
  'VER': { name: 'Veracruz', zone: 2 },
  'YUC': { name: 'Yucatán', zone: 4 },
  'ZAC': { name: 'Zacatecas', zone: 2 },
};

// Get zone from zip code (simplified)
export function getZoneFromZipCode(zipCode: string): number {
  const prefix = zipCode.substring(0, 2);
  const zipZones: Record<string, number> = {
    '01': 1, '02': 1, '03': 1, '04': 1, '05': 1, '06': 1, '07': 1, '08': 1, '09': 1, '10': 1, '11': 1, '12': 1, '13': 1, '14': 1, '15': 1, '16': 1, // CDMX
    '50': 1, '51': 1, '52': 1, '53': 1, '54': 1, '55': 1, '56': 1, '57': 1, // EdoMex
    '44': 1, '45': 1, '46': 1, // Jalisco
    '64': 2, '65': 2, '66': 2, '67': 2, // NL
    '20': 2, // Aguascalientes
    '36': 1, '37': 1, '38': 1, // Guanajuato
    '76': 1, // Querétaro
    '72': 1, '73': 1, '74': 1, '75': 1, // Puebla
    '62': 1, // Morelos
  };
  return zipZones[prefix] || 3; // Default to zone 3 for other areas
}

// Calculate shipping rates (simulated Envia.com response)
export async function getShippingRates(
  originZipCode: string,
  destinationZipCode: string,
  packageInfo: PackageInfo
): Promise<ShippingRate[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const zone = getZoneFromZipCode(destinationZipCode);
  const zoneMultiplier = 1 + (zone - 1) * 0.25; // Zone 1: 1x, Zone 2: 1.25x, Zone 3: 1.5x, Zone 4: 1.75x
  
  // Weight factor
  const weightFactor = Math.max(1, packageInfo.weight / 1); // per kg
  
  // Calculate volumetric weight
  const volumetricWeight = (packageInfo.length * packageInfo.width * packageInfo.height) / 5000;
  const chargeableWeight = Math.max(packageInfo.weight, volumetricWeight);
  
  const rates: ShippingRate[] = [];
  
  for (const [carrierId, carrier] of Object.entries(CARRIERS)) {
    for (const service of carrier.services) {
      const basePrice = service.baseCost * zoneMultiplier * Math.max(1, chargeableWeight);
      const finalPrice = Math.round(basePrice * 100) / 100;
      
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + service.days);
      
      rates.push({
        id: `${carrierId}_${service.type}_${Date.now()}`,
        carrier: carrierId,
        carrierName: carrier.name,
        carrierLogo: carrier.logo,
        serviceType: service.type,
        serviceName: service.name,
        deliveryDays: service.days,
        estimatedDelivery: deliveryDate.toLocaleDateString('es-MX', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }),
        price: finalPrice,
        currency: 'MXN',
        zone: `Zona ${zone}`,
      });
    }
  }
  
  // Sort by price
  return rates.sort((a, b) => a.price - b.price);
}

// Create shipment and generate label (simulated)
export async function createShipment(
  rateId: string,
  origin: ShippingAddress,
  destination: ShippingAddress,
  packageInfo: PackageInfo
): Promise<ShipmentResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Parse carrier from rateId
  const [carrier, serviceType] = rateId.split('_');
  const carrierConfig = CARRIERS[carrier as keyof typeof CARRIERS];
  const service = carrierConfig?.services.find(s => s.type === serviceType);
  
  // Generate simulated tracking number
  const trackingNumber = `${carrier.toUpperCase()}${Date.now().toString(36).toUpperCase()}MX`;
  
  // Calculate estimated delivery
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (service?.days || 3));
  
  return {
    success: true,
    shipmentId: `ENVIA-${Date.now()}`,
    trackingNumber,
    trackingUrl: `https://tracking.envia.com/${trackingNumber}`,
    labelUrl: `/api/shipping/label/${trackingNumber}`, // Generate label endpoint
    carrier: carrierConfig?.name || carrier,
    serviceName: service?.name || 'Standard',
    estimatedDelivery,
  };
}

// Get tracking info (simulated)
export async function getTrackingInfo(trackingNumber: string): Promise<TrackingInfo | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  // Extract carrier from tracking number
  const carrierPrefix = trackingNumber.substring(0, 3).toLowerCase();
  let carrier = 'fedex';
  let carrierName = 'FedEx';
  
  if (carrierPrefix === 'dhl') { carrier = 'dhl'; carrierName = 'DHL'; }
  else if (carrierPrefix === 'est') { carrier = 'estafeta'; carrierName = 'Estafeta'; }
  else if (carrierPrefix === 'red') { carrier = 'redpack'; carrierName = 'Redpack'; }
  
  // Simulate tracking events based on a pseudo-random seed from tracking number
  const seed = trackingNumber.charCodeAt(trackingNumber.length - 1);
  const daysAgo = seed % 5;
  
  const events: TrackingEvent[] = [];
  const today = new Date();
  
  // Create event history
  const baseDate = new Date(today);
  baseDate.setDate(baseDate.getDate() - daysAgo);
  
  events.push({
    date: baseDate.toLocaleDateString('es-MX'),
    time: '09:30',
    status: 'created',
    description: 'Guía generada',
    location: 'CDMX, México',
  });
  
  if (daysAgo >= 1) {
    const pickupDate = new Date(baseDate);
    pickupDate.setDate(pickupDate.getDate() + 1);
    events.push({
      date: pickupDate.toLocaleDateString('es-MX'),
      time: '14:00',
      status: 'picked_up',
      description: 'Paquete recolectado',
      location: 'CDMX, México',
    });
  }
  
  if (daysAgo >= 2) {
    const transitDate = new Date(baseDate);
    transitDate.setDate(transitDate.getDate() + 2);
    events.push({
      date: transitDate.toLocaleDateString('es-MX'),
      time: '08:45',
      status: 'in_transit',
      description: 'En tránsito hacia destino',
      location: 'Centro de Distribución',
    });
  }
  
  if (daysAgo >= 3) {
    const outDate = new Date(baseDate);
    outDate.setDate(outDate.getDate() + 3);
    events.push({
      date: outDate.toLocaleDateString('es-MX'),
      time: '07:30',
      status: 'out_for_delivery',
      description: 'En camino para entrega',
      location: 'Ciudad de destino',
    });
  }
  
  if (daysAgo >= 4) {
    const deliveredDate = new Date(baseDate);
    deliveredDate.setDate(deliveredDate.getDate() + 4);
    events.push({
      date: deliveredDate.toLocaleDateString('es-MX'),
      time: '11:15',
      status: 'delivered',
      description: 'Entregado - Recibió: Persona en domicilio',
      location: 'Destino final',
    });
  }
  
  // Determine current status
  const latestEvent = events[events.length - 1];
  const statusLabels: Record<string, string> = {
    'created': 'Guía Generada',
    'picked_up': 'Recolectado',
    'in_transit': 'En Tránsito',
    'out_for_delivery': 'En Camino',
    'delivered': 'Entregado',
  };
  
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (4 - daysAgo));
  
  return {
    trackingNumber,
    carrier,
    carrierName,
    status: latestEvent.status,
    statusLabel: statusLabels[latestEvent.status] || latestEvent.status,
    estimatedDelivery: latestEvent.status === 'delivered' 
      ? 'Entregado' 
      : estimatedDelivery.toLocaleDateString('es-MX', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }),
    events: events.reverse(), // Most recent first
  };
}

// Shipping status labels and colors
export const SHIPMENT_STATUS = {
  pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-800' },
  label_created: { label: 'Guía Generada', color: 'bg-blue-100 text-blue-800' },
  picked_up: { label: 'Recolectado', color: 'bg-indigo-100 text-indigo-800' },
  in_transit: { label: 'En Tránsito', color: 'bg-yellow-100 text-yellow-800' },
  out_for_delivery: { label: 'En Camino', color: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  exception: { label: 'Excepción', color: 'bg-red-100 text-red-800' },
  returned: { label: 'Devuelto', color: 'bg-purple-100 text-purple-800' },
};

// Default package dimensions for pet products
export const DEFAULT_PACKAGE: PackageInfo = {
  weight: 2, // 2 kg default
  length: 30,
  width: 20,
  height: 15,
  declaredValue: 500,
};

// Origin address (PETCOM warehouse)
export const PETCOM_ORIGIN: ShippingAddress = {
  name: 'PETCOM MX',
  street: 'Av. Insurgentes Sur 1234, Col. Del Valle',
  city: 'Ciudad de México',
  state: 'CDMX',
  zipCode: '03100',
  phone: '5555551234',
  email: 'envios@petcom.mx',
};
