import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WatchedPage } from './watched.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { WatchedPageRoutingModule } from './watched-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    WatchedPageRoutingModule
  ],
  declarations: [WatchedPage]
})
export class WatchedPageModule {}
