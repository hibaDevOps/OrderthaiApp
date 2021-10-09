import { Component, NgZone } from '@angular/core';

import { AlertController, MenuController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { TestOrderService } from './services/StorageService/TestOrderManager';
import { Order } from './Models/order';
import { UtilService } from './services/Utils/utils';
import { MyClockService } from './services/ClockService/my-clock.service';
import moment from 'moment';
import { PopoverComponent } from './pages/popover/popover.component';
import { AuthenticationServiceService } from './services/AuthService/authentication-service.service';
import { StorageManager } from './services/StorageService/StorageManager';
import { BatteryStatus } from '@ionic-native/battery-status/ngx';
import { OrderService } from './services/ApiService/order.service';
import { MyNavService } from './services/NavService/my-nav.service';
import { MyTimerService } from './services/TimerService/my-timer.service';

// import { PushNotification } from '@capacitor/core';
// ------------------------------------------------------------------------
import { Plugins, PushNotification } from '@capacitor/core';
const { PushNotifications } = Plugins;
import { FCM } from '@capacitor-community/fcm';
const fcm = new FCM();
// ------------------------------------------------------------------------


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  title: string = 'Home';
  openPages: string[] = ['login', 'forgot-password'];
  notRedirect: string[] = ['logout', 'test', 'clear', 'languages'];
  displayLoading: boolean = true;
  myAlert: any;
  // -------------------------------------------------------
  session: any;

  notifications: PushNotification[] = [];
  //
  // move to fcm demo
  topicName = 'super-awesome-topic';
  remoteToken: string;
  restaurant_name:any;
  restaurant_id:any;
  is_pause:number=0;
  // --------------------------------------------------------

  constructor(
    private menuCtrl: MenuController,
    private navCtrl: NavController,
    private platform: Platform,
    private popoverController: PopoverController,
    private authService: AuthenticationServiceService,
    private testOrder: TestOrderService,
    private apiService: OrderService,
    private storageService: StorageManager,
    private alertController: AlertController,
    private utils: UtilService,
    private batteryStatus: BatteryStatus,
    private splashScreen: SplashScreen,
    private navService: MyNavService,
    private statusBar: StatusBar,
    private router: Router,
    private zone: NgZone
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.batteryStatus.onChange().subscribe(status => {
        if (!status.isPlugged) {
          this.presentPopover();
        }
      });
    }).then(() => {
      this.customPushNotification();
    });

    this.getRestaurantInfo();

    
  
    
    
    
  }
  resumeOrders(){
    this.apiService.pauseOrders(this.restaurant_id,"0").then(acceptRes => {
      this.utils.presentToast("Orders has been resumed");
      location.reload();

    }).catch(err => {
      console.log(err);
    })
  }

  checkLogin(): boolean {
    return this.openPages.includes(this.router.url.replace('/', ''));
  }
  redirectTo(path: string) {
    this.menuCtrl.toggle();
    if (!this.notRedirect.includes(path)) {
      this.navCtrl.navigateRoot(path);
    } else if (path.includes('logout')) {
      this.alert();
    } else if (path.includes('test')) {
      this.addOrder();
    } else if (path.includes('clear')) {
      this.clearOder();
    }
  }
  async alert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: 'Are you sure you want to logout?',
      buttons: [{
        text: 'Ok',
        handler: (handler) => {
          this.authService.logout();
          this.storageService.clearData();
          this.navCtrl.navigateRoot(['login']);
        }
      },
      {
        text: 'Cancel',
        handler: (handler) => {
          alert.dismiss();
        }
      }
      ],
    });
    alert.present();
    return this.alertController;
  }
  getTitle() {
    let title = (this.router.url.split('/')[1]).replace('\/', '').replace(/-/g, ' ');
    title = (this.navService.title && this.navService.title.length > 1) ? this.navService.title : title;
    title = (title.toLowerCase().includes('profile')) ? 'My Account' : title;
    if(title.toLocaleLowerCase().includes('selected printers')){
      title = "What Dockets?";
    }
    return title;
  }
  async getRestaurantInfo(){
    const user = (await this.apiService.getUserDetails()).data;
    this.restaurant_name=user.restaurant.restaurantName;
    this.restaurant_id=user.user.id;
    this.is_pause=user.restaurant.pause;
    localStorage.setItem("myRestaurantId",user.user.id);
    localStorage.setItem("myRestaurantName",user.restaurant.restaurantName);


  }
   tConvert (time) {
    // Check correct time format and split into components
    time = time?.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
  }
  getSubtitle(){
    let title = (this.router.url.split('/')[1]).replace('\/', '').replace(/-/g, ' ');
    title = (this.navService.subTitle && this.navService.subTitle.length > 1) ? this.navService.subTitle : '';
    if(title !== ''){
      const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const days=["SUN","MON","TUE","WED","THU","FRI","SAT"];
      var current=new Date(title);
      title=moment.utc(title).utcOffset('+10:00').format('ddd D MMM, YYYY - hh:mm A');
     }
    return title;  
  }
  getRouterClass() {
    return (!this.openPages.includes(this.router.url.replace('/', ''))) ? 'my-class' : '';
  }
  addOrder() {
    let order = new Order();
    order.orderTime = moment().valueOf().toString();
    this.testOrder.addOrders(order);
    this.utils.presentToast('New test order created successfully');
  }
  async clearOder() {
    await this.apiService.clearOrder();
    await this.testOrder.clearData();
    this.utils.presentToast('Order cleared successfully');
  }
  async presentPopover() {
    if (this.myAlert) {
      this.popoverController.dismiss();
      this.myAlert = undefined;
    }
    this.myAlert = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: {
      },
      cssClass: 'info_app',
      translucent: true
    });
    return await this.myAlert.present();
  }
  onBack() {
    this.navCtrl.back();
  }
  menuVisibility() {
    return !(this.getTitle().includes('my orders'));
  }

  customPushNotification() {
    PushNotifications.addListener('registration', (data) => {
      // alert(JSON.stringify(data));
    });
    this.subscribeTo();
    PushNotifications.register().then(() => console.log(`registered for push`));
    // PushNotifications.addListener(
    //   'pushNotificationReceived',
    //   (notification: PushNotification) => {
    //     console.log('notification ' + JSON.stringify(notification));
    //     this.zone.run(() => {
    //       this.notifications.push(notification);
    //     });
    //   }
    // );
  }

  //
  // move to fcm demo
  subscribeTo() {
    PushNotifications.register()
      .then((_) => {
        fcm
          .subscribeTo({ topic: this.topicName })
          .then((r) => console.log(`subscribed to topic ${this.topicName}`));
      });
  }

  unsubscribeFrom() {
    fcm
      .unsubscribeFrom({ topic: 'test' })
      .then((r) => console.log(`unsubscribed from topic ${this.topicName}`));
    if (this.platform.is('android')) fcm.deleteInstance();
  }

  getToken() {
    fcm
      .getToken()
      .then((result) => {
        this.remoteToken = result.token;
      });
  }
}
