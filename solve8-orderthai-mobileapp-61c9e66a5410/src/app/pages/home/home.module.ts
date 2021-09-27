import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { TestOrderService } from 'src/app/services/StorageService/TestOrderManager';
import { MyApiService } from 'src/app/services/ApiService/my-api.service';
import { OrderService } from 'src/app/services/ApiService/order.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage],
  providers:[
    OrderService
  ]
})
export class HomePageModule {}
