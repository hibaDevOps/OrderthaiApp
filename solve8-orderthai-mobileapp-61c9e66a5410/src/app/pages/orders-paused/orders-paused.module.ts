import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdersPausedPageRoutingModule } from './orders-paused-routing.module';

import { OrdersPausedPage } from './orders-paused.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersPausedPageRoutingModule
  ],
  declarations: [OrdersPausedPage]
})
export class OrdersPausedPageModule {}
