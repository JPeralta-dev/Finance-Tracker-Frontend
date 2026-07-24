export const environment = {
  production: false,
  apiUrl: "http://localhost:3010",
  telegramBotUrl: "https://t.me/hormigaTrackerBot",
  posthog: {
    apiKey: '', // Loaded at runtime via PostHog init script in index.html for prod
    apiHost: 'https://us.i.posthog.com',
    enabled: false, // Disabled by default in dev
    debug: true,
    consentRequired: true,
  },
};
