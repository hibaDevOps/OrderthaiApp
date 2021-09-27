import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderAcceptPageRoutingModule } from './order-accept-routing.module';

import { OrderAcceptPage } from './order-accept.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderAcceptPageRoutingModule
  ],
  declarations: [OrderAcceptPage]
})
export class OrderAcceptPageModule {}
