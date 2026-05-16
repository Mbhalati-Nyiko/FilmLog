import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { SearchPageRoutingModule } from './search-routing.module';
import { SearchPage } from './search.page';
import { TabsPage } from '../tabs/tabs.page';
import { LoaderPage } from '../pages/loader/loader.page';



@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    SearchPageRoutingModule,
    LoaderPage,
    TabsPage
  ],
  declarations: [SearchPage,]
})
export class SearchPageModule {}
