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
  selector: 'app-orders-paused',
  templateUrl: './orders-paused.page.html',
  styleUrls: ['./orders-paused.page.scss'],
})
export class OrdersPausedPage implements OnInit {

  restaurant_name:any;
  restaurant_id:any;
  is_pause:any;
  toggle_pause_delivery_orders:boolean=false;
  toggle_pause_table_reservation_orders:boolean=false;
  toggle_pause_all_orders:boolean=false;

  constructor(private navService: MyNavService,
    private testOrder: TestOrderService,
    private navCtrl: NavController,
    private router: Router,
    private storageService: StorageManager,
    private utils: UtilService,
    private apiService: OrderService,
    private audioService:AudioService) { 
      this.navService.title="Order Management Settings"
    }

  ngOnInit() {
    this.getRestaurantInfo();
  }
  async getRestaurantInfo(){
    const user = (await this.apiService.getUserDetails()).data;
    this.restaurant_name=user.restaurant.restaurantName;
    this.restaurant_id=user.user.id;
    this.is_pause=user.restaurant.pause;
    console.log(user.restaurant);
    if(user.restaurant.pause == '1'){
      this.toggle_pause_all_orders=true;
    }else{
      this.toggle_pause_all_orders=false;
    }

    if(user.restaurant.pauseDelivery == '1'){
      this.toggle_pause_delivery_orders=true;

    }else{
      this.toggle_pause_delivery_orders=false;
    }

    if(user.restaurant.pauseTable == '1'){
      this.toggle_pause_table_reservation_orders=true;
    }else{
      this.toggle_pause_table_reservation_orders=false;
    }


  }
  onConfirm(event:any){
    if(event == true){
    this.apiService.pauseOrders(this.restaurant_id,"1").then(acceptRes => {
      console.log("orders are paused");
      this.toggle_pause_all_orders=true;
      this.utils.presentToast("Orders has been paused");
      location.reload();

    }).catch(err => {
      console.log(err);
    })
  }else{
    this.toggle_pause_all_orders=false;
    this.apiService.pauseOrders(this.restaurant_id,"0").then(acceptRes => {
      console.log("orders are paused");
      this.toggle_pause_all_orders=true;
      this.utils.presentToast("Orders has been unpaused");
      location.reload();

    }).catch(err => {
      console.log(err);
    })
  }
  }
  resumeOrders(){

    this.apiService.pauseOrders(this.restaurant_id,"0").then(acceptRes => {
      console.log("orders are paused");
      this.utils.presentToast("Orders has been resumed");
      this.navCtrl.back();

    }).catch(err => {
      console.log(err);
    })
  }
  onCancel(){
    this.navCtrl.back();
  }

  pauseDeliveryOrders(event:any){

    
  
      if(event == true){
      this.toggle_pause_delivery_orders = event.detail.value;
      if(this.toggle_pause_delivery_orders){
        this.apiService.pauseDeliveryOrders(this.restaurant_id,"1").then(acceptRes => {
          this.utils.presentToast("Delivery Orders are paused");
          location.reload();
    
        }).catch(err => {
          console.log(err);
        })
      }
    }else{
      this.toggle_pause_delivery_orders=false;
      this.apiService.pauseDeliveryOrders(this.restaurant_id,"0").then(acceptRes => {
        this.utils.presentToast("Delivery Orders are unpaused");
        location.reload();
  
      }).catch(err => {
        console.log(err);
      })
    }
    
  
  }
  pauseTableReservationOrders(event:any){
  
    if(event == true){
    this.toggle_pause_delivery_orders = event.detail.value;
    if(this.toggle_pause_delivery_orders){
      this.apiService.pauseTableReservationOrders(this.restaurant_id,"1").then(acceptRes => {
        this.utils.presentToast("Table reservation has been paused");
        location.reload();
  
      }).catch(err => {
        console.log(err);
      })
    }
  }else{
    this.toggle_pause_table_reservation_orders=false;
    this.apiService.pauseTableReservationOrders(this.restaurant_id,"0").then(acceptRes => {
      this.utils.presentToast("Table reservation has been unpaused");
      location.reload();

    }).catch(err => {
      console.log(err);
    })
  }
  

}

}
