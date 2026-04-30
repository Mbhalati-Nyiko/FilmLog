import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WatchlistPage } from './watchlist.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { WatchlistPageRoutingModule } from './watchlist-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    WatchlistPageRoutingModule,

  ],
  declarations: [WatchlistPage ]
})
export class WatchlistPageModule {}
