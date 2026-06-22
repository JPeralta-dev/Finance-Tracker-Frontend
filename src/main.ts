import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerECharts } from './app/shared/charts/echarts/echarts-module';

// Pre-register ECharts modules at bootstrap (idempotent — safe to call again)
registerECharts().then(() => {
  console.log('[main.ts] ECharts modules registered at bootstrap');
}).catch((err) => {
  console.error('[main.ts] ECharts registration failed:', err);
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
