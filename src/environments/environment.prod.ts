export const environment = {
  production: true,
  apiUrl: 'https://api.kipufinance.online',
  telegramBotUrl: 'https://t.me/hormigaTrackerBot',
  pricingEnabled: false,
  posthog: {
    apiKey: 'phc_PROD_REPLACE_ME', // Replace with real PostHog project API key
    apiHost: 'https://api.kipufinance.online',
    enabled: true,
    debug: false,
    consentRequired: true,
  },
};
