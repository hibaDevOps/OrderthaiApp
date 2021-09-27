import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WifiPrinterPageRoutingModule } from './wifi-printer-routing.module';

import { WifiPrinterPage } from './wifi-printer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WifiPrinterPageRoutingModule
  ],
  declarations: [WifiPrinterPage]
})
export class WifiPrinterPageModule {}
