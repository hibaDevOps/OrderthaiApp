import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BluetoothPrinterPageRoutingModule } from './bluetooth-printer-routing.module';

import { BluetoothPrinterPage } from './bluetooth-printer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BluetoothPrinterPageRoutingModule
  ],
  declarations: [BluetoothPrinterPage]
})
export class BluetoothPrinterPageModule {}
