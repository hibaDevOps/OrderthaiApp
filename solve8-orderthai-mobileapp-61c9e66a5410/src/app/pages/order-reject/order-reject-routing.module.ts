import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderRejectPage } from './order-reject.page';

const routes: Routes = [
  {
    path: '',
    component: OrderRejectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRejectPageRoutingModule {}
