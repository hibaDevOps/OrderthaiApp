import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrintersPage } from './printers.page';

const routes: Routes = [
  {
    path: '',
    component: PrintersPage,
    children: [
      {path:'',redirectTo:'wifi-printer'},
      { path: 'bluetooth-printer', loadChildren: () => import('./bluetooth-printer/bluetooth-printer.module').then(m => m.BluetoothPrinterPageModule) },
      { path: 'wifi-printer', loadChildren: () => import('./wifi-printer/wifi-printer.module').then(m => m.WifiPrinterPageModule) }    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrintersPageRoutingModule { }
