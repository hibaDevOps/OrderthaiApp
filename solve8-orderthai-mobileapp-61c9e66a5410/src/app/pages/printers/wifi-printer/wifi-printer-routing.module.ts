import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WifiPrinterPage } from './wifi-printer.page';

const routes: Routes = [
  {
    path: '',
    component: WifiPrinterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WifiPrinterPageRoutingModule {}
