import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'search',
        loadChildren: () => import('../search/search.module').then(m => m.SearchPageModule)
      },
      {
        path: 'watched',
        loadChildren: () => import('../watched/watched.module').then(m => m.WatchedPageModule)
      },
      {
        path: 'watchlist',
        loadChildren: () => import('../watchlist/watchlist.module').then(m => m.WatchlistPageModule)
      },
      {
        path: '',
        redirectTo: '/search',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
