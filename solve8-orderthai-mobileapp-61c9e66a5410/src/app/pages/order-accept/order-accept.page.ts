import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import moment from 'moment';
import { Order } from 'src/app/Models/order';
import { OrderService } from 'src/app/services/ApiService/order.service';
import { MyNavService } from 'src/app/services/NavService/my-nav.service';
import { TestOrderService } from 'src/app/services/StorageService/TestOrderManager';
import { UtilService } from 'src/app/services/Utils/utils';

@Component({
  selector: 'app-order-accept',
  templateUrl: './order-accept.page.html',
  styleUrls: ['./order-accept.page.scss'],
})
export class OrderAcceptPage implements OnInit {
  public orderDetails: Order;
  public orderTime: string = '';
  public order_for_later:string='';
  public intTimeRemaining:number =0;
  public testDeliverytime:number=180;
  public istest:boolean=false;
  constructor(
    private testOrder: TestOrderService,
    private navService: MyNavService,
    private navCtrl: NavController,
    private apiService: OrderService,
    private utils: UtilService,
  ) { 


  }

  ngOnInit() {
  }
  
   ionViewDidEnter() {
    this.orderDetails =  this.navService.myParam;

    if(this.orderDetails.email == 'test-order@orderthai.com.au'){
      this.order_for_later="180";
    }
    if(this.orderDetails.reserveTime != "" || this.orderDetails.orderMethod == 'table_reservation'){
    this.order_for_later = this.orderDetails.resrveDate+" "+this.orderDetails.reserveTime;
    this.orderTime=this.orderDetails.resrveDate+" "+this.orderDetails.reserveTime;
      var t1=new Date().toLocaleString("en-US", {timeZone: "Australia/Sydney"});
    var t3 = new Date(t1);
    var t2=new Date(this.orderDetails.resrveDate);
    console.log(t2);
      var diff =(t2.getTime() - t3.getTime()) / 1000;
      diff /= 60;
      this.intTimeRemaining = Math.abs(Math.round(diff));
      console.log(this.intTimeRemaining);
      
  }
}

   diff_minutes(dt2, dt1) 
    {
   
     var diff =(dt2.getTime() - dt1.getTime()) / 1000;
     diff /= 60;
     return Math.abs(Math.round(diff));
     
    }
   
  
 
  onAccept() {
    if((this.orderDetails.reserveTime == "") && (isNaN(Number(this.orderTime.trim().toString())) || this.orderTime.trim().toString().length == 0)) {
      this.utils.presentToast('Please enter above details');
      return;
    }else{
      if(this.orderDetails.reserveTime != ""){
      this.orderTime='1';
    }
    }
    const remainingTime = moment().startOf('day').add(this.orderTime, 'minutes').format('HH:mm:ss');
    //console.log(remainingTime);
    if (!this.orderDetails.orderId) {
     // const remainingTimeTest = moment().startOf('day').add(this.orderTime, 'minutes').format('HH:mm:ss');
      this.testOrder.updateStatus('accept', this.orderDetails.index, this.orderTime).then(() => {
        this.updateRecord(remainingTime, 'Accepted');
      });
      return;
    }
    this.apiService.updateTime(this.orderDetails.orderId, remainingTime).then(remainingTimeRes => {
      if (remainingTimeRes) {

        this.apiService.updateStatus(this.orderDetails.orderId, 'accept', this.orderTime).then(acceptRes => {
          this.updateRecord(acceptRes.orderDeliveryTime, 'Accepted');
        }).catch(err => {
          if(this.orderDetails.paymentMethod === "Stripe"){
            this.utils.presentToast('Payment cannot be processed from the card. Order should be rejected');
          }
          //this.utils.presentToast(err.message);
        })
      }
    }).catch(err => {
      this.utils.presentToast(err.message);
    });
  }
  updateRecord = (time, status) => {
    this.orderDetails.orderStatus = status;
    this.orderDetails.orderDeliveryTime = time;
    this.navService.myParam = this.orderDetails;
    setTimeout(() => {
      this.navCtrl.back();
    }, 100);
  }
}
