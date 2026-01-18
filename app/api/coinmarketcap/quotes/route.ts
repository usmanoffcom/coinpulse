import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.COINMARKETCAP_BASE_URL || 'https://pro-api.coinmarketcap.com';
const API_KEY = process.env.COINMARKETCAP_API_KEY;

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const symbol = searchParams.get('symbol');

  if (!id && !symbol) {
    return NextResponse.json({ error: 'id or symbol is required' }, { status: 400 });
  }

  try {
    const url = new URL(`${BASE_URL}/v1/cryptocurrency/quotes/latest`);
    url.searchParams.append(id ? 'id' : 'symbol', id || symbol || '');
    url.searchParams.append('convert', 'USD');

    const response = await fetch(url.toString(), {
      headers: {
        'X-CMC_PRO_API_KEY': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.status?.error_message || 'API error' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching CoinMarketCap data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
