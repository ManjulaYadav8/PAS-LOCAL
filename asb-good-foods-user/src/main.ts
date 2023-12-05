import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  // const source=`https://www.paypal.com/sdk/js?client-id=${environment.payPalKey}`;
  // var script = document.createElement("script");
  // script.src = source;
  // document.head.appendChild(script);
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
