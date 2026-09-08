export const environment = {
  production: false,
  apiUrl: "http://localhost:3010",
  telegramBotUrl: "https://t.me/hormigaTrackerBot",
  pricingEnabled: false,
  posthog: {
    apiKey: '', // Loaded at runtime via PostHog init script in index.html for prod
    apiHost: 'http://localhost:3010',
    enabled: false, // Disabled by default in dev
    debug: true,
    consentRequired: true,
  },
};
