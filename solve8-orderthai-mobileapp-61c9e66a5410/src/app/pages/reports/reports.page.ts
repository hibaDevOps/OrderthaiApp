import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Dish, Order } from 'src/app/Models/order';
import { OrderService } from 'src/app/services/ApiService/order.service';
import { MyNavService } from 'src/app/services/NavService/my-nav.service';
import moment from 'moment';
import { TestOrderService } from 'src/app/services/StorageService/TestOrderManager';
import { UtilService } from 'src/app/services/Utils/utils';
import { StorageManager } from 'src/app/services/StorageService/StorageManager';
import { Plugins } from '@capacitor/core';
import { AudioService } from 'src/app/services/AudioService/audio.service';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  orderDetail: Order;
  interval: any;
  userDetail: any;
  orderMethod:any;
  reserveTime:any;
  liveOrders:any;
  count:number=0.0;
  restaurant_name:any
  newOrderInterval:any;
  countPickups:number=0;
  countSubtotal:number =0;
  countYesterdaySubtotal:number =0;
  countTableSubtotal:number=0;
  countDelieveriesSubTotal:number=0;
  countTaxes:number=0;
  countOnline:number=0;
  countManual:number=0;
  
  counttable:number=0;
  countdeliveries:number=0;
  constructor(private navService: MyNavService,
    private testOrder: TestOrderService,
    private navCtrl: NavController,
    private router: Router,
    private storageService: StorageManager,
    private utils: UtilService,
    private apiService: OrderService,
    private audioService:AudioService) { }

    async getLiveData(noLoader?: boolean) {
      this.liveOrders = await this.apiService.getDetailOrders(noLoader);
      var dt = moment().format('YYYY-MM-DD');
      var yesterday = moment().subtract(1, 'days').format("YYYY-MM-DD");
      
      this.liveOrders.forEach((order) => {
        var orderDate=moment(order.orderTime).format('YYYY-MM-DD');

        if(dt === orderDate){
        this.countSubtotal = this.countSubtotal + parseFloat(order.orderAmount);
        this.countTaxes = (this.countTaxes + ((0.1)*parseFloat(order.orderAmount)));

        }
        if(order.paymentMethod ==='cash' && dt === orderDate){
          this.countManual = this.countManual + parseFloat(order.orderAmount);
        }
        if(order.paymentMethod ==='stripe' && dt === orderDate){
          this.countOnline = this.countOnline + parseFloat(order.orderAmount);
        }
        if(yesterday === orderDate){
          this.countYesterdaySubtotal =  this.countYesterdaySubtotal + parseFloat(order.orderAmount);
        }


        if(order.orderMethod === 'pickup' && dt === orderDate){
          this.countPickups = this.countPickups + 1;
        }
        if(order.orderMethod === 'table_reservation' && dt === orderDate){
          this.counttable = this.counttable + 1;
        }
        if(order.orderMethod === 'delivery' && dt === orderDate){
          this.countDelieveriesSubTotal = this.countDelieveriesSubTotal + parseFloat(order.deliveryFee);
          this.countdeliveries = this.countdeliveries + 1;
        }
      });
   
      
  }
  async getData() {
    this.navService.title = '#';
    const user = (await this.apiService.getUserDetails()).data;
    console.log(user.restaurant);
    this.restaurant_name=user.restaurant.restaurantName;

  }
  ionViewDidEnter() {
    
      this.getData();
      this.getLiveData(true);
      
   
  }
  ionViewDidLeave() {
   
  }
  ngOnInit() {

  }

}
