import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderRejectPageRoutingModule } from './order-reject-routing.module';

import { OrderRejectPage } from './order-reject.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderRejectPageRoutingModule
  ],
  declarations: [OrderRejectPage]
})
export class OrderRejectPageModule {}
