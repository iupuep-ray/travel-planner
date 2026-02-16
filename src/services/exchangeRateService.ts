interface ExchangeRateApiResponse {
  result: string;
  conversion_rates?: Record<string, number>;
  'error-type'?: string;
}

const EXCHANGE_RATE_API_BASE_URL = 'https://v6.exchangerate-api.com/v6';
const EXCHANGE_RATE_TIMEOUT_MS = 30000;

export const fetchJpyToTwdRate = async (): Promise<number> => {
  const apiKey = import.meta.env.VITE_EXCHANGERATE_API_KEY;

  if (!apiKey) {
    throw new Error('缺少 VITE_EXCHANGERATE_API_KEY 設定');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EXCHANGE_RATE_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${EXCHANGE_RATE_API_BASE_URL}/${apiKey}/latest/JPY`, {
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('取得匯率失敗 (timeout)');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`取得匯率失敗 (HTTP ${response.status})`);
  }

  const data: ExchangeRateApiResponse = await response.json();
  const twdRate = data.conversion_rates?.TWD;

  if (data.result !== 'success' || !twdRate || twdRate <= 0) {
    const errorType = data['error-type'] || 'unknown_error';
    throw new Error(`取得匯率失敗 (${errorType})`);
  }

  return twdRate;
};
