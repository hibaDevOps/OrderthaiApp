import { Component, NgZone } from '@angular/core';
import { NavController , Platform} from '@ionic/angular';
import moment from 'moment';
import { Subject } from 'rxjs';
import { Order } from 'src/app/Models/order';
import { OrderService } from 'src/app/services/ApiService/order.service';
import { MyNavService } from 'src/app/services/NavService/my-nav.service';
import { RefresherEventDetail } from '@ionic/core';
import { TestOrderService } from 'src/app/services/StorageService/TestOrderManager';
import { MyClockService } from 'src/app/services/ClockService/my-clock.service';
import { UtilService } from 'src/app/services/Utils/utils';
import { MyTimerService } from 'src/app/services/TimerService/my-timer.service';
import { AudioService } from 'src/app/services/AudioService/audio.service';
import { AuthenticationServiceService } from 'src/app/services/AuthService/authentication-service.service';




// ------------------------------------------------------------------------
import { Plugins, PushNotification } from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm';
const fcm = new FCM();
// ------------------------------------------------------------------------
import { StorageManager } from 'src/app/services/StorageService/StorageManager';
// ------------------------------------------------------------------------
const { PushNotifications, Pos } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  orders: Order[];
  testOrders: Order[];
  liveOrders: Order[];
  updateTime = new Subject<any>();
  interval: any;
  userDetail:any;
  ispause:number =0;
  restaurant_id:any;
  isDeliveryPause:number=0;

  // -------------------------------------------------------
  session: any;
  notifications: PushNotification[] = [];
  // move to fcm demo
  topicName = 'super-awesome-topic';
  remoteToken: string;
  refreshId:any;
  soundInterval:any;
  // --------------------------------------------------------
  constructor(
    private testOrder: TestOrderService,
    private storageService: StorageManager,
    private navCtrl: NavController,
    private myClock: MyClockService,
    private navService: MyNavService,
    private utils: UtilService,
    private myTimer: MyTimerService,
    private apiService: OrderService,
    private zone: NgZone,
    private audio: AudioService,
    private authService:AuthenticationServiceService
    
  ) {
    this.orders = [];
    //this.getRestaurant();


    //this.orderFatch();
    this.storageService.getBT().then(async (bt) => {
      if (bt) {
        (await Pos.connectBT({ value: bt.name }));
      }
    }
    );
  }

  async rememberLoggedIn(){
    if(localStorage.getItem('isRemember')=="true" && localStorage.getItem('remember_email')!== undefined && localStorage.getItem('remember_password')!==undefined){
     // await this.authService.login(localStorage.getItem('remember_email'),localStorage.getItem('remember_password'));
    }
  }  
  ngAfterViewInit(){

    this.audio.preload('tabSwitch', 'assets/audio/Incoming_Mail.wav');

  }
  resumeOrders(){

    this.apiService.pauseOrders(this.restaurant_id,"0").then(acceptRes => {
      console.log("orders are paused");
      this.utils.presentToast("Orders has been resumed");
      location.reload();

    }).catch(err => {
      console.log(err);
    })
  }
 async getRestaurant(){
    const user = (await this.apiService.getUserDetails()).data;
    this.restaurant_id=user.user.id;
    if(user.restaurant.pause == '1' ){
      this.ispause = 1;
    }
    else{
      this.ispause=0;
    }
    
  }

  orderFatch() {
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotification) => {
        this.doRefresh(null, true);
        this.zone.run(() => {
          this.notifications.push(notification);
        });
      }
    );
    this.myTimer.timeUpEvent.subscribe(() => {
      if (this.orders) {
        this.doRefresh(null, true);
      }
    })
  }
 
  startTimer() {
    clearInterval(this.interval);
    if (this.orders && this.orders.length > 0) {
      this.orders.forEach((order) => {
        if(order.orderStatus.toLowerCase().includes('pending')){
          this.audio.play('tabSwitch')
        }else{
          this.audio.stop('tabSwitch');
        }
      })
    }
      
    this.interval = setInterval(() => {
      if (this.orders && this.orders.length > 0) {
        this.orders.forEach((order) => {
          if(order.reserveTime == null || order.reserveTime == ""){
            var formating = order.orderRemainingTime.split(":");
              var timeformat="00:00";
              var frame="mm:ss";
              if(formating.length == 3){
                  timeformat="00:00:00";
                  frame="HH:mm:ss";
              }else{
                timeformat="00:00";
                frame="mm:ss";

              }
          if (!order.orderRemainingTime.includes(timeformat) && ['accepted', 'pending'].includes(order.orderStatus.toLowerCase())) {
            order.orderRemainingTime = moment(order.orderRemainingTime, frame).subtract(1, 'second').format(frame);
            if ((moment(order.orderRemainingTime, frame).get('seconds')) % 5 == 0 && order.orderId) {
              // this.apiService.updateTime(order.orderId, order.orderRemainingTime);
            } else if ((moment(order.orderRemainingTime, frame).get('seconds')) % 5 == 0 && !order.orderId) {                 
              this.testOrder.updateTime(order.orderRemainingTime, order.index);
            }
          } else if (order.orderRemainingTime.includes(timeformat) && order.orderStatus.toLowerCase().includes('pending')) {
            if (order.orderId) {
              //   this.apiService.updateStatus(order.orderId, 'Missed').then(() => {
              order.orderStatus = 'Missed';
              //   });
            } else {
              this.testOrder.updateStatus('Missed', order.index).then(() => {
                order.orderStatus = 'Missed';
              });
            }
          } else if (order.orderRemainingTime.includes(timeformat) && order.orderStatus.toLowerCase().includes('accepted')) {
            if (order.orderId) {
              //   this.apiService.updateStatus(order.orderId, 'Missed').then(() => {
              order.orderStatus = 'Completed';
              //   });
            } else {
              this.testOrder.updateStatus('Completed', order.index).then(() => {
                order.orderStatus = 'Completed';
              });
            }
          }
        }else{
            var findformat=order.orderRemainingTime.split(" ");
            var format='';
            if(findformat.length==2){
              format = "00 00:00:00";
            }else{
              format = "00:00:00";
            }
            if (!order.orderRemainingTime.includes(format) && ['accepted', 'pending'].includes(order.orderStatus.toLowerCase())) {
              if(format == "00 00:00:00"){
                order.orderRemainingTime = moment(order.orderRemainingTime, 'DD HH:mm:ss',true).subtract(1, 'second').format('DD HH:mm:ss');

              }else{
                order.orderRemainingTime = moment(order.orderRemainingTime, 'HH:mm:ss',true).subtract(1, 'second').format('HH:mm:ss');

              }
            }  
            else if (order.orderRemainingTime.includes(format) && order.orderStatus.toLowerCase().includes('pending')) {
              if (order.orderId) {
                //   this.apiService.updateStatus(order.orderId, 'Missed').then(() => {
                order.orderStatus = 'Missed';
                //   });
              }
            }
            else if (order.orderRemainingTime.includes(format) && order.orderStatus.toLowerCase().includes('accepted')) {
              if (order.orderId) {
                //   this.apiService.updateStatus(order.orderId, 'Missed').then(() => {
                order.orderStatus = 'Completed';
                //   });
              } 
            }
           // order.orderRemainingTime = moment(order.orderRemainingTime, 'mm:ss').subtract(1, 'second').format('mm:ss');
        }
        });
      }
    
    }, 1000);
  }
  async getData(noLoader?: boolean) {
    try {
      this.testOrders = await this.testOrder.getOrders();
      this.liveOrders = await this.apiService.getOrders(noLoader);
      this.liveOrders.map((item) => {
        item.address = (item.address && item.address.length > 0) ? item.address : item.orderMethod;
      })
      this.murgeOrders();
      this.testOrder.orderChangeEvent.subscribe((response) => {
        this.testOrders = response;
        this.murgeOrders();
      });
      this.testOrder.orderClearEvent.subscribe((response) => {
        this.testOrders = response;
        this.liveOrders = response;
        this.murgeOrders();
      });
    } catch (e) {
    }
  }
  murgeOrders() {
    this.orders = [];
    this.orders = this.liveOrders.concat(this.testOrders);
    this.orders.sort((a, b) => {
      const firstDate = moment(a.orderTime, 'YYYY-MM-DD HH:mm:ss').toDate().getTime();
      const secondDate = moment(b.orderTime, 'YYYY-MM-DD HH:mm:ss').toDate().getTime();
      return (secondDate - firstDate);
    });
    this.orders.map((item) => {
      if(item.orderDeliveryTime && item.orderStatus == '1' && item.reserveTime == null){
        item.orderRemainingTime=  this.utils.getTimeForPendingAcceptedOrders(item.orderStatus,item.orderTime,item.orderDeliveryTime);
      }else{
      item.orderRemainingTime = (item.reserveTime != null)?this.utils.getTimeForPendingReservedOrders(item.orderStatus,item.resrveDate+" "+item.reserveTime) : this.utils.getTimeForPending(item.orderStatus, (['0', 'pending'].includes(item.orderStatus.toLowerCase()) ? item.orderTime : item.orderDeliveryTime));
      }
      if(item.email == 'test-order@orderthai.com.au' && item.orderDeliveryTime == ''){
        item.orderRemainingTime = this.utils.getTimeForPending(item.orderStatus, (['0', 'pending'].includes(item.orderStatus.toLowerCase()) ? item.orderTime : item.orderDeliveryTime));
      }else if(item.email == 'test-order@orderthai.com.au'){
        item.orderRemainingTime=  this.utils.getTimeForTestAcceptedOrders(item.orderStatus,item.orderTime,item.orderDeliveryTime);

      }
     
      item.orderStatus = (item.orderStatus) ? item.orderStatus : '0';
      item.orderStatus = (item.orderStatus.includes('0') && (item.orderRemainingTime.includes('00:00'))) ? '' : item.orderStatus;
      item.orderStatus = (item.orderStatus.includes('1') && (item.orderRemainingTime.includes('00:00'))) ? '3' : item.orderStatus;
      // item.orderRemainingTime = (item.orderRemainingTime) ? moment(item.orderRemainingTime.split(' ')[1], 'HH:mm:ss').format('mm:ss') : '';
      // item.orderRemainingTime = (!item.orderRemainingTime.includes('00:00') && item.orderRemainingTime.length > 0) ? item.orderRemainingTime : '03:00';
      switch (item.orderStatus) {
        case '0':
        case 'Pending':
          item.orderStatus = 'Pending';
          break;
        case '1':
        case 'Accepted':
          item.orderStatus = 'Accepted';
          break;
        case '2':
        case 'Rejected':
          item.orderStatus = 'Rejected';
          break;
        case '3':
        case 'Completed':
          item.orderStatus = 'Completed';
          break;
        default:
          item.orderStatus = 'Missed';
          break;
      }
      return item;
    });
    this.startTimer();
  }
  onOrderClick(item: Order) {
    this.navService.myParam = item;
    this.navCtrl.navigateForward('/order-detail');
  }
  getClass(status?: string) {
    let myClass = 'order-timer ';
    status = (status) ? status.toLowerCase() : 'pending';
    myClass += (!status.includes('pending')) ? (!['accepted', 'completed'].includes(status.toLowerCase())) ? 'order-reject' : 'order-accept' : 'order-pending';
    return myClass;
  }
  getPathForClock(status: string) {
    return (!status.toLowerCase().includes('accept')) ? '/assets/icon/order-reject.png' : '/assets/icon/order-accept.png';
  }
  ionViewDidEnter() {
    // this.getData();\
    this.navService.title = '';
    this.getData();
   
    this.refreshId=setInterval(()=>{
        this.doRefresh(null,true);
         }, 5000);

  
    
  }
  ionViewDidLeave() {
     clearInterval(this.interval);
     clearInterval(this.refreshId);
     this.audio.stop('tabSwitch');
     
  }
  doRefresh(event?: CustomEvent<RefresherEventDetail>, noLoader?: boolean) {
    this.getData(noLoader);
    if (event)
      event.detail.complete();
    // setTimeout(() => {
    //   event.detail.complete();
    // }, 2000);
  }
}