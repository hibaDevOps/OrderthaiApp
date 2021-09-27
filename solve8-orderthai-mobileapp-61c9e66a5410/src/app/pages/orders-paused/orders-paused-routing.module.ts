import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdersPausedPage } from './orders-paused.page';

const routes: Routes = [
  {
    path: '',
    component: OrdersPausedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdersPausedPageRoutingModule {}
