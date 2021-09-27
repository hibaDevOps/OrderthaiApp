import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BluetoothPrinterPage } from './bluetooth-printer.page';

const routes: Routes = [
  {
    path: '',
    component: BluetoothPrinterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BluetoothPrinterPageRoutingModule {}
