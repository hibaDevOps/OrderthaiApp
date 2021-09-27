import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderAcceptPage } from './order-accept.page';

const routes: Routes = [
  {
    path: '',
    component: OrderAcceptPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderAcceptPageRoutingModule {}
