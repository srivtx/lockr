import DodoPayments from 'dodopayments';

const environment =
  (process.env.DODO_ENVIRONMENT as 'test_mode' | 'live_mode') ?? 'test_mode';

export const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY!,
  webhookKey: process.env.DODO_WEBHOOK_KEY,
  environment,
});

export function getDodoBaseUrl(): string {
  return environment === 'test_mode'
    ? 'https://test.dodopayments.com'
    : 'https://live.dodopayments.com';
}
