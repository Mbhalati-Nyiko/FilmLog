import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';

IonicStorageModule.forRoot({
  name: 'FilmLogDB',
  driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
});

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
