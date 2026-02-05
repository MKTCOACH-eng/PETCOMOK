import { NextResponse } from 'next/server';
import { getShippingRates, DEFAULT_PACKAGE, PETCOM_ORIGIN } from '@/lib/shipping';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { zipCode, weight, declaredValue } = body;

    if (!zipCode || zipCode.length !== 5) {
      return NextResponse.json(
        { error: 'Código postal inválido' },
        { status: 400 }
      );
    }

    // Use provided weight or default
    const packageInfo = {
      ...DEFAULT_PACKAGE,
      weight: weight || DEFAULT_PACKAGE.weight,
      declaredValue: declaredValue || DEFAULT_PACKAGE.declaredValue,
    };

    const rates = await getShippingRates(
      PETCOM_ORIGIN.zipCode,
      zipCode,
      packageInfo
    );

    return NextResponse.json({
      success: true,
      rates,
      originZipCode: PETCOM_ORIGIN.zipCode,
      destinationZipCode: zipCode,
    });
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return NextResponse.json(
      { error: 'Error al obtener cotizaciones de envío' },
      { status: 500 }
    );
  }
}
