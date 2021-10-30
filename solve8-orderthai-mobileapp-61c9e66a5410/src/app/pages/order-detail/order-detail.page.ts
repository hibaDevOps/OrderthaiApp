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
import { IfStmt, ThrowStmt } from '@angular/compiler';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';
import {Document} from 'src/app/services/EscService/Document';
import { BitmapDensity, FeedControlSequence, FontFamily, FontStyle, TextAlignment } from 'src/app/services/EscService/Enum';
import { ESCPOSImage } from 'src/app/services/EscService/Image';
import {GlobalConstants} from 'src/app/common/global';
import { rawListeners } from 'process';
import { Printer } from 'src/app/Models/printer';
import {PrinterAPIService} from 'src/app/services/ApiService/printer_api.service';


const { Pos, Clipboard } = Plugins;
declare var Socket: any;


@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})
export class OrderDetailPage implements OnInit {
  options: google.maps.MapOptions;
  markerOptions: google.maps.MarkerOptions;
  mark: google.maps.LatLngLiteral;
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap
  orderDetail: Order;
  interval: any;
  userDetail: any;
  orderMethod:any;
  reserveTime:any;
  liveOrders:any;
  count:number=0;
  newOrderInterval:any;
  newOrderNotOpen:any;
  isNew:number=0;
  printer:any;
  isKitchen:number=0;
  isCounter:number=0;
  restaurantInfo:any;
  categories:any;

  socket:any;
  isWifiKitchen:number=0;
  isWifiCounter:number=0;
  error:string="";
  PORT:string="9100";
  isNewCustomer:boolean=false;
  getAllPrinters:Printer[]=[];
  

  orderStatus:string="";
  constructor(
    private navService: MyNavService,
    private testOrder: TestOrderService,
    private navCtrl: NavController,
    private router: Router,
    private storageService: StorageManager,
    private utils: UtilService,
    private apiService: OrderService,
    private audioService:AudioService,
    private bluetooth:BluetoothSerial,
    private printerService:PrinterAPIService
  ) {


    this.isKitchen=GlobalConstants.kitchen;
    this.isCounter=GlobalConstants.counter;
    this.printer=GlobalConstants.selectedPrinter;

    this.socket=GlobalConstants.selectWifiPrinter;
    this.isWifiCounter=GlobalConstants.wifiCounter;
    this.isWifiKitchen=GlobalConstants.wifiKitchen;
    this.navService.title = '#';
    // this.navService.myParam = JSON.parse('{"name":"My Thai Restaurant","address":"198 Shirley Street, PIMPAMA QLD 4209, AUSTRALIA","mobile":"+61 123 456 789","email":"alibabaa@gmail.com","orderStatus":"Completed","orderTime":"2020-12-04 15:33:42","orderRemainingTime":"00:00","orderDeliveryTime":"2020-12-04 15:58:54","paymentMethod":"Online","deliveryNote":"Please when you reach at door step","order":[{"id":"","price":"150.0","productName":"Margarita","quantity":"1","tax":"15.0","addOns":[{"name":"Extra Chess","status":"Add"}]},{"id":"","price":"150.0","productName":"Margarita","quantity":"2","tax":"15.0","addOns":[{"name":"Extra Chess","status":"Add"}]}],"orderProduct":[{"id":"","price":"150.0","productName":"Margarita","quantity":"1","tax":"15.0","addOns":[{"name":"Extra Chess","status":"Add"}]}],"lat":-27.7091963,"lng":153.2201116,"index":292670}');
    // this.navService.myParam = { orderId: "592386", orderStatus: "Pending", orderTime: "2020-11-03 01:48:35", orderDeliveryTime: "02:57", address: "Gota" };
    this.setUpMap();
  }
  deviceDisconnected() {
    // Unsubscribe from data receiving
    this.bluetooth.disconnect();
  }

  deviceConnected() {
    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetooth.subscribe('\n').subscribe(success => {
    }, error => {

    });
  }
  connect(address) {
    // Attempt to connect device with specified address, call app.deviceConnected if success
    this.bluetooth.connect(address).subscribe(success => {
      this.deviceConnected();
      
    }, error => {

    });
  }
  
  async testPrintViaBluetooth() {
    // socket receive bytecode, therefore we need to create a byte stream by using esc-pos-encoder-ionic
    
    const doc = new Document();
    let escposCommands;
    ESCPOSImage.load('data:image/png;base64,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').then(logo => {
    escposCommands = doc
        .newLine()
        .newLine()
        .newLine()
        .reverseColors(true)
        .image(logo, BitmapDensity.D24)
        .font(FontFamily.A)
        .align(TextAlignment.Center)
        .style([FontStyle.Bold])
        .size(1, 1)
        .font(FontFamily.B)
        .size(0, 0)
        .feed(5)
        .cut()
        .generateUInt8Array();

        this.bluetooth.connect(this.printer).subscribe(() => {
          this.bluetooth.write(escposCommands)
            .then(() => {
              console.log('Print success');
            })
            .catch((err) => {
              console.error(err);
              this.error=err;
    
            });
        });
    });

    // send byte code into the printer
    
  }

  
  
  setUpMap(centeroid?:any) {
    if(centeroid == undefined){
      centeroid={lat: 0, lng: 0 };
    }
    this.options = {
      center: centeroid,
      zoom: 15,
      fullscreenControl: false,
      controlSize: 25
    };
    this.markerOptions = {
    };
    // this.mark = { lat: 23.0492209, lng: 72.5559631 };
  }
  async getLiveData(noLoader?: boolean) {
      this.liveOrders = await this.apiService.getOrders(noLoader);
      if(this.liveOrders.length > this.count && this.count > 0){
        this.isNew = 1;
        this.audioService.play('tabSwitch');
      }else{
        this.audioService.stop('tabSwitch');
      }
      this.count = this.liveOrders.length;
      if(this.count > 0 && this.isNew == 1){
        this.audioService.play('tabSwitch');
        
      }else{
        this.audioService.stop('tabSwitch');
      }
      
    
  }

  async getData() {
    this.navService.title = '#';
    const user = (await this.apiService.getUserDetails()).data;
    this.userDetail = user.restaurant;
    this.userDetail.email = user.user.email;
    this.userDetail.latitude=user.restaurant.latitude;
    this.userDetail.longitude=user.restaurant.longitude;
    if (this.navService.myParam.orderId) {
      this.orderDetail = { ...(await this.getOrderDetailsFromApi())[0] };
      this.orderDetail.name = this.orderDetail.firstName + ' ' + this.orderDetail.lastName;
      this.orderDetail.order = (this.orderDetail.order) ? this.orderDetail.order : this.orderDetail.orderProduct;
      this.orderDetail.mobile = this.orderDetail.telephone;
      this.orderDetail.address = (this.orderDetail.address && this.orderDetail.address.length > 0) ? this.orderDetail.address : this.orderDetail.orderMethod;
      this.orderDetail.order.map((item: any) => {
        item.quantity = Number(item.quantity);
        item.price = Number(item.price).toFixed(2);

        return item;
      });
      delete this.orderDetail.orderProduct;
      this.navService.subTitle =this.orderDetail.orderTime;
      this.navService.title += (this.orderDetail.orderId) ? this.orderDetail.orderId : '';
    } else {
      this.orderDetail = await this.getOrderDetailsFromStorage();

      this.navService.subTitle =this.orderDetail.orderTime;
      this.navService.title += (this.orderDetail.index) ? this.orderDetail.index : '';
      
    }
    this.orderDetail.paymentMethod = (this.orderDetail.paymentMethod)?this.capitalizeFirstLetter(this.orderDetail.paymentMethod):'';
    this.orderDetail.address = (this.orderDetail.address)?this.capitalizeFirstLetter(this.orderDetail.address):'';
   
    if(this.orderDetail.orderDeliveryTime && this.orderDetail.orderStatus == '1' && this.orderDetail.reserveTime == null){
      this.orderDetail.orderRemainingTime= await this.utils.getTimeForPendingAcceptedOrders(this.orderDetail.orderStatus,this.orderDetail.orderTime,this.orderDetail.orderDeliveryTime);
    }else{
    this.orderDetail.orderRemainingTime = (this.orderDetail.reserveTime != null)?(await this.utils.getTimeForPendingReservedOrders(this.orderDetail.orderStatus,this.orderDetail.resrveDate+" "+this.orderDetail.reserveTime)):(await this.utils.getTimeForPending(this.orderDetail.orderStatus, (this.orderDetail.orderStatus.includes('0')) ? this.orderDetail.orderTime : this.orderDetail.orderDeliveryTime));
    }
    if(this.orderDetail.email == 'test-order@orderthai.com.au' && this.orderDetail.orderStatus == '0'){
      this.orderDetail.orderRemainingTime = this.utils.getTimeForPending(this.orderDetail.orderStatus, (['0', 'pending'].includes(this.orderDetail.orderStatus.toLowerCase()) ? this.orderDetail.orderTime : this.orderDetail.orderDeliveryTime));
    }
    else if(this.orderDetail.email == 'test-order@orderthai.com.au' && this.orderDetail.orderStatus == '1'){
      this.orderDetail.orderRemainingTime = this.utils.getTimeForTestAcceptedOrders(this.orderDetail.orderStatus,this.orderDetail.orderTime,this.orderDetail.orderDeliveryTime );
    }
    this.orderDetail.orderStatus = (this.orderDetail.orderStatus) ? this.orderDetail.orderStatus : '0';
    this.orderDetail.orderStatus = ((this.orderDetail.orderStatus.includes('0')) && ((this.orderDetail.orderRemainingTime =='00:00') || this.orderDetail.orderRemainingTime =='00:00:00')) ? '' : this.orderDetail.orderStatus;
    this.orderDetail.orderStatus = ((this.orderDetail.orderStatus.includes('1')) && ((this.orderDetail.orderRemainingTime =='00:00') || this.orderDetail.orderRemainingTime =='00:00:00')) ? '3' : this.orderDetail.orderStatus;   
    this.orderDetail.reserveTime = (this.orderDetail.reserveTime ) ? new Date(this.orderDetail.resrveDate+" "+this.orderDetail.reserveTime).toLocaleString('en-US', { hour: 'numeric', minute:'numeric', hour12: true }):'';
    this.orderDetail.resrveDate = (this.orderDetail.resrveDate) ? (new Date(this.orderDetail.resrveDate).getDate()<10?'0'+ new Date(this.orderDetail.resrveDate).getDate():new Date(this.orderDetail.resrveDate).getDate())+"/"+((new Date(this.orderDetail.resrveDate).getMonth()+1)<10?'0'+ (new Date(this.orderDetail.resrveDate).getMonth()+1):(new Date(this.orderDetail.resrveDate).getMonth()+1))+"/"+new Date(this.orderDetail.resrveDate).getFullYear() :'';
    this.orderDetail.deliveryFee=(this.orderDetail.deliveryFee)? Number.parseFloat(this.orderDetail.deliveryFee).toFixed(2):"0.0";
    switch (this.orderDetail.orderStatus) {
      case '0':
      case 'Pending':
        this.orderDetail.orderStatus = 'Pending';
        break;
      case '1':
      case 'Accepted':
        this.orderDetail.orderStatus = 'Accepted';
        break;
      case '2':
      case 'Rejected':
        this.orderDetail.orderStatus = 'Rejected';
        break;
      case '3':
      case 'Completed':
        this.orderDetail.orderStatus = 'Completed';
        break;
      default:
        this.orderDetail.orderStatus = 'Missed';
        break;
    }

    // this.orderDetail.orderDeliveryTime = this.navService.myParam.orderDeliveryTime;
    this.startTimer();
    if (this.orderDetail.lat && this.orderDetail.lng) {
     
    //  var myLatlng = new google.maps.LatLng(parseFloat(this.orderDetail.lat), parseFloat(this.orderDetail.lng));
       
      if(this.orderMethod === 'delivery'){
        this.mark = { lat: parseFloat(this.orderDetail.lat), lng: parseFloat(this.orderDetail.lng) };
        this.options.center = this.mark;
      this.setUpMap(this.options.center);
      }else{
        this.mark = { lat: parseFloat(this.userDetail.latitude), lng: parseFloat(this.userDetail.longitude) };
        this.options.center = this.mark;
      this.setUpMap(this.options.center);
      }
    }else{
      this.mark = { lat: parseFloat(this.userDetail.latitude), lng: parseFloat(this.userDetail.longitude) };
        this.options.center = this.mark;
        console.log("other");
      this.setUpMap(this.options.center);
    }
  }
  startTimer() {
    this.interval = setInterval(() => {
      if(this.orderDetail.reserveTime == ""){
        var formating = this.orderDetail.orderRemainingTime.split(":");
        var timeformat="00:00";
        var frame="mm:ss";
        if(formating.length == 3){
            timeformat="00:00:00";
            frame="HH:mm:ss";
        }else{
          timeformat="00:00";
          frame="mm:ss";

        }
      if (!this.orderDetail.orderRemainingTime.includes(timeformat)) {
        this.orderDetail.orderRemainingTime = moment(this.orderDetail.orderRemainingTime, frame).subtract(1, 'second').format(frame);
        if ((moment(this.orderDetail.orderRemainingTime, frame).get('seconds')) % 5 == 0 && this.orderDetail.orderId) {
          // this.apiService.updateTime(this.orderDetail.orderId, this.orderDetail.orderDeliveryTime);
        } else if (!this.orderDetail.orderId) {
          this.testOrder.updateTime(this.orderDetail.orderRemainingTime, this.orderDetail.index);
        }
      } else if (this.orderDetail.orderRemainingTime.includes(timeformat) && this.orderDetail.orderStatus.toLowerCase().includes('pending')) {
        if (this.orderDetail.orderId) {
          this.orderDetail.orderStatus = 'Missed';
          // this.apiService.updateStatus(this.orderDetail.orderId, 'Missed').then(() => {
          this.orderDetail.orderStatus = 'Missed';
          // });
        } else {
          this.testOrder.updateStatus('Missed', this.orderDetail.index).then(() => {
            this.orderDetail.orderStatus = 'Missed';
          });
        }
      } else if (this.orderDetail.orderRemainingTime.includes(timeformat) && this.orderDetail.orderStatus.toLowerCase().includes('accepted')) {
        if (this.orderDetail.orderId) {
          //   this.apiService.updateStatus(order.orderId, 'Missed').then(() => {
          this.orderDetail.orderStatus = 'Completed';
          //   });
        } else {
          this.testOrder.updateStatus('Completed', this.orderDetail.index).then(() => {
            this.orderDetail.orderStatus = 'Completed';
          });
        }
      }
    }else{
      var findformat=this.orderDetail.orderRemainingTime.split(" ");
      var format='';
      if(findformat.length==2){
        format = "00 00:00:00";
      }else{
        format = "00:00:00";
      }
      if (!this.orderDetail.orderRemainingTime.includes(format) && ['accepted', 'pending'].includes(this.orderDetail.orderStatus.toLowerCase())) {
        //console.log(moment(order.orderRemainingTime, 'mm:ss').format('HH:mm:ss'));
        if(format == "00 00:00:00"){
          this.orderDetail.orderRemainingTime = moment(this.orderDetail.orderRemainingTime, 'DD HH:mm:ss',true).subtract(1, 'second').format('DD HH:mm:ss');

        }else{
          this.orderDetail.orderRemainingTime = moment(this.orderDetail.orderRemainingTime, 'HH:mm:ss',true).subtract(1, 'second').format('HH:mm:ss');

        }
      }  
      else if (this.orderDetail.orderRemainingTime.includes(format) && this.orderDetail.orderStatus.toLowerCase().includes('pending')) {
        if (this.orderDetail.orderId) {
          //   this.apiService.updateStatus(order.orderId, 'Missed').then(() => {
            this.orderDetail.orderStatus = 'Missed';
          //   });
        }
      }
      else if (this.orderDetail.orderRemainingTime.includes(format) && this.orderDetail.orderStatus.toLowerCase().includes('accepted')) {
        if (this.orderDetail.orderId) {
          //   this.apiService.updateStatus(order.orderId, 'Missed').then(() => {
            this.orderDetail.orderStatus = 'Completed';
          //   });
        } 
      }
    }
    }, 1000);
  }
  getOrderDetailsFromApi() {
    return this.apiService.getOrderFromId(this.navService.myParam.orderId);
  }
  async getOrderDetailsFromStorage() {
    return await this.testOrder.getOrderDetailByIndex(this.navService.myParam.index);
    // return JSON.parse('{"name":"My Thai Restaurant","address":"198 Shirley Street, PIMPAMA QLD 4209, AUSTRALIA","mobile":"+61 123 456 789","email":"alibabaa@gmail.com","orderStatus":"1","orderTime":"2020-12-04 15:33:42","orderRemainingTime":"00:00","orderDeliveryTime":"2020-12-04 15:58:54","paymentMethod":"Online","deliveryNote":"Please when you reach at door step","order":[{"id":"","price":"150.0","productName":"Margarita","quantity":"1","tax":"15.0","addOns":[{"name":"Extra Chess","status":"Add"}]},{"id":"","price":"150.0","productName":"Margarita","quantity":"2","tax":"15.0","addOns":[{"name":"Extra Chess","status":"Add"}]}],"orderProduct":[{"id":"","price":"150.0","productName":"Margarita","quantity":"1","tax":"15.0","addOns":[{"name":"Extra Chess","status":"Add"}]}],"lat":-27.7091963,"lng":153.2201116,"index":292670}');
  }
  async getPrinters(restaurant_id){
    this.getAllPrinters=(await this.printerService.getPrinterFromId(restaurant_id));
   }
  ionViewDidEnter() {
    this.orderDetail = this.navService.myParam;
    this.reserveTime =  this.orderDetail.reserveTime;
    this.orderMethod=this.orderDetail.orderMethod;
  
   
    if(this.orderMethod == "pickup" && this.orderDetail.paymentMethod=="stripe"){
       this.orderStatus="Paid Online";
    }
    else if(this.orderMethod == "pickup" && this.orderDetail.paymentMethod == "Cash"){
       this.orderStatus="Pay at Counter";
    }

    this.printer=GlobalConstants.selectedPrinter;
    this.isKitchen=GlobalConstants.kitchen;
    this.isCounter=GlobalConstants.counter
    this.socket=GlobalConstants.selectWifiPrinter;
    this.isWifiCounter=GlobalConstants.wifiCounter;
    this.isWifiKitchen=GlobalConstants.wifiKitchen;

    setTimeout(() => {
      this.getData();
    }, 100);

    this.newOrderInterval = setInterval(() => {
        this.getLiveData(true);
    },5000);

    
    

  }
 
  async getRestaurant(){
   const user = (await this.apiService.getUserDetails()).data;
    this.restaurantInfo=user.restaurant;    
  }
  getNewCustomer(){
    if(this.orderDetail.createdAt != undefined){
      var customer=moment.utc(this.orderDetail.createdAt).utcOffset('+10:00');
      if(moment(customer).isSame(moment(), 'day')){
        return true;
      }
    }else{
      return false;
    }
  }
  ionViewDidLeave() {
    clearInterval(this.interval);
    clearInterval(this.newOrderInterval);
  }
  ngOnInit() {
    // this.getRestaurant();
     

  }

  replyOrder(action: boolean) {
    this.navService.myParam = this.orderDetail;
    this.navCtrl.navigateForward((action) ? 'order-accept' : 'order-reject');
  }

  getOrderStatus() {
    if (this.orderDetail && this.orderDetail.orderStatus) {
      return 'order-detail ' + ((!this.orderDetail.orderStatus.toLowerCase().includes('pending')) ? (!['accepted', 'completed'].includes(this.orderDetail.orderStatus.toLowerCase())) ? 'odr-reject' : 'odr-accept' : 'odr-pandding');
    }
    return 'order-detail';
  }

  getTotalQuantity() {
    let total = 0;
    if (this.orderDetail.order && this.orderDetail.order.length > 0) {
      this.orderDetail.order.map((item) => {
        total += (Number.parseInt(item.quantity));
      });
    }
    return total;
  }
  getTel(phone: string) {
    return 'tel:+61 ' + phone;
  }
  printCashRecipt(printaddr:any){
    var current=new Date(this.orderDetail.orderTime);
    var order_time=moment.utc(current).utcOffset('+10:00').format('MMM D - hh:mm A');

    var current1=new Date(this.orderDetail.orderDeliveryTime);
    var order_deliverytime=moment.utc(current1).utcOffset('+10:00').format('MMM D - hh:mm A');
    var difference = moment.utc(current1,"HH:mm:ss").utcOffset('+10:00').diff(moment.utc(current,"HH:mm:ss").utcOffset('+10:00'), 'minutes')

    var subTotal=this.getSubTotal();
    var tax=this.getTax();
    var vtotal=this.getTotal();

    const doc = new Document();
    let escposCommands;

    

    ESCPOSImage.load('data:image/png;base64,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').then(logo => {
    escposCommands = doc
        .newLine()
        .newLine()
        .newLine()
        .setColorMode(true)
        .raw([27,99,48,2])
        .setPrintWidth(550)
        .size(0,0)
        .font(FontFamily.A)
        
        
        var headerMethodtxt= (" "+this.orderMethod).length;
       if(this.orderMethod == "pickup" || this.orderMethod =="table_reservation" || this.orderMethod == "order_later"){
         var order_method="";
         if(this.orderMethod == "pickup"){
           order_method="Pickup";
         }
         else if(this.orderMethod == "table_reservation"){
           order_method="Table Reservation";
         }
         else if(this.orderMethod == "order_later"){
           order_method = "Order for Later";
         }else{
           order_method = this.orderMethod;
         }
        escposCommands = doc
        .align(TextAlignment.LeftJustification)
        .text("     ")
        .reverseColors(true)
        .raw([27,50])
        .style([FontStyle.Bold])
        .text(" "+order_method)
        for(var i=0;i<(33-headerMethodtxt);i++){
          escposCommands=doc
           .text(" ")
          }
          escposCommands=doc
          .newLine()
        }

        if(this.orderDetail.paymentMethod == 'Cash'){
          var headerMethodtxt1= " Pay in Restaurant".length;
       
          escposCommands = doc
          .reverseColors(false)
          .align(TextAlignment.LeftJustification)
          .text("     ")
          .reverseColors(true)
          .raw([27,50])
          .style([FontStyle.Bold])
          .text(" Pay in Restaurant")
          for(var i=0;i<(33-headerMethodtxt1);i++){
            escposCommands=doc
             .text(" ")
            }
            escposCommands=doc
              .reverseColors(false)
              .newLine()
              .text("     ")
              .raw([179])

              for(var i=0;i<(31);i++){
                escposCommands=doc
                  .text(" ")
              }
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])
                  var boxtext="ORDER NOT PAID".length;
                  escposCommands=doc
                    .text(" ")
                    .text("ORDER NOT PAID")
    
                  var boxtextlength=boxtext+2;
                  for(var i=0;i<(32-boxtextlength);i++){
                        escposCommands=doc
                          .text(" ")
                  }

              
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])

            for(var i=0;i<(31);i++){
                    escposCommands=doc
                      .text(" ")
              }
                
                  escposCommands=doc
                      .raw([179])
                      .newLine()


                escposCommands=doc   
                  .text("     ")
                  .raw([192])
                
              for(var i=0; i<31;i++){    
                escposCommands=doc  
                  .raw([196]) 
              }
                escposCommands=doc     
                  .raw([217])  
                  


            escposCommands=doc
            .newLine()
        }

        if(this.orderDetail.paymentMethod == 'Stripe'){
          var headerMethodtxt1= " Paid Online".length;
          var cardType=" VISA".length;
          var totalCardSpace=headerMethodtxt1+cardType;
       
          escposCommands = doc
          .reverseColors(false)
          .align(TextAlignment.LeftJustification)
          .text("     ")
          .reverseColors(true)
          .raw([27,50])
          .style([FontStyle.Bold])
          .text(" Paid Online")
          for(var i=0;i<(33-totalCardSpace);i++){
            escposCommands=doc
             .text(" ")
            }
            escposCommands=doc
             .text(" VISA")
            escposCommands=doc
              .reverseColors(false)
              .newLine()
              .text("     ")
              .raw([179])

              for(var i=0;i<(31);i++){
                escposCommands=doc
                  .text(" ")
              }
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])
                  var boxtext=" EX 07/2023".length;
                  var endsin=" ENDS IN 7890".length;
                  var totalends=boxtext+endsin;
                  escposCommands=doc
                    .text(" EX 07/2023")
    
                  var boxtextlength=boxtext+2;
                  for(var i=0;i<(31-totalends);i++){
                        escposCommands=doc
                          .text(" ")
                  }
                  escposCommands=doc
                    .text(" ENDS IN 7890")

              
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])

                  for(var i=0;i<(31);i++){
                    escposCommands=doc
                      .text(" ")
              }
                
                  escposCommands=doc
                      .raw([179])
                      .newLine()


                escposCommands=doc   
                  .text("     ")
                  .raw([192])
                
              for(var i=0; i<31;i++){    
                escposCommands=doc  
                  .raw([196]) 
              }
                escposCommands=doc     
                  .raw([217])  
                  


            escposCommands=doc
            .newLine()
        }

        if(this.orderMethod == 'delivery'){
          var delivery_length= this.orderDetail.address.length;
          var delivery_words=this.orderDetail.address.split(" ");
          var deliver_words_len=delivery_words.length/2
          var half_delivery_length=delivery_length/2;
          var delivery_head=" Delivery".length;
          

          var cardType=" VISA".length;
          var totalCardSpace=headerMethodtxt1+cardType;
       
          escposCommands = doc
          .reverseColors(false)
          .align(TextAlignment.LeftJustification)
          .text("     ")
          .reverseColors(true)
          .raw([27,50])
          .style([FontStyle.Bold])
          .text(" Delivery")
          for(var i=0;i<(33-delivery_head);i++){
            escposCommands=doc
             .text(" ")
            }
            
            escposCommands=doc
              .reverseColors(false)
              .newLine()
              .text("     ")
              .raw([179])

              for(var i=0;i<(31);i++){
                escposCommands=doc
                  .text(" ")
              }
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])
              for(var j=0;j<half_delivery_length;j++){
                  escposCommands=doc
                    .text(this.orderDetail.address[j])
              }
                 escposCommands=doc
                  .text("-")
                  
                  for(var i=0;i<(30-half_delivery_length);i++){
                        escposCommands=doc
                          .text(" ")
                  }
                 

              
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])

                  for(var j=half_delivery_length;j<delivery_length;j++){
                    escposCommands=doc
                      .text(this.orderDetail.address[j])
                }
      
                    
                    for(var i=0;i<(31-half_delivery_length);i++){
                          escposCommands=doc
                            .text(" ")
                    }
                
                  escposCommands=doc
                      .raw([179])
                      .newLine()


                escposCommands=doc   
                  .text("     ")
                  .raw([192])
                
              for(var i=0; i<31;i++){    
                escposCommands=doc  
                  .raw([196]) 
              }
                escposCommands=doc     
                  .raw([217])  
                  


            escposCommands=doc
            .newLine()
        }

        
        var headertxt1= " As soon as possible".length;
        var headertxt2 =("~"+difference+"min").length;
        var headertotal=headertxt1 + headertxt2;
        escposCommands = doc
        .align(TextAlignment.LeftJustification)
        .reverseColors(false)
        .text("     ")
        .reverseColors(true)
        .raw([27,50])
        .style([FontStyle.Bold])
        .text(" As soon as possible")
        for(var i=0;i<(32-headertotal);i++){
          escposCommands=doc
           .text(" ")
          }
        escposCommands=doc
        .text("~"+difference+" min")
        .reverseColors(false)
        .setColorMode(false)
        .newLine()
        .newLine()
        .newLine()
            
            .size(1,0)
            .style([FontStyle.Bold])
            .text("Order Details:")
            .newLine()
            .newLine()
            .style([])
            .size(0,0)
          
            var orderIDLength="Order ID: ".length;
            var orderID=this.orderDetail.orderId.length;
            var total = orderIDLength + orderID;

            escposCommands=doc
            .align(TextAlignment.LeftJustification)
            .text("Order ID: ")
            for(var i=0;i<(44-total);i++){
            escposCommands=doc
             .text(" ")
            }
            escposCommands=doc
            .text(this.orderDetail.orderId)
            .newLine()

            orderIDLength = "Order Accepted At: ".length;
            orderID = order_time.length;
            total = orderIDLength + orderID

            escposCommands=doc
            .text("Order Accepted At: ")
            

            for(var i=0;i<(44-total);i++){
              escposCommands=doc
               .text(" ")
            }

           
           
            escposCommands=doc
            .text(order_time)
            .newLine()
            
            orderIDLength = "Estimated Fulfilment At: ".length;
            orderID = order_deliverytime?order_deliverytime.length:0
            total = orderIDLength + orderID;


            escposCommands=doc
            .text("Estimated Fulfilment At: ")

            for(var i=0;i<(44-total);i++){
              escposCommands=doc
               .text(" ")
            }

            escposCommands=doc
            .text(order_deliverytime?order_deliverytime:"")
            .newLine()

             
            

           if(this.orderDetail.deliveryNote){

            escposCommands=doc
              .newLine()
              .style([FontStyle.Bold])
              .size(2,1)
              .text("! ")
              .style([])
              .size(0,0.5)
              .marginBottom(20)
              .control(FeedControlSequence.CarriageReturn)
              .text(this.orderDetail.deliveryNote)
           }

           escposCommands=doc
              .newLine()
              .size(1,0)
              .style([FontStyle.Bold])
              .text("Client Info: ")
              .newLine()
              .newLine()
              .style([])
              .size(0,0)

            var clientNameHd="First Name:".length;
            var clientLastNameHd="Last Name:".length;
            var clientphoneHd="Phone:".length;
            var clientEmailHd="Email:".length;

            var clientName=this.orderDetail.firstName.length;
            var clientLastName=this.orderDetail.lastName.length;
            var clientphone=this.orderDetail.telephone.length;
            var clientEmail=this.orderDetail.email.length;

            var clientNameTotal=clientNameHd+clientName;
            var clientLastNameTotal=clientLastNameHd+clientLastName;
            var clientPhoneTotal=clientphoneHd+clientphone;
            var clientEmailTotal=clientEmailHd+clientEmail;

            escposCommands=doc
              .text("First Name:")
            
            for(var j=0;j<44-clientNameTotal;j++){
              escposCommands=doc
                .text(" ")
            }
            escposCommands=doc
              .text(this.orderDetail.firstName)
              .newLine()

              escposCommands=doc
              .text("Last Name:")
            
            for(var j=0;j<44-clientLastNameTotal;j++){
              escposCommands=doc
                .text(" ")
            }
            escposCommands=doc
              .text(this.orderDetail.lastName)
              .newLine()
          
              escposCommands=doc
              .text("Email:")
            
            for(var j=0;j<44-clientEmailTotal;j++){
              escposCommands=doc
                .text(" ")
            }
            escposCommands=doc
              .text(this.orderDetail.email)
              .newLine()

              escposCommands=doc
              .text("Phone:")
            
            for(var j=0;j<44-clientPhoneTotal;j++){
              escposCommands=doc
                .text(" ")
            }
            escposCommands=doc
              .text(this.orderDetail.telephone)
              .newLine()
              
           escposCommands=doc
                .newLine()
                .size(1,0)
                .style([FontStyle.Bold])
                .text("Items: ")
                .newLine()
                .newLine()
                .style([])
                .size(0,0)
           

            if (this.orderDetail.order && this.orderDetail.order.length > 0) {
              this.orderDetail.order.map((item) => {
                var itemPrice=this.getPrice(item)
                var qtyLength=(item.quantity+"x").length;
                var tabLength=4;
                var itemLength=item.productName.length;
                var pricelength=itemPrice.length;
                var totalItemLength=qtyLength+tabLength+itemLength+pricelength;
                if(itemLength > 24){
                  var totalItemLength=qtyLength+tabLength+24+pricelength;
                }

                escposCommands = doc
                  .style([FontStyle.Bold])
                  .text(item.quantity+"x")
                  .control(FeedControlSequence.HorizontalTab)
                if(itemLength > 24){
                  for(var j=0;j<24;j++){
                    escposCommands=doc
                      .text(item.productName[j])
                  }
                }else{
                  escposCommands=doc
                  .text(item.productName)
                  .align(TextAlignment.RightJustification)
                }

                for(var i=0;i<(42-totalItemLength);i++){
                  escposCommands=doc
                   .text(" ")
                }
                escposCommands=doc 
                  .text(itemPrice)
                
                if(itemLength > 24){
                  escposCommands = doc
                          .newLine()
                          .style([FontStyle.Bold])
                          .text("  ")
                          .control(FeedControlSequence.HorizontalTab)
                          
                  
                  for(var j=24;j<itemLength;j++){
                  escposCommands=doc
                   .text(item.productName[j])
                  }
                  escposCommands=doc
                  .style([])
                  
                          
                }
                 
                          
                  if(item.orderProductChoices.length > 0){
                    item.orderProductChoices.map((choice) => {
                      escposCommands = doc
                          .newLine()
                          .style([FontStyle.Italic])
                          .text("  ")
                          .control(FeedControlSequence.HorizontalTab)
                          .style([FontStyle.Italic])
                          .text(choice.groupName+": ")
                          .newLine()
                          .text("  ")
                          .control(FeedControlSequence.HorizontalTab)
                          .text(choice.groupOptionName)

                          var groupLength=choice.groupOptionName.length;
                          var distanceLength=6;
                          var choicPrice=0;
                          var selectedChoicePrice="0.00";
                          if(choice.optionPrice == null || choice.optionPrice == undefined){
                            choicPrice=1;
                            selectedChoicePrice="0.00";
                          }else{
                          selectedChoicePrice=choice.optionPrice;
                          choicPrice=selectedChoicePrice.length;
                          }
                          var totalOptionLength=groupLength+distanceLength+choicPrice;

                          for(var i=0;i<(42-(totalOptionLength+1));i++){
                            escposCommands=doc
                             .text(" ")
                          }
      
                          escposCommands=doc
                          .text("+"+selectedChoicePrice)

                          


                    }
                    );
                  }
                        if(item.instructions){
                          escposCommands=doc
                            .newLine()
                            .text("  ")
                            .control(FeedControlSequence.HorizontalTab)
                            .style([FontStyle.Bold])
                            .size(1,0)
                            .text("!")
                            .size(0,0)
                            .style([FontStyle.Italic])
                            .text(item.instructions)
                           
                            .style([])
                            
                        }
                 escposCommands =doc
                  .newLine()
                  .newLine()

              });
            }
           
           
            escposCommands=doc
              .newLine()
              .newLine()
             
              .style([])
              .size(0,0)
              .text("SubTotal")

            var subTotalLength="SubTotal".length;
            var subTotalact=subTotal.length;
            var totalCount=subTotalLength+subTotalact
            for(var i=0;i<(44-totalCount);i++){
                escposCommands=doc
                 .text(" ")
            }
              escposCommands=doc
               .text(subTotal)
               .newLine()
              .text("Tax GST included")
               subTotalLength="Tax GST included".length;
               subTotalact=tax.length;
               totalCount=subTotalact+subTotalLength
              for(var i=0;i<(44-totalCount);i++){
                escposCommands=doc
                .text(" ")
              }
             
              escposCommands=doc
              .text(tax)
              .newLine()
              .style([FontStyle.Bold])
              .align(TextAlignment.LeftJustification)
              .text("Total")
            
              subTotalLength="Total".length;
              subTotalact=vtotal.length;
              totalCount=subTotalact+subTotalLength
              for(var i=0;i<(44-totalCount);i++){
                escposCommands=doc
                .text(" ")
              }
              escposCommands=doc
              .text(vtotal)
              .newLine()
              .style([])
              .size(0,0)
              .newLine()
              .newLine()
              
              

         
         
         

         escposCommands=doc
          .newLine()
          .style([FontStyle.Bold])
       if(this.restaurantInfo.websiteUrl !="" || this.restaurantInfo.websiteUrl !=null){
        escposCommands=doc
              .newLine()
              .text("      ")
              .raw([218])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([191])
              .newLine()
              .text("      ")
              .raw([179])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([179])
              .newLine()
              .text("      ")

              
              

              .raw([179])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              var orderOnlinetext="Order Online At:".length;
              escposCommands=doc
              .text("Order Online At:")
              for(var j=0;j<26-orderOnlinetext;j++){
                escposCommands=doc
                .raw([255])
              }
              escposCommands=doc
              .raw([179])
              .newLine()
              .text("      ")

              .raw([179])
              
              var orderOnlinetext1=this.restaurantInfo.websiteUrl.length;
              var spacesre=(35-orderOnlinetext1)/2;
              var space1=0;
              var space2=0;
              if(spacesre % 2 == 0){

                space1=spacesre;
                space2=spacesre;
                  
              }else{
               

                space1=Math.floor(spacesre);
                space2=Math.round(spacesre);
              }
              for(var j=0;j<space1;j++){
                escposCommands=doc
                .raw([255])
              }
              escposCommands=doc
              .text(this.restaurantInfo.websiteUrl)
              for(var j=0;j<space2;j++){
                escposCommands=doc
                .raw([255])
              }


              escposCommands=doc
              .raw([179])
              .newLine()
              .text("      ")

              .raw([179])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([179])
              .newLine()
              .text("      ")

              .raw([192])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([217])
              .newLine()
            }

          escposCommands=doc
          .newLine()
          .align(TextAlignment.Center)
          .style([FontStyle.Bold])
          .text(this.restaurantInfo.restaurantName)
          .newLine()
          .style([])
          .text(this.restaurantInfo.streetName)
          .newLine()
          .text(this.restaurantInfo.city+ ' QLD '+ this.restaurantInfo.postCode)
          .newLine()
          for(var i=0;i<2;i++){
            escposCommands = doc
            .text(this.restaurantInfo.phoneNumber[i])
          }
          escposCommands = doc
            .text(" ")
          for(var i=2;i<6;i++){
            escposCommands = doc
            .text(this.restaurantInfo.phoneNumber[i])
          }
          escposCommands = doc
          .text(" ")
          for(var i=6;i<9;i++){
            escposCommands = doc
            .text(this.restaurantInfo.phoneNumber[i])
          }
          escposCommands=doc
          .feed(2)
          /*
         ESCPOSImage.load('data:image/png;base64,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').then(logo => {
           escposCommands = doc
           .align(TextAlignment.Center)
           .image(logo,BitmapDensity.D24)
           .feed(1)

        
       
        
  });
       
*/
        
          
          ESCPOSImage.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAc0AAABTCAYAAAD9XlyaAAAgAElEQVR4Ae2dB/gcRfnHUcGCWKKC0oRIkBCa9CIISAABJTTxoamEEhJIgETFgpQkQKihhiIIERJAUAgoKFWq0kFIDL0EJIh0iRQf5/981v/8Mrc3szu7O7O3v7t3nueevbu9m539vrPznXnnLQsoKYKAICAICAKCgCDghcACXr+SHwkCgoAgIAjUgsB7772npk6dqkaOHKlOPvnkWq4pF/FHQEjTHyv5pSAgCAgCURB455131N13363GjBmjPv3pT6sPfOADavHFF1fjxo2Lcj2ptDwCQprlsZN/CgKCgCBQGQFWloceeqhadtll1Qc/+EG1wAILqNVWW0397ne/U/Pmzatcv1QQFgEhzbB4Sm2CgCAgCHgj8NJLL6ktt9wyWVlClqww11lnHTVnzhzvOuSH9SIgpFkv3nI1QUAQEAQSBP7+97+rrbfeuo8wIc0vfelL6p577hGEGoyAkGaDhSNNEwQEge5FYPjw4X3qWAgT1ewhhxwS9Ib/+9//qqefflpdd9116vzzz1ff/OY31corr6xWWGEFtcQSSyTHIUOGqO9973vq0ksvVffff79if1WKGwEhTTc2ckYQEAQEgSgIsJr86Ec/muxfarXsV77ylYTgQlzwueeeUxdccIHabLPN1Je//GU1YMAA9ZnPfEZ9/vOfT95//OMfVx/60If6rk8b+MxvNt54YzVjxgz1/vvvh2hK19UhpNl1IpUbEgQEgSYj8J///EeNHj26hbAWWmghNXHiRMXKMEQZNWqU+tSnPqUg4j322EMddthh6qSTTkqMi6ZNm6YOP/zwxKVl8ODBLeQNefKCVPn9P//5zxDN6ao6hDS7SpxyM4JAdyLAquf1119Xjz32WL8fyK+99lq16qqrtpDmF7/4RXXzzTcHE94zzzyjZs6cqd544w0FSbsKhkgPPPCAWnfdda0rz0033VQ9/PDDrr839nv6y1tvvaWeffZZ9cQTT6hHHnkkWL8R0mys2KVhgkDvIvCvf/1LPfXUU+r2229P9uN+/etfqwMOOEB94QtfUMcff3y/BubYY49VH/vYx1pIc/XVV1e4nnSqoM7db7/91IILLtjSLlad66+/vuJ8kwor8jfffDOxMp41a5b685//rG666aakr+Cqg2r6xz/+sVp7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').then(logo => {
          escposCommands=doc
            .newLine()
            .align(TextAlignment.Center)
            .style([FontStyle.Bold])
            .text("Proudly powered by")
            .style([])
            .feed(1)
            .image(logo,BitmapDensity.D24)
            .text("Order thai takes orders on behalf of").newLine().text("resturant. If there is  a problem please").newLine().text(" contact restaurant directly.")
            .feed(5)
            .cut()
            .generateUInt8Array()
            
          });
        console.log(escposCommands);
        this.bluetooth.connect(printaddr).subscribe(() => {
          this.bluetooth.write(escposCommands)
            .then(() => {
              console.log('Print success');
            })
            .catch((err) => {
              console.error(err);
    
            });
        });
    });
  }

  printCashSocketRecipt(printaddr:any,port:any){
    var current=new Date(this.orderDetail.orderTime);
    var order_time=moment.utc(current).utcOffset('+10:00').format('MMM D - hh:mm A');

    var current1=new Date(this.orderDetail.orderDeliveryTime);
    var order_deliverytime=moment.utc(current1).utcOffset('+10:00').format('MMM D - hh:mm A');
    var difference = moment.utc(current1,"HH:mm:ss").utcOffset('+10:00').diff(moment.utc(current,"HH:mm:ss").utcOffset('+10:00'), 'minutes')

    var subTotal=this.getSubTotal();
    var tax=this.getTax();
    var vtotal=this.getTotal();

    const doc = new Document();
    let escposCommands;

    

    ESCPOSImage.load('data:image/png;base64,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').then(logo => {
    escposCommands = doc
        .newLine()
        .newLine()
        .newLine()
        .setColorMode(true)
        .raw([27,99,48,2])
        .setPrintWidth(550)
        .size(0,0)
        .font(FontFamily.A)
        
        
        var headerMethodtxt= (" "+this.orderMethod).length;
       if(this.orderMethod == "pickup" || this.orderMethod =="table_reservation" || this.orderMethod == "order_later"){
         var order_method="";
         if(this.orderMethod == "pickup"){
           order_method="Pickup";
         }
         else if(this.orderMethod == "table_reservation"){
           order_method="Table Reservation";
         }
         else if(this.orderMethod == "order_later"){
           order_method = "Order for Later";
         }else{
           order_method = this.orderMethod;
         }
        escposCommands = doc
        .align(TextAlignment.LeftJustification)
        .text("     ")
        .reverseColors(true)
        .raw([27,50])
        .style([FontStyle.Bold])
        .text(" "+order_method)
        for(var i=0;i<(33-headerMethodtxt);i++){
          escposCommands=doc
           .text(" ")
          }
          escposCommands=doc
          .newLine()
        }

        if(this.orderDetail.paymentMethod == 'Cash'){
          var headerMethodtxt1= " Pay in Restaurant".length;
       
          escposCommands = doc
          .reverseColors(false)
          .align(TextAlignment.LeftJustification)
          .text("     ")
          .reverseColors(true)
          .raw([27,50])
          .style([FontStyle.Bold])
          .text(" Pay in Restaurant")
          for(var i=0;i<(33-headerMethodtxt1);i++){
            escposCommands=doc
             .text(" ")
            }
            escposCommands=doc
              .reverseColors(false)
              .newLine()
              .text("     ")
              .raw([179])

              for(var i=0;i<(31);i++){
                escposCommands=doc
                  .text(" ")
              }
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])
                  var boxtext="ORDER NOT PAID".length;
                  escposCommands=doc
                    .text(" ")
                    .text("ORDER NOT PAID")
    
                  var boxtextlength=boxtext+2;
                  for(var i=0;i<(32-boxtextlength);i++){
                        escposCommands=doc
                          .text(" ")
                  }

              
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])

            for(var i=0;i<(31);i++){
                    escposCommands=doc
                      .text(" ")
              }
                
                  escposCommands=doc
                      .raw([179])
                      .newLine()


                escposCommands=doc   
                  .text("     ")
                  .raw([192])
                
              for(var i=0; i<31;i++){    
                escposCommands=doc  
                  .raw([196]) 
              }
                escposCommands=doc     
                  .raw([217])  
                  


            escposCommands=doc
            .newLine()
        }

        if(this.orderDetail.paymentMethod == 'Stripe'){
          var headerMethodtxt1= " Paid Online".length;
          var cardType=" VISA".length;
          var totalCardSpace=headerMethodtxt1+cardType;
       
          escposCommands = doc
          .reverseColors(false)
          .align(TextAlignment.LeftJustification)
          .text("     ")
          .reverseColors(true)
          .raw([27,50])
          .style([FontStyle.Bold])
          .text(" Paid Online")
          for(var i=0;i<(33-totalCardSpace);i++){
            escposCommands=doc
             .text(" ")
            }
            escposCommands=doc
             .text(" VISA")
            escposCommands=doc
              .reverseColors(false)
              .newLine()
              .text("     ")
              .raw([179])

              for(var i=0;i<(31);i++){
                escposCommands=doc
                  .text(" ")
              }
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])
                  var boxtext=" EX 07/2023".length;
                  var endsin=" ENDS IN 7890".length;
                  var totalends=boxtext+endsin;
                  escposCommands=doc
                    .text(" EX 07/2023")
    
                  var boxtextlength=boxtext+2;
                  for(var i=0;i<(31-totalends);i++){
                        escposCommands=doc
                          .text(" ")
                  }
                  escposCommands=doc
                    .text(" ENDS IN 7890")

              
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])

                  for(var i=0;i<(31);i++){
                    escposCommands=doc
                      .text(" ")
              }
                
                  escposCommands=doc
                      .raw([179])
                      .newLine()


                escposCommands=doc   
                  .text("     ")
                  .raw([192])
                
              for(var i=0; i<31;i++){    
                escposCommands=doc  
                  .raw([196]) 
              }
                escposCommands=doc     
                  .raw([217])  
                  


            escposCommands=doc
            .newLine()
        }

        if(this.orderMethod == 'delivery'){
          var delivery_length= this.orderDetail.address.length;
          var delivery_words=this.orderDetail.address.split(" ");
          var deliver_words_len=delivery_words.length/2
          var half_delivery_length=delivery_length/2;
          var delivery_head=" Delivery".length;
          

          var cardType=" VISA".length;
          var totalCardSpace=headerMethodtxt1+cardType;
       
          escposCommands = doc
          .reverseColors(false)
          .align(TextAlignment.LeftJustification)
          .text("     ")
          .reverseColors(true)
          .raw([27,50])
          .style([FontStyle.Bold])
          .text(" Delivery")
          for(var i=0;i<(33-delivery_head);i++){
            escposCommands=doc
             .text(" ")
            }
            
            escposCommands=doc
              .reverseColors(false)
              .newLine()
              .text("     ")
              .raw([179])

              for(var i=0;i<(31);i++){
                escposCommands=doc
                  .text(" ")
              }
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])
              for(var j=0;j<half_delivery_length;j++){
                  escposCommands=doc
                    .text(this.orderDetail.address[j])
              }
                 escposCommands=doc
                  .text("-")
                  
                  for(var i=0;i<(30-half_delivery_length);i++){
                        escposCommands=doc
                          .text(" ")
                  }
                 

              
              escposCommands=doc
                  .raw([179])
                  .newLine()
                  .text("     ")
                  .raw([179])

                  for(var j=half_delivery_length;j<delivery_length;j++){
                    escposCommands=doc
                      .text(this.orderDetail.address[j])
                }
      
                    
                    for(var i=0;i<(31-half_delivery_length);i++){
                          escposCommands=doc
                            .text(" ")
                    }
                
                  escposCommands=doc
                      .raw([179])
                      .newLine()


                escposCommands=doc   
                  .text("     ")
                  .raw([192])
                
              for(var i=0; i<31;i++){    
                escposCommands=doc  
                  .raw([196]) 
              }
                escposCommands=doc     
                  .raw([217])  
                  


            escposCommands=doc
            .newLine()
        }

        
        var headertxt1= " As soon as possible".length;
        var headertxt2 =("~"+difference+"min").length;
        var headertotal=headertxt1 + headertxt2;
        escposCommands = doc
        .align(TextAlignment.LeftJustification)
        .reverseColors(false)
        .text("     ")
        .reverseColors(true)
        .raw([27,50])
        .style([FontStyle.Bold])
        .text(" As soon as possible")
        for(var i=0;i<(32-headertotal);i++){
          escposCommands=doc
           .text(" ")
          }
        escposCommands=doc
        .text("~"+difference+" min")
        .reverseColors(false)
        .setColorMode(false)
        .newLine()
        .newLine()
        .newLine()
            
            .size(1,0)
            .style([FontStyle.Bold])
            .text("Order Details:")
            .newLine()
            .newLine()
            .style([])
            .size(0,0)
          
            var orderIDLength="Order ID: ".length;
            var orderID=this.orderDetail.orderId.length;
            var total = orderIDLength + orderID;

            escposCommands=doc
            .align(TextAlignment.LeftJustification)
            .text("Order ID: ")
            for(var i=0;i<(44-total);i++){
            escposCommands=doc
             .text(" ")
            }
            escposCommands=doc
            .text(this.orderDetail.orderId)
            .newLine()

            orderIDLength = "Order Accepted At: ".length;
            orderID = order_time.length;
            total = orderIDLength + orderID

            escposCommands=doc
            .text("Order Accepted At: ")
            

            for(var i=0;i<(44-total);i++){
              escposCommands=doc
               .text(" ")
            }

           
           
            escposCommands=doc
            .text(order_time)
            .newLine()
            
            orderIDLength = "Estimated Fulfilment At: ".length;
            orderID = order_deliverytime?order_deliverytime.length:0
            total = orderIDLength + orderID;


            escposCommands=doc
            .text("Estimated Fulfilment At: ")

            for(var i=0;i<(44-total);i++){
              escposCommands=doc
               .text(" ")
            }

            escposCommands=doc
            .text(order_deliverytime?order_deliverytime:"")
            .newLine()

             
            

           if(this.orderDetail.deliveryNote){

            escposCommands=doc
              .newLine()
              .style([FontStyle.Bold])
              .size(2,1)
              .text("! ")
              .style([])
              .size(0,0.5)
              .marginBottom(20)
              .control(FeedControlSequence.CarriageReturn)
              .text(this.orderDetail.deliveryNote)
           }

           escposCommands=doc
              .newLine()
              .size(1,0)
              .style([FontStyle.Bold])
              .text("Client Info: ")
              .newLine()
              .newLine()
              .style([])
              .size(0,0)

            var clientNameHd="First Name:".length;
            var clientLastNameHd="Last Name:".length;
            var clientphoneHd="Phone:".length;
            var clientEmailHd="Email:".length;

            var clientName=this.orderDetail.firstName.length;
            var clientLastName=this.orderDetail.lastName.length;
            var clientphone=this.orderDetail.telephone.length;
            var clientEmail=this.orderDetail.email.length;

            var clientNameTotal=clientNameHd+clientName;
            var clientLastNameTotal=clientLastNameHd+clientLastName;
            var clientPhoneTotal=clientphoneHd+clientphone;
            var clientEmailTotal=clientEmailHd+clientEmail;

            escposCommands=doc
              .text("First Name:")
            
            for(var j=0;j<44-clientNameTotal;j++){
              escposCommands=doc
                .text(" ")
            }
            escposCommands=doc
              .text(this.orderDetail.firstName)
              .newLine()

              escposCommands=doc
              .text("Last Name:")
            
            for(var j=0;j<44-clientLastNameTotal;j++){
              escposCommands=doc
                .text(" ")
            }
            escposCommands=doc
              .text(this.orderDetail.lastName)
              .newLine()
          
              escposCommands=doc
              .text("Email:")
            
            for(var j=0;j<44-clientEmailTotal;j++){
              escposCommands=doc
                .text(" ")
            }
            escposCommands=doc
              .text(this.orderDetail.email)
              .newLine()

              escposCommands=doc
              .text("Phone:")
            
            for(var j=0;j<44-clientPhoneTotal;j++){
              escposCommands=doc
                .text(" ")
            }
            escposCommands=doc
              .text(this.orderDetail.telephone)
              .newLine()
              
           escposCommands=doc
                .newLine()
                .size(1,0)
                .style([FontStyle.Bold])
                .text("Items: ")
                .newLine()
                .newLine()
                .style([])
                .size(0,0)
           

            if (this.orderDetail.order && this.orderDetail.order.length > 0) {
              this.orderDetail.order.map((item) => {
                var itemPrice=this.getPrice(item)
                var qtyLength=(item.quantity+"x").length;
                var tabLength=4;
                var itemLength=item.productName.length;
                var pricelength=itemPrice.length;
                var totalItemLength=qtyLength+tabLength+itemLength+pricelength;
                if(itemLength > 24){
                  var totalItemLength=qtyLength+tabLength+24+pricelength;
                }

                escposCommands = doc
                  .style([FontStyle.Bold])
                  .text(item.quantity+"x")
                  .control(FeedControlSequence.HorizontalTab)
                if(itemLength > 24){
                  for(var j=0;j<24;j++){
                    escposCommands=doc
                      .text(item.productName[j])
                  }
                }else{
                  escposCommands=doc
                  .text(item.productName)
                  .align(TextAlignment.RightJustification)
                }

                for(var i=0;i<(42-totalItemLength);i++){
                  escposCommands=doc
                   .text(" ")
                }
                escposCommands=doc 
                  .text(itemPrice)
                
                if(itemLength > 24){
                  escposCommands = doc
                          .newLine()
                          .style([FontStyle.Bold])
                          .text("  ")
                          .control(FeedControlSequence.HorizontalTab)
                          
                  
                  for(var j=24;j<itemLength;j++){
                  escposCommands=doc
                   .text(item.productName[j])
                  }
                  escposCommands=doc
                  .style([])
                  
                          
                }
                 
                          
                  if(item.orderProductChoices.length > 0){
                    item.orderProductChoices.map((choice) => {
                      escposCommands = doc
                          .newLine()
                          .style([FontStyle.Italic])
                          .text("  ")
                          .control(FeedControlSequence.HorizontalTab)
                          .style([FontStyle.Italic])
                          .text(choice.groupName+": ")
                          .newLine()
                          .text("  ")
                          .control(FeedControlSequence.HorizontalTab)
                          .text(choice.groupOptionName)

                          var groupLength=choice.groupOptionName.length;
                          var distanceLength=6;
                          var choicPrice=0;
                          var selectedChoicePrice="0.00";
                          if(choice.optionPrice == null || choice.optionPrice == undefined){
                            choicPrice=1;
                            selectedChoicePrice="0.00";
                          }else{
                          selectedChoicePrice=choice.optionPrice;
                          choicPrice=selectedChoicePrice.length;
                          }
                          var totalOptionLength=groupLength+distanceLength+choicPrice;

                          for(var i=0;i<(42-(totalOptionLength+1));i++){
                            escposCommands=doc
                             .text(" ")
                          }
      
                          escposCommands=doc
                          .text("+"+selectedChoicePrice)

                          


                    }
                    );
                  }
                        if(item.instructions){
                          escposCommands=doc
                            .newLine()
                            .text("  ")
                            .control(FeedControlSequence.HorizontalTab)
                            .style([FontStyle.Bold])
                            .size(1,0)
                            .text("!")
                            .size(0,0)
                            .style([FontStyle.Italic])
                            .text(item.instructions)
                           
                            .style([])
                            
                        }
                 escposCommands =doc
                  .newLine()
                  .newLine()

              });
            }
           
           
            escposCommands=doc
              .newLine()
              .newLine()
             
              .style([])
              .size(0,0)
              .text("SubTotal")

            var subTotalLength="SubTotal".length;
            var subTotalact=subTotal.length;
            var totalCount=subTotalLength+subTotalact
            for(var i=0;i<(44-totalCount);i++){
                escposCommands=doc
                 .text(" ")
            }
              escposCommands=doc
               .text(subTotal)
               .newLine()
              .text("Tax GST included")
               subTotalLength="Tax GST included".length;
               subTotalact=tax.length;
               totalCount=subTotalact+subTotalLength
              for(var i=0;i<(44-totalCount);i++){
                escposCommands=doc
                .text(" ")
              }
             
              escposCommands=doc
              .text(tax)
              .newLine()
              .style([FontStyle.Bold])
              .align(TextAlignment.LeftJustification)
              .text("Total")
            
              subTotalLength="Total".length;
              subTotalact=vtotal.length;
              totalCount=subTotalact+subTotalLength
              for(var i=0;i<(44-totalCount);i++){
                escposCommands=doc
                .text(" ")
              }
              escposCommands=doc
              .text(vtotal)
              .newLine()
              .style([])
              .size(0,0)
              .newLine()
              .newLine()
              
              

         
         
         

         escposCommands=doc
          .newLine()
          .style([FontStyle.Bold])
       if(this.restaurantInfo.websiteUrl !="" || this.restaurantInfo.websiteUrl !=null){
        escposCommands=doc
              .newLine()
              .text("      ")
              .raw([218])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([191])
              .newLine()
              .text("      ")
              .raw([179])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([179])
              .newLine()
              .text("      ")

              
              

              .raw([179])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              var orderOnlinetext="Order Online At:".length;
              escposCommands=doc
              .text("Order Online At:")
              for(var j=0;j<26-orderOnlinetext;j++){
                escposCommands=doc
                .raw([255])
              }
              escposCommands=doc
              .raw([179])
              .newLine()
              .text("      ")

              .raw([179])
              
              var orderOnlinetext1=this.restaurantInfo.websiteUrl.length;
              var spacesre=(35-orderOnlinetext1)/2;
              var space1=0;
              var space2=0;
              if(spacesre % 2 == 0){

                space1=spacesre;
                space2=spacesre;
                  
              }else{
               

                space1=Math.floor(spacesre);
                space2=Math.round(spacesre);
              }
              for(var j=0;j<space1;j++){
                escposCommands=doc
                .raw([255])
              }
              escposCommands=doc
              .text(this.restaurantInfo.websiteUrl)
              for(var j=0;j<space2;j++){
                escposCommands=doc
                .raw([255])
              }


              escposCommands=doc
              .raw([179])
              .newLine()
              .text("      ")

              .raw([179])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([255])
              .raw([179])
              .newLine()
              .text("      ")

              .raw([192])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([196])
              .raw([217])
              .newLine()
            }

          escposCommands=doc
          .newLine()
          .align(TextAlignment.Center)
          .style([FontStyle.Bold])
          .text(this.restaurantInfo.restaurantName)
          .newLine()
          .style([])
          .text(this.restaurantInfo.streetName)
          .newLine()
          .text(this.restaurantInfo.city+ ' QLD '+ this.restaurantInfo.postCode)
          .newLine()
          for(var i=0;i<2;i++){
            escposCommands = doc
            .text(this.restaurantInfo.phoneNumber[i])
          }
          escposCommands = doc
            .text(" ")
          for(var i=2;i<6;i++){
            escposCommands = doc
            .text(this.restaurantInfo.phoneNumber[i])
          }
          escposCommands = doc
          .text(" ")
          for(var i=6;i<9;i++){
            escposCommands = doc
            .text(this.restaurantInfo.phoneNumber[i])
          }
          escposCommands=doc
          .feed(2)
          /*
         ESCPOSImage.load('data:image/png;base64,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').then(logo => {
           escposCommands = doc
           .align(TextAlignment.Center)
           .image(logo,BitmapDensity.D24)
           .feed(1)

        
       
        
  });
       
*/
        
          
          ESCPOSImage.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAc0AAABTCAYAAAD9XlyaAAAgAElEQVR4Ae2dB/gcRfnHUcGCWKKC0oRIkBCa9CIISAABJTTxoamEEhJIgETFgpQkQKihhiIIERJAUAgoKFWq0kFIDL0EJIh0iRQf5/981v/8Mrc3szu7O7O3v7t3nueevbu9m539vrPznXnnLQsoKYKAICAICAKCgCDghcACXr+SHwkCgoAgIAjUgsB7772npk6dqkaOHKlOPvnkWq4pF/FHQEjTHyv5pSAgCAgCURB455131N13363GjBmjPv3pT6sPfOADavHFF1fjxo2Lcj2ptDwCQprlsZN/CgKCgCBQGQFWloceeqhadtll1Qc/+EG1wAILqNVWW0397ne/U/Pmzatcv1QQFgEhzbB4Sm2CgCAgCHgj8NJLL6ktt9wyWVlClqww11lnHTVnzhzvOuSH9SIgpFkv3nI1QUAQEAQSBP7+97+rrbfeuo8wIc0vfelL6p577hGEGoyAkGaDhSNNEwQEge5FYPjw4X3qWAgT1ewhhxwS9Ib/+9//qqefflpdd9116vzzz1ff/OY31corr6xWWGEFtcQSSyTHIUOGqO9973vq0ksvVffff79if1WKGwEhTTc2ckYQEAQEgSgIsJr86Ec/muxfarXsV77ylYTgQlzwueeeUxdccIHabLPN1Je//GU1YMAA9ZnPfEZ9/vOfT95//OMfVx/60If6rk8b+MxvNt54YzVjxgz1/vvvh2hK19UhpNl1IpUbEgQEgSYj8J///EeNHj26hbAWWmghNXHiRMXKMEQZNWqU+tSnPqUg4j322EMddthh6qSTTkqMi6ZNm6YOP/zwxKVl8ODBLeQNefKCVPn9P//5zxDN6ao6hDS7SpxyM4JAdyLAquf1119Xjz32WL8fyK+99lq16qqrtpDmF7/4RXXzzTcHE94zzzyjZs6cqd544w0FSbsKhkgPPPCAWnfdda0rz0033VQ9/PDDrr839nv6y1tvvaWeffZZ9cQTT6hHHnkkWL8R0mys2KVhgkDvIvCvf/1LPfXUU+r2229P9uN+/etfqwMOOEB94QtfUMcff3y/BubYY49VH/vYx1pIc/XVV1e4nnSqoM7db7/91IILLtjSLlad66+/vuJ8kwor8jfffDOxMp41a5b685//rG666aakr+Cqg2r6xz/+sVp7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').then(logo => {
          escposCommands=doc
            .newLine()
            .align(TextAlignment.Center)
            .style([FontStyle.Bold])
            .text("Proudly powered by")
            .style([])
            .feed(1)
            .image(logo,BitmapDensity.D24)
            .text("Order thai takes orders on behalf of").newLine().text("resturant. If there is  a problem please").newLine().text(" contact restaurant directly.")
            .feed(5)
            .cut()
            .generateUInt8Array()
            
          });

          var socket = new Socket();
          socket.open(
            printaddr,
            port,
            () => {
              socket.write(escposCommands, () => {
                socket.shutdownWrite();
              });
            },
            (err) => {
              console.error(err);
              this.error=err;
            }
          );

        
    });
  }


  printStripRecipt(){
    var current=new Date(this.orderDetail.orderTime);
    var order_time=moment.utc(current).utcOffset('+10:00').format('MMM D - hh:mm A');

    var current1=new Date(this.orderDetail.orderDeliveryTime);
    var order_deliverytime=moment.utc(current1).utcOffset('+10:00').format('MMM D - hh:mm A');

    const doc = new Document();
    let escposCommands;
    ESCPOSImage.load('data:image/png;base64,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').then(logo => {
    escposCommands = doc
        .newLine()
        .newLine()
        .newLine()
        .setPrintWidth(600)
        .setColorMode(false)
        .style([FontStyle.Bold])
        .size(0,0)
        .font(FontFamily.A)
        .align(TextAlignment.LeftJustification)
        .newLine()
        .text(" ___________________________________________")
        .newLine()
        .text("| "+this.orderMethod+"                                    |\n")
        .text("|___________________________________________|")
        .newLine()
        .newLine()
        .text(" __________________________________________")
        .newLine()
        .text("| Paid Online                      VISA    | \n")
        .text("|__________________________________________|")
        .newLine()
        .text("|                                          | ")
        .style([FontStyle.Bold])
        .newLine()
        .text("| EX 02/2023              ENDS IN 7890     | ")
        .newLine()
        .text("|                                          | ")
        .newLine()
        .text("|__________________________________________| ")
        .newLine()
        .newLine()
        .text("___________________________________________")
        .newLine()
        .text("| As soon as possible            ~25mins   |\n")
        .text("|__________________________________________|")
        .newLine()
        .newLine()



            .size(0,0)
            .align(TextAlignment.LeftJustification)
            .text("Order Details:")
            .newLine()
            .newLine()
            .style([])
            .size(0,0)
            .align(TextAlignment.LeftJustification)
            .text("Order ID: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(this.orderDetail.orderId)
            .newLine()
            .marginLeft(0)
            .align(TextAlignment.LeftJustification)
            .text("Order Accepted At: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(order_time)
            .newLine()
            .marginLeft(0)
            .align(TextAlignment.LeftJustification)
            .text("Estimated Fulfilment At ")
            .control(FeedControlSequence.HorizontalTab)
            .text(order_deliverytime?order_deliverytime:"")
            .newLine()
            .newLine()

            
            .size(0,0)
            .style([FontStyle.Bold])
            .align(TextAlignment.LeftJustification)
            .text("Client Info:")
            .style([])
            .newLine()
            .newLine()
            .style([])
            .size(0,0)
            .align(TextAlignment.LeftJustification)
            .text("First Name: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(this.orderDetail.firstName)
            .newLine()
            .marginLeft(0)
            .align(TextAlignment.LeftJustification)
            .text("Last Name: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(this.orderDetail.lastName)
            .newLine()
            .marginLeft(0)
            .align(TextAlignment.LeftJustification)
            .text("Email:")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(this.orderDetail.email)
            .newLine()
            .size(0,0)
            .align(TextAlignment.LeftJustification)
            .text("Phone: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(this.orderDetail.telephone)

           if(this.orderDetail.deliveryNote){

            escposCommands=doc
              .newLine()
              .style([FontStyle.Bold])
              .size(2,1)
              .text("! ")
              .style([])
              .size(0,0.5)
              .marginBottom(20)
              .control(FeedControlSequence.CarriageReturn)
              .text(this.orderDetail.deliveryNote)
           }
              
           escposCommands=doc
                .newLine()
                .newLine()
                .size(0,0)
                .style([FontStyle.Bold])
                .text("Items: ")
                .newLine()
                .newLine()
           

            if (this.orderDetail.order && this.orderDetail.order.length > 0) {
              this.orderDetail.order.map((item) => {
                var itemPrice=this.getPrice(item)
                escposCommands = doc
                  .style([FontStyle.Bold])
                  .text(item.quantity+"x")
                  .control(FeedControlSequence.HorizontalTab)
                  .text(item.productName)
                  .control(FeedControlSequence.HorizontalTab)
                  .control(FeedControlSequence.HorizontalTab)
                  .control(FeedControlSequence.HorizontalTab)


                  .text(itemPrice)
                  if(item.orderProductChoices.length > 0){
                    item.orderProductChoices.map((choice) => {
                      escposCommands = doc
                          .newLine()
                          .style([FontStyle.Italic])
                          .text("")
                          .control(FeedControlSequence.HorizontalTab)
                          .style([FontStyle.Italic])
                          .text(choice.groupName+": "+choice.groupOptionName)
                          .control(FeedControlSequence.HorizontalTab)
                          .text("+"+choice.optionPrice)

                    }
                    );
                  }
                        if(item.instructions){
                          escposCommands=doc
                            .newLine()
                            .style([FontStyle.Bold])
                            .size(2,0)
                            .text("!")
                            .size(0,0)
                            .style([FontStyle.Italic])
                            
                            .text(item.instructions)
                           
                            .style([])
                            .newLine()
                            .newLine()
                        }
                 

              });
            }
            var subTotal=this.getSubTotal();
            var tax=this.getTax();
            var total=this.getTotal();
            escposCommands=doc
               .newLine()
               .newLine()
               .text("_______________________________________________")
               .newLine()
      
              .style([])
              .size(0,0)
              .text("SubTotal                               "+subTotal)
              .newLine()
              .text("Tax GST included                        "+tax)
              .newLine()
              .style([FontStyle.Bold])
              .text("Total                                   "+total)
              .newLine()
              .style([])
              .size(0,0)
              .newLine()
              .newLine()

        
         ESCPOSImage.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAdsAAACWCAYAAACWyyIyAAAX3klEQVR4Ae2cgZHUOtNFCYEMHiEQAiGQAWQAGUAGkAFkABlABpABIRDC/nX5/rvv0k+S5fF61us9qpqSxuputY40uvbMwpMbCgQgAAEIQAACuxJ4smt0gkMAAhCAAAQgcIPYsgkgAAEIQAACOxNAbHcGTHgIQAACEIAAYssegAAEIAABCOxMALHdGTDhIQABCEAAAogtewACEIAABCCwMwHEdmfAhIcABCAAAQggtuwBCEAAAhCAwM4EENudARMeAhCAAAQggNiyByAAAQhAAAI7E0BsdwZMeAhAAAIQgABiyx6AAAQgAAEI7EwAsd0ZMOEhAAEIQAACiC17AAIQgAAEILAzgauI7ZMnT254wYA9wB5gD7AHzrgHZnQaseVGgBsh9gB7gD3AHtiwBw4ptjNJYQMBCEAAAhA4MoF8Qp/J8+pPtjNJYQMBCEAAAhA4MgHE9sirQ24QgAAEIHAKAojtKZaRSUAAAhCAwJEJILZHXh1ygwAEIACBUxBAbE+xjEwCAhCAAASOTACxPfLqkBsEIAABCJyCAGJ7imVkEhCAAAQgcGQCiO2RV4fcIAABCEDgFAQQ21MsI5OAAAQgAIEjE0Bsj7w65AYBCEAAAqcggNieYhmZBAQgAAEIHJkAYnvk1SE3CEAAAhA4BQHE9hTLyCQgAAEIQODIBBDbI68OuUEAAhCAwCkIILanWEYmAQEIQAACRyaA2B55dcgNAhCAAAROQQCxPcUyMgkIQAACEDgyAcT2yKtDbhCAAAQgcAoCiO0plpFJQAACEIDAkQkgtkdeHXKDAAQgAIFTEEBsT7GMTAICEIAABI5MALE98uqQGwQgAAEInIIAYnuKZWQSEIAABCBwZAKI7ZFXh9wgAAEIQOAUBBDbUywjk4AABCAAgSMTQGyPvDrkBgEIQAACpyCA2J5iGZkEBCAAAQgcmQBie+TVITcIPCICv379uvn9+/cjmjFTfUwEENvHtNrMFQIHJoDYHnhxSG0zAcR2M0ICbCHw6dOnm+fPn9/kRnT7xYsXN3rd59OOxlc+z5492zLNq/u+fv365unTp02uuq7+b9++XTWvf/75508+vUFz3Xs2XIfAQyXg/a16psxZzUQa2KxNahCKrgMT6IlBrr/asnv37t29iO5DFNsfP340RbZy1XvZXqvMiu21bwKuNf+ZcfR079eMPTYPh0B+/mayRmxnKGEzJKDDRE+K3nxq//z589ZH7Y8fP97ocPYBbdtboys1HpLYvnz58papePWeXjWneqOjm5m9i9dy73Eecnzvc9WUcxFYu7ZX2QFrkzrXkpx7NvpK2F8b68D//Pnz4oRTGK79lfJDEtv83OiGZlT0ROu52W9kfxd9iO0yRa+Fasq5CKxd26vsgLVJnWtJzj2bLWv79evXP09urd9PHVdPcx8+fPjz8rWW/ZcvX/56CrSta98EWJBaMbRSb968+fOyX63lPyppL4HM985h5K8+/e5tPz3drika0zczva+UHVtxR9yW8l0SW4/TulFw3/v37/88sft9q565IdOTfMtX17Rml36VbZa92Oqv3yJ4j/V8fN3r6pvVet391Mck4PVSPVPmrGYiDWzWJjUIRddBCOgg18trqwPjkmL/Kgy+LrF123VLKN03qnUo+iBsxdChPvJ330iEbNOqR37JLg/fyiXtem3fxPSE2rmlqPtarZVzL++7ENu3b98uMhePnuDq+uy69Xj1rtebpcom32cM77Hsb7XtU/t8nfrYBHLdZjJFbGcoYfMfAjrI8zfF3mH4H8dywRtWB1QWX1etpwe9Wod+Ppnp4O6V+oTSEtscUyJfy/fv32+fGhVv9MTmWC2bGjffWyjlr9+5Ly1em5ZYOzfXdQytpf17NvK5C7FV/NGNWq5bzbMK9dKatVjUmPW91qC3t/VUbj6t/aRY7lfdK3Vf9ey4fiwCM2ubGfd3QFptbK9NauNwuF+BAGKL2CK2iO0VjprDDrFW1xDbwy7lsRPTQevDtndXPzMDb9gaw9dV64mk91SSX7mOxsunB8Ws4ym+rvsmohfLdratdrruV+tJq9rX9/m0pKf2S4ueyJRH67dK56e6921A/Qq19XTn9e/l6HFaT/fuUz0q+fRa7TKG1q1XtGZ6Qh7Z9HyXrium82jtUfctzVN89Vf7Lc5LOdB/PwRm19bZjXe6rTbWa5PaOBzuVyCQYquD7NLivVHFr3e9jmO72UPKApHjyddxJE5Lr9FXm46j+pJikZT/FrG1aLdiOMdWX+ZsO9Wtr7TNMn2ybf+R2NafD9Lfbcfxe9W5ZupfWjP1y653c5GxW22Npxj6nTtf+uM95yfmtbhPNeVcBNau7VV2wNqkzrUk55yNDsn8Q5DWgTozc++N+rtd73qNabt6vffeOafY1qc4x5yp6zjpU/tm3udvtpcKg8bxH5aNnrZafZljzqUlJHchtjNP/84jc7t0zWbGy3Fkr73iHEZ1i1HaZ1zaD5/A2rVFbB/+mt/LDCQKKQyXfkXnDVufsnx96cnHdrNPtv7aOcU2n5LyqWWmXeE7H9WXFueoGEuC2BpDLOXbExbnuHSDZDvVLSG5T7HNNVN+M2slmzU8cwzt79bTs2KaU4uR+1RTzkVg7dpeZQesTepcS3Lu2eRvVkuHt0nIzoLSE2nvmSWxHX2l6/FU6+D0mIqdYqt+3zgon15OGa/Xdt6qtxTn43izsWw/Gt82S+tlO9UtIblPsRWPzG/LmvXYan5L+883Nj1GmWNvHK4/TAJr13bbiTDJaG1Sk2ExOwABHdgWPNX65zkStlGxvfZF70nDe2bpsMvfOHuxlEsKrWJXsZWNx1St/9yiV+Tbm2PG6PnPXs9YvfEcK29g7Oe+Wrv/oYttXVOtWY+TnkDXFu097dVeTF3PHFo3JGatulcUR99CaLzetxE9X67fH4GZtc3s+jsgrTa21ya1cTjcr0xAIpcCqgNI13xIqa0/JJFI6TWzH2yzJLaaqmxkrxz0H1dUEcmv+hy3JbY5B9npqcVz0Dh6ryco9WmO2Wfkjq96a3n16tUtK+Wmg1hfZdai6zmu2qND27aVU41rO9UtIbnvJ1vvu1y3ui5aM/NprVedc773jZzWvOVb93KLUeZW1878vafMO3OgfVwCXi/VM2XOaibSwGZtUoNQdB2YQB4sueat9tIf/9hnRmyFJIXJvlnrYNTh5oO3JbaKo/Es3umfbR2OPijrcqRd7bv0vf7ZUsYdtXt55dj2X7K1neqWkNy32OacltZMc7ikJIPa1n6X4Pt6i5EYa69VYbaP+uvn5pI88bk+Aa+h6pkyZzUTaWCzNqlBKLoOTKAeGrnutY3Yzi8kYvu/f7s8IobYjujQtweBPNNm4iO2M5SwgQAEIAABCAQBxDZg0IQABCAAAQjsQQCx3YMqMSEAAQhAAAJBALENGDQhAAEIQAACexBAbPegSkwIQAACEIBAEEBsAwZNCEAAAhCAwB4EENs9qBITAhCAAAQgEAQQ24BBEwIQgAAEILAHAcR2D6rEhAAEIAABCAQBxDZg0IQABCAAAQjsQQCx3YMqMSEAAQhAAAJBALENGDQhAAEIQAACexBAbPegSkwIQAACEIBAEEBsAwZNCEAAAhCAwB4EENs9qBITAhCAAAQgEAQQ24BBEwIQgAAEILAHAcR2D6rEhAAEIAABCAQBxDZg0IQABCAAAQjsQQCx3YMqMa9C4MWLFzcvX768+f3791XGYxAIQAAClxJAbC8l90j8JGTv37+/fR1l2h8+fLjx5n3+/PlR0iIPCEAAAk0CPq9Uz5Q5q5lIA5u1SQ1C0bWRwK9fv25FbXaTbBxy0V03ALlHjpLXYuIYQAACj5ZAnlkzEBDbGUonsjmi2Aqvnma9eZ8+fXoi4kwFAhA4IwGfV7MPB4jtCXbBp0+fboVKC//69evurI4qtt2EoyNzf/bsWfTQhAAEIHBdAojtdXnf62gSH730G2wuvMTWfa6dqN6nra+7/vbt243EW68fP36s+mMlfR1sf+Wk32EVZ6bYV/4a10XXPQf1OXeJra+7tk+rVpwvX778yWlNXspF4+qlGC4aU/H0ymJb1TkPvRcLcRkV5WZ2a/lnXOXnOLNrkP7KV/5+5VzS7tJ2rofG8FyT8VLsXE+vqeY9Koqfa6S2fZyTudW1rXFzrRyj2lzyXrGSv8ZRLktjiGGd24hn2l6S52P38VmkeqbMWc1EGtisTWoQiq4goA+fXjockjFiG5D+v+mDVAeXD+b/Wv33Sh5geXCJuw7AeiDnAZYCpeuI7b98cz0Q23+5qKW9pf0iLin8uj4quVe9D3PPVl/bqKasJ5Bn7ow3YjtD6aA2udhLbU9BH9i0zev6rTT71Na10Qc2/auv3799+3YxhoTI9vk1uNq+PqrTxzm5ztgZQ78TL81N/xzJPj7s8vflOq5tVatP8escnJdriX/GzBjiX8ewX6tWLD31Zwy1FUevd+/etdxur2ks2VV/vVffXRzMvfVwjuZ8m1Sj0eOlPEdzVP51bhK0uka2qfNVbnq17LVXPn/+3Mh27lIvrnPx3Hp7NveqfWr+mYltVFPWE1jL7yqU1ya1ftqP0yO5LrVNSB/otPXTWe+Ala0O796HVh/8N2/e/BUz47ut+DqIeodRHsA6yFxah5pjZp0+9lVd55s+amtu9ek0/fMA05NDvpd/HTfjq68lfI7vp+z06bXtM6o1j55/Xu+tgfJJu157JGaj/NTX4tEaR7m0iuY4E6Pn3xPbVg6+Zl6ze7GV9+jajMg6F9W60WiVujdl2/vcyj9jtuJxbUxgLT/EdszzQfSmUGkDVAHISYzEJ0VHd/stAc5Ybn/9+vXPB/fnz5++dFtLjHNTqq0n3VpyDr38M3cduKNSx/SBmT76DzTSrvXE0DrAdE3xdJAppywZL9tiKz7J6Pv37zd6yU5zzj7FfPXq1V/59bjkOG5r/Vw0Lz81uv/jx4/u/nOz4euqNU5l4Rhp12J6G7Q05J++GiPZaf1rjrJ3qf7qa+WY+0g2NceW2Mqu5qN1GYl67j+voeLo1RNDz6VV6zMhX8VNLrbVGLkX8ycK22S/c0FsTefuazNWPVPmrGYiDWzWJjUIRVeDQD1geoeyXFOwtC76cOfBUcP7EPAa1v6Z9/bNuh6UOYde/pn7KOcqoiksNd+8oWjFrAfYKJZi5xzVbh2KNYfRe3HKHFsHcY65NF6rP/1Huajvkv1QhXKJYb0Zq/7Kd1Q0x5yT9pZLT2zdX+uMo3XoFa1LrlPeuPZ8LrnufLQva6l7VbaIbaV0d++9FqpnypzVTKSBzdqkBqHoahBIoRLrnljJNQVLtrrzr3f/OYSfWr2G2Tfb/ueff/46/BSrikbOoZd/5t4SRufjXF37eqteEo88wEaHrWN7TNe+vqXO3ydbh6fHUn1JWeOfazA7Xu6hGYZ1DhLnzHHmyTHtdfPlskVs602AY7rOm7ylGwr7rK09r9b+z71qu9Z+8Zi2UU1ZT2Atv6tQXpvU+mk/bo8UKrHuiZUoXXJYLq2fPtD68KfdUrseAjmHXv6Ze+uw0fwyzlIOrf66k/IAm3layZi9HD2GGOiVPkvtyk2x0sex19Tpv7Y9M47W03FHN3a9WLkGitNiUH09nmv3t3grfq/YX7X236joq3vb59f4Ix/3rd23rb1VOSmXESvnqpqynsBaflehvDap9dN+3B71g9oTK1FKwZr9kI3Wr/UVX9r32vUQyDn08s/cW4eN5tc6THs5tK7XnZQHWM252up9xuzlKDt/PZxfPaZvr93KIW1bOS1dS/+17aXY6k+xveSJL9dA+a296cmn6db+uG+xzb0/y7+1tyonxWrtF69ZjuVr1PME1vJDbOfZHtayflh7YqUJpGBps8yU0aZCbP8mmKxaB6KtEVuTWK6riCC2//tbi0quctJeRGwrpbt7n5/1mahzp+1MpIHN2qQGoehqELhPsc217X3NNnMI5Bx6Nwt5ozASsvq02PqjoAbG5qXMfXRw2Tl5jHJMO7d7eS7lYH/Vl5St/ktj5m+2YqIbjTUl94ZyHXF13JxT7qcjPtlmrmqPim1bDHKf2G70TYJtlsYc5fOY+9byG6/sHZFcm9QdDftowtTDKP8gpEJIwZr9kI3Wb9TnsXUwpJ3aVbhyDnk4OobqzL112NhW/jneiId9enUeYDXnlk+OO8ox7dQe/dHPmj+QWvpNVE+FVewyl94NU2uurWu6YVD8OkbeAPX+Dazjab3SXzmlv/IdlSqo+SRc+xRLa9wra9gs/WareWj8yjjHWJqbbVt7q/6xn2x7e198HWtpzB6bx359Lb/xrr0jmmuTuqNhH1UYHch5KOvDqEPE1wxDH/S16zGy14c5+yV0Otx0qOhQ9fhpo7b6s8yIrexrHM3RgpjxNH+9qr3e9/rS323HbuVsm6xzPI3TK62D0WOYXcZyu3JT/Dzkbada41eRcn99im7lI1+zqnF0PUWj9muc+te7LRvZ9a6rL4tzz1q+fuV1t9NfbfFzn2utca/YRnXOt2Wf69D6A6mMpbZLnb/e6z8O0edIL8US7/TX+1ZJmzXtViyujQkk37Hl/3r/XfEZ6wtt1iZ14TCP2k1f1eXXdclcbZe7Flsd2vWwqGO3+qtozIptK5bH8xxVa556pVjarlenv9vpX3O2TdYZu3cgyl65aS6j+ThW2vRy0IGcdvbt1Zmz2z3b1vVLxLb+5w+tuHmt/k9V+kp0zRxb35AcUWxHn9vkobZFt7e36k139c/3jqVrlPUEkuWM91Uor01qJnFs2gRSHFrc71psnUX9Wspj6wOdd/y+XkVjVmw1nuZYD93e4SN73RC0/q2vclFu+ZWl5+M6edacbZO156d6lFP69ITSXwknv6UcxLHHR/k4Zo6f7Z6/5yUBq//Tlfy1r+q3GBk32xLdun7mpRwVa6nkujg316PfKY8itq2vd+v/EuX5qJa99rHnPbO3vJYZR376xkF73rHUT1lPILnOeF+F8tqkZhLHpk9Ah5U+aHrpcKlion6/+lH+7bGt6lHRIdwaV+NnjFactKn5tsaUjb5i03iqZ4rGtY/8ZsbJvGfHWOvjuOanHJNRsrHtUi2fXIsl+9qf/rOM7eP515j5Xraer+K3BDztW23tbc9RdWuvVz+N6/xc61qv2Eb1UsnYrZgSU+c5iuU9qvnUOa3Jx2M4XmV8SSzHpP77J60ZHojtDCVsIAABCEAAAkFg7UMkYhvwaEIAAhCAAARmCCC2M5SwgQAEIAABCGwggNhugIcrBCAAAQhAYIYAYjtDCRsIQAACEIDABgKI7QZ4uEIAAhCAAARmCCC2M5SwgQAEIAABCGwggNhugIcrBCAAAQhAYIYAYjtDCRsIQAACEIDABgKI7QZ4uEIAAhCAAARmCCC2M5SwgQAEIAABCGwggNhugIcrBCAAAQhAYIYAYjtDCRsIQAACEIDABgKI7QZ4uEIAAhCAAARmCCC2M5SwgQAEIAABCGwggNhugIcrBCAAAQhAYIYAYjtDCRsIQAACEIDABgKI7QZ4uEIAAhCAAARmCCC2M5SwgQAEIAABCGwggNhugIcrBCAAAQhAYIYAYjtDCRsIQAACEIDABgKI7QZ4uEIAAhCAAARmCCC2M5SwgQAEIAABCGwggNhugIcrBCAAAQhAYIYAYjtDCRsIQAACEIDABgKI7QZ4uEIAAhCAAARmCCC2M5SwgQAEIAABCGwggNhugIcrBCAAAQhAYIYAYjtDCRsIQAACEIDABgKI7QZ4uEIAAhCAAARmCCC2M5SwgQAEIAABCGwgcHixzQRpP7mBAQzYA+wB9sDD3gMzmv1kxmirDRvpYW8k1o/1Yw+wB9gD/T0wo5GI7ZM+QDYXbNgD7AH2AHtgaQ8gtggpX1OzB9gD7AH2wM57ALHdGfDS3Q793BGzB9gD7IHz74HDiO1MIthAAAIQgAAEzkrgKr/ZnhUe84IABCAAAQjMEEBsZyhhAwEIQAACENhAALHdAA9XCEAAAhCAwAwBxHaGEjYQgAAEIACBDQQQ2w3wcIUABCAAAQjMEEBsZyhhAwEIQAACENhAALHdAA9XCEAAAhCAwAwBxHaGEjYQgAAEIACBDQQQ2w3wcIUABCAAAQjMEEBsZyhhAwEIQAACENhA4P8ARQWPqv5GYT0AAAAASUVORK5CYII=').then(logo => {
           escposCommands = doc
           .align(TextAlignment.Center)
           .image(logo,BitmapDensity.D24)
           .feed(1)

        
        escposCommands=doc
          .newLine()
          .align(TextAlignment.Center)
          .style([FontStyle.Bold])
          .text("Thai Terrace")
          .newLine()
          .style([])
          .text('151 Baroona Road')
          .newLine()
          .text('Paddington QLD 4064')
          .newLine()
          .text('07 3300 0054')
          .feed(2)
        
  });
       

        
          
          ESCPOSImage.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAc0AAABTCAYAAAD9XlyaAAAgAElEQVR4Ae2dB/gcRfnHUcGCWKKC0oRIkBCa9CIISAABJTTxoamEEhJIgETFgpQkQKihhiIIERJAUAgoKFWq0kFIDL0EJIh0iRQf5/981v/8Mrc3szu7O7O3v7t3nueevbu9m539vrPznXnnLQsoKYKAICAICAKCgCDghcACXr+SHwkCgoAgIAjUgsB7772npk6dqkaOHKlOPvnkWq4pF/FHQEjTHyv5pSAgCAgCURB455131N13363GjBmjPv3pT6sPfOADavHFF1fjxo2Lcj2ptDwCQprlsZN/CgKCgCBQGQFWloceeqhadtll1Qc/+EG1wAILqNVWW0397ne/U/Pmzatcv1QQFgEhzbB4Sm2CgCAgCHgj8NJLL6ktt9wyWVlClqww11lnHTVnzhzvOuSH9SIgpFkv3nI1QUAQEAQSBP7+97+rrbfeuo8wIc0vfelL6p577hGEGoyAkGaDhSNNEwQEge5FYPjw4X3qWAgT1ewhhxwS9Ib/+9//qqefflpdd9116vzzz1ff/OY31corr6xWWGEFtcQSSyTHIUOGqO9973vq0ksvVffff79if1WKGwEhTTc2ckYQEAQEgSgIsJr86Ec/muxfarXsV77ylYTgQlzwueeeUxdccIHabLPN1Je//GU1YMAA9ZnPfEZ9/vOfT95//OMfVx/60If6rk8b+MxvNt54YzVjxgz1/vvvh2hK19UhpNl1IpUbEgQEgSYj8J///EeNHj26hbAWWmghNXHiRMXKMEQZNWqU+tSnPqUg4j322EMddthh6qSTTkqMi6ZNm6YOP/zwxKVl8ODBLeQNefKCVPn9P//5zxDN6ao6hDS7SpxyM4JAdyLAquf1119Xjz32WL8fyK+99lq16qqrtpDmF7/4RXXzzTcHE94zzzyjZs6cqd544w0FSbsKhkgPPPCAWnfdda0rz0033VQ9/PDDrr839nv6y1tvvaWeffZZ9cQTT6hHHnkkWL8R0mys2KVhgkDvIvCvf/1LPfXUU+r2229P9uN+/etfqwMOOEB94QtfUMcff3y/BubYY49VH/vYx1pIc/XVV1e4nnSqoM7db7/91IILLtjSLlad66+/vuJ8kwor8jfffDOxMp41a5b685//rG666aakr+Cqg2r6xz/+sVp7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').then(logo => {
          escposCommands=doc
            .newLine()
            .align(TextAlignment.Center)
            .style([FontStyle.Bold])
            .text("Proudly powered by")
            .style([])
            .feed(1)
            .image(logo,BitmapDensity.D24)
            .text("Order thai takes orders on behalf of resturant. If there is  a problem please contact restaurant directly.")
            .feed(5)
            .cut()
            .generateUInt8Array()
      
            
          });


        this.bluetooth.connect(this.printer).subscribe(() => {
          this.bluetooth.write(escposCommands)
            .then(() => {
              console.log('Print success');
            })
            .catch((err) => {
              console.error(err);
    
            });
        });
    });
  }

  printStripSocketRecipt(){
    var current=new Date(this.orderDetail.orderTime);
    var order_time=moment.utc(current).utcOffset('+10:00').format('MMM D - hh:mm A');

    var current1=new Date(this.orderDetail.orderDeliveryTime);
    var order_deliverytime=moment.utc(current1).utcOffset('+10:00').format('MMM D - hh:mm A');

    const doc = new Document();
    let escposCommands;
    ESCPOSImage.load('data:image/png;base64,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').then(logo => {
    escposCommands = doc
        .newLine()
        .newLine()
        .newLine()
        .setPrintWidth(600)
        .setColorMode(false)
        .style([FontStyle.Bold])
        .size(0,0)
        .font(FontFamily.A)
        .align(TextAlignment.LeftJustification)
        .newLine()
        .text(" ___________________________________________")
        .newLine()
        .text("| "+this.orderMethod+"                                    |\n")
        .text("|___________________________________________|")
        .newLine()
        .newLine()
        .text(" __________________________________________")
        .newLine()
        .text("| Paid Online                      VISA    | \n")
        .text("|__________________________________________|")
        .newLine()
        .text("|                                          | ")
        .style([FontStyle.Bold])
        .newLine()
        .text("| EX 02/2023              ENDS IN 7890     | ")
        .newLine()
        .text("|                                          | ")
        .newLine()
        .text("|__________________________________________| ")
        .newLine()
        .newLine()
        .text("___________________________________________")
        .newLine()
        .text("| As soon as possible            ~25mins   |\n")
        .text("|__________________________________________|")
        .newLine()
        .newLine()



            .size(0,0)
            .align(TextAlignment.LeftJustification)
            .text("Order Details:")
            .newLine()
            .newLine()
            .style([])
            .size(0,0)
            .align(TextAlignment.LeftJustification)
            .text("Order ID: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(this.orderDetail.orderId)
            .newLine()
            .marginLeft(0)
            .align(TextAlignment.LeftJustification)
            .text("Order Accepted At: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(order_time)
            .newLine()
            .marginLeft(0)
            .align(TextAlignment.LeftJustification)
            .text("Estimated Fulfilment At ")
            .control(FeedControlSequence.HorizontalTab)
            .text(order_deliverytime?order_deliverytime:"")
            .newLine()
            .newLine()

            
            .size(0,0)
            .style([FontStyle.Bold])
            .align(TextAlignment.LeftJustification)
            .text("Client Info:")
            .style([])
            .newLine()
            .newLine()
            .style([])
            .size(0,0)
            .align(TextAlignment.LeftJustification)
            .text("First Name: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(this.orderDetail.firstName)
            .newLine()
            .marginLeft(0)
            .align(TextAlignment.LeftJustification)
            .text("Last Name: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(this.orderDetail.lastName)
            .newLine()
            .marginLeft(0)
            .align(TextAlignment.LeftJustification)
            .text("Email:")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(this.orderDetail.email)
            .newLine()
            .size(0,0)
            .align(TextAlignment.LeftJustification)
            .text("Phone: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text(this.orderDetail.telephone)

           if(this.orderDetail.deliveryNote){

            escposCommands=doc
              .newLine()
              .style([FontStyle.Bold])
              .size(2,1)
              .text("! ")
              .style([])
              .size(0,0.5)
              .marginBottom(20)
              .control(FeedControlSequence.CarriageReturn)
              .text(this.orderDetail.deliveryNote)
           }
              
           escposCommands=doc
                .newLine()
                .newLine()
                .size(0,0)
                .style([FontStyle.Bold])
                .text("Items: ")
                .newLine()
                .newLine()
           

            if (this.orderDetail.order && this.orderDetail.order.length > 0) {
              this.orderDetail.order.map((item) => {
                var itemPrice=this.getPrice(item)
                escposCommands = doc
                  .style([FontStyle.Bold])
                  .text(item.quantity+"x")
                  .control(FeedControlSequence.HorizontalTab)
                  .text(item.productName)
                  .control(FeedControlSequence.HorizontalTab)
                  .control(FeedControlSequence.HorizontalTab)
                  .control(FeedControlSequence.HorizontalTab)


                  .text(itemPrice)
                  if(item.orderProductChoices.length > 0){
                    item.orderProductChoices.map((choice) => {
                      escposCommands = doc
                          .newLine()
                          .style([FontStyle.Italic])
                          .text("")
                          .control(FeedControlSequence.HorizontalTab)
                          .style([FontStyle.Italic])
                          .text(choice.groupName+": "+choice.groupOptionName)
                          .control(FeedControlSequence.HorizontalTab)
                          .text("+"+choice.optionPrice)

                    }
                    );
                  }
                        if(item.instructions){
                          escposCommands=doc
                            .newLine()
                            .style([FontStyle.Bold])
                            .size(2,0)
                            .text("!")
                            .size(0,0)
                            .style([FontStyle.Italic])
                            
                            .text(item.instructions)
                           
                            .style([])
                            .newLine()
                            .newLine()
                        }
                 

              });
            }
            var subTotal=this.getSubTotal();
            var tax=this.getTax();
            var total=this.getTotal();
            escposCommands=doc
               .newLine()
               .newLine()
               .text("_______________________________________________")
               .newLine()
      
              .style([])
              .size(0,0)
              .text("SubTotal                               "+subTotal)
              .newLine()
              .text("Tax GST included                        "+tax)
              .newLine()
              .style([FontStyle.Bold])
              .text("Total                                   "+total)
              .newLine()
              .style([])
              .size(0,0)
              .newLine()
              .newLine()

        
         ESCPOSImage.load('data:image/png;base64,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').then(logo => {
           escposCommands = doc
           .align(TextAlignment.Center)
           .image(logo,BitmapDensity.D24)
           .feed(1)

        
        escposCommands=doc
          .newLine()
          .align(TextAlignment.Center)
          .style([FontStyle.Bold])
          .text("Thai Terrace")
          .newLine()
          .style([])
          .text('151 Baroona Road')
          .newLine()
          .text('Paddington QLD 4064')
          .newLine()
          .text('07 3300 0054')
          .feed(2)
        
  });
       

        
          
          ESCPOSImage.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAc0AAABTCAYAAAD9XlyaAAAgAElEQVR4Ae2dB/gcRfnHUcGCWKKC0oRIkBCa9CIISAABJTTxoamEEhJIgETFgpQkQKihhiIIERJAUAgoKFWq0kFIDL0EJIh0iRQf5/981v/8Mrc3szu7O7O3v7t3nueevbu9m539vrPznXnnLQsoKYKAICAICAKCgCDghcACXr+SHwkCgoAgIAjUgsB7772npk6dqkaOHKlOPvnkWq4pF/FHQEjTHyv5pSAgCAgCURB455131N13363GjBmjPv3pT6sPfOADavHFF1fjxo2Lcj2ptDwCQprlsZN/CgKCgCBQGQFWloceeqhadtll1Qc/+EG1wAILqNVWW0397ne/U/Pmzatcv1QQFgEhzbB4Sm2CgCAgCHgj8NJLL6ktt9wyWVlClqww11lnHTVnzhzvOuSH9SIgpFkv3nI1QUAQEAQSBP7+97+rrbfeuo8wIc0vfelL6p577hGEGoyAkGaDhSNNEwQEge5FYPjw4X3qWAgT1ewhhxwS9Ib/+9//qqefflpdd9116vzzz1ff/OY31corr6xWWGEFtcQSSyTHIUOGqO9973vq0ksvVffff79if1WKGwEhTTc2ckYQEAQEgSgIsJr86Ec/muxfarXsV77ylYTgQlzwueeeUxdccIHabLPN1Je//GU1YMAA9ZnPfEZ9/vOfT95//OMfVx/60If6rk8b+MxvNt54YzVjxgz1/vvvh2hK19UhpNl1IpUbEgQEgSYj8J///EeNHj26hbAWWmghNXHiRMXKMEQZNWqU+tSnPqUg4j322EMddthh6qSTTkqMi6ZNm6YOP/zwxKVl8ODBLeQNefKCVPn9P//5zxDN6ao6hDS7SpxyM4JAdyLAquf1119Xjz32WL8fyK+99lq16qqrtpDmF7/4RXXzzTcHE94zzzyjZs6cqd544w0FSbsKhkgPPPCAWnfdda0rz0033VQ9/PDDrr839nv6y1tvvaWeffZZ9cQTT6hHHnkkWL8R0mys2KVhgkDvIvCvf/1LPfXUU+r2229P9uN+/etfqwMOOEB94QtfUMcff3y/BubYY49VH/vYx1pIc/XVV1e4nnSqoM7db7/91IILLtjSLlad66+/vuJ8kwor8jfffDOxMp41a5b685//rG666aakr+Cqg2r6xz/+sVp7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').then(logo => {
          escposCommands=doc
            .newLine()
            .align(TextAlignment.Center)
            .style([FontStyle.Bold])
            .text("Proudly powered by")
            .style([])
            .feed(1)
            .image(logo,BitmapDensity.D24)
            .text("Order thai takes orders on behalf of resturant. If there is  a problem please contact restaurant directly.")
            .feed(5)
            .cut()
            .generateUInt8Array()
            
          });


          var socket = new Socket();
          socket.open(
            this.socket,
            this.PORT,
            () => {
              socket.write(escposCommands, () => {
                socket.shutdownWrite();
              });
            },
            (err) => {
              console.error(err);
              this.error=err;
            }
          );
    });
  }
  copyToClipboard() {
    Clipboard.write({
      string: this.getBill()
    })
  }
  // async printReceipt() {
  //   const BILL = this.getBill();
  //   // var node = document.getElementById('sapan');
  //   // domtoimage.toPng(node).then(async (dataUrl) => (await Pos.printBT({ value: dataUrl })));
  //   // const res = (await Pos.printBT({ value: 'This print from ionic \n this is new line' }));
  //   try {
  //     const res = (await Pos.printBT({ value: BILL }));
  //     this.utils.presentToast('Bill printing...');
  //   } catch {
  //     this.utils.presentToast('Please connect the printer');
  //     this.navCtrl.navigateRoot('thermal-printer');
  //   }
  // }
  printKitchenRecipt(printaddr:any){
    var current=new Date(this.orderDetail.orderTime);
    var order_time=moment.utc(current).utcOffset('+10:00').format('MMM D - hh:mm A');

    var current1=new Date(this.orderDetail.orderDeliveryTime);
    var order_deliverytime=moment.utc(current1).utcOffset('+10:00').format('MMM D - hh:mm A');
    var difference = moment.utc(current1,"HH:mm:ss").utcOffset('+10:00').diff(moment.utc(current,"HH:mm:ss").utcOffset('+10:00'), 'minutes')

    const doc = new Document();
    let escposCommands;

    

    ESCPOSImage.load('data:image/png;base64,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').then(logo => {
    escposCommands = doc
        .newLine()
        .newLine()
        .newLine()
        .setColorMode(true)
        .raw([27,99,48,2])
        .setPrintWidth(550)
        .size(0,0)
        .font(FontFamily.A)
    
        
        var headertxt1= " As soon as possible".length;
        var headertxt2 =("~"+difference+"min").length;
        var headertotal=headertxt1 + headertxt2;
        escposCommands = doc
        .align(TextAlignment.LeftJustification)
        .text("     ")
        .reverseColors(true)
        .raw([27,50])
        .style([FontStyle.Bold])
        .text(" As soon as possible")
        for(var i=0;i<(32-headertotal);i++){
          escposCommands=doc
           .text(" ")
          }
        escposCommands=doc
        .text("~"+difference+" min")
        .reverseColors(false)
        .setColorMode(false)
        .newLine()
        .newLine()
        .newLine()
            
            .size(1,0)
            .style([FontStyle.Bold])
            .text("Order Details:")
            .newLine()
            .newLine()
            .style([])
            .size(0,0)
          
            var orderIDLength="Order ID: ".length;
            var orderID=this.orderDetail.orderId.length;
            var total = orderIDLength + orderID;

            escposCommands=doc
            .align(TextAlignment.LeftJustification)
            .text("Order ID: ")
            for(var i=0;i<(42-total);i++){
            escposCommands=doc
             .text(" ")
            }
            escposCommands=doc
            .text(this.orderDetail.orderId)
            .newLine()

            orderIDLength = "Order Accepted At: ".length;
            orderID = order_time.length;
            total = orderIDLength + orderID

            escposCommands=doc
            .text("Order Accepted At: ")
            

            for(var i=0;i<(42-total);i++){
              escposCommands=doc
               .text(" ")
            }

           
           
            escposCommands=doc
            .text(order_time)
            .newLine()
            
            orderIDLength = "Estimated Fulfilment At: ".length;
            orderID = order_deliverytime?order_deliverytime.length:0
            total = orderIDLength + orderID;


            escposCommands=doc
            .text("Estimated Fulfilment At: ")

            for(var i=0;i<(42-total);i++){
              escposCommands=doc
               .text(" ")
            }

            escposCommands=doc
            .text(order_deliverytime?order_deliverytime:"")
            .newLine()

             
            

           if(this.orderDetail.deliveryNote){

            escposCommands=doc
              .newLine()
              .style([FontStyle.Bold])
              .size(2,1)
              .text("! ")
              .style([])
              .size(0,0.5)
              .marginBottom(20)
              .control(FeedControlSequence.CarriageReturn)
              .text(this.orderDetail.deliveryNote)
           }
              
           escposCommands=doc
                .newLine()
                .size(1,0)
                .style([FontStyle.Bold])
                .text("Items: ")
                .newLine()
                .newLine()
                .style([])
                .size(0,0)
           

            if (this.orderDetail.order && this.orderDetail.order.length > 0) {
              this.orderDetail.order.map((item) => {
                var itemPrice=this.getPrice(item)
                var qtyLength=(item.quantity+"x").length;
                var tabLength=4;
                var itemLength=item.productName.length;
                var pricelength=itemPrice.length;
                var totalItemLength=qtyLength+tabLength+itemLength+pricelength;
                var lowerboxspace=totalItemLength-pricelength;
                
                for(var i=0;i<(42);i++){
                  escposCommands=doc
                   .text(" ")
                }
               /* escposCommands=doc 
                  .text(itemPrice)*/

                      escposCommands=doc
                          .raw([218])
                          .raw([196])
                          .raw([191])
                          .newLine()
                         

                escposCommands = doc
                  .style([FontStyle.Bold])
                  .text(item.quantity+"x")
                  .control(FeedControlSequence.HorizontalTab)
                  .text(item.productName)
                  .align(TextAlignment.RightJustification)
                
                var tCover = (42-totalItemLength)+totalItemLength;
                var make=0;
                if(tCover < 42){
                  make=42-tCover
                }
                
                escposCommands=doc
                for(var i=0;i<(40-lowerboxspace);i++){
                  escposCommands=doc
                   .text(" ")
                }
               
               /* escposCommands=doc 
                  .text(itemPrice)*/
                 
                 escposCommands = doc
                 
                  .raw([192])
                  .raw([196])      
                  .raw([217])  

                      
                          
                  if(item.orderProductChoices.length > 0){
                    item.orderProductChoices.map((choice) => {
                      escposCommands = doc
                          .newLine()
                          .style([FontStyle.Italic])
                          .text("  ")
                          .control(FeedControlSequence.HorizontalTab)
                          .style([FontStyle.Italic])
                          .text(choice.groupName+": ")
                          .newLine()
                          .text("  ")
                          .control(FeedControlSequence.HorizontalTab)
                          .text(choice.groupOptionName)

                         
      
                        

                          


                    }
                    );
                  }
                        if(item.instructions){
                          escposCommands=doc
                            .newLine()
                            .text("  ")
                            .control(FeedControlSequence.HorizontalTab)
                            .style([FontStyle.Bold])
                            .size(1,0)
                            .text("!")
                            .size(0,0)
                            .style([FontStyle.Italic])
                            .text(item.instructions)
                           
                            .style([])
                            
                        }
                 escposCommands =doc
                  .newLine()
                  .newLine()

              });
            }
           /* 
            var subTotal=this.getSubTotal();
            var tax=this.getTax();
            var vtotal=this.getTotal();
            escposCommands=doc
               .newLine()
               .newLine()
               .text("_______________________________________________")
               .newLine()
      
              .style([])
              .size(0,0)
              .align(TextAlignment.LeftJustification)
              .text("SubTotal")
              .control(FeedControlSequence.CarriageReturn)
              .align(TextAlignment.RightJustification)
              .text(subTotal)
              .newLine()
              .align(TextAlignment.LeftJustification)
              .text("Tax GST included")
              .control(FeedControlSequence.CarriageReturn)
              .align(TextAlignment.RightJustification)
              .text(tax)
              .newLine()
              .style([FontStyle.Bold])
              .align(TextAlignment.LeftJustification)
              .text("Total")
              .control(FeedControlSequence.CarriageReturn)
              .align(TextAlignment.RightJustification)
              .text(vtotal)
              .newLine()
              .style([])
              .size(0,0)
              .newLine()
              .newLine()
              

          escposCommands = doc
            .raw([218])
            .raw([196])
            .raw([196])
            .raw([196])
            .raw([196])
            .raw([196])
            .raw([196])
            .raw([191])
            .newLine()
            .lineSpacing(0)
            .raw([179])
            .text("             ")
            .raw([179])
        */
         var allfood="All food checked & good to go?".length;
         var tablength=12;
         var totalspace=allfood+tablength;
         escposCommands=doc
         .newLine()
      
         for(var i=0;i<(totalspace);i++){
          escposCommands=doc
           .text(" ")
        }

        escposCommands=doc
          .raw([218])
          .raw([196])
          .raw([191])
          .newLine()
         escposCommands = doc
         
          .size(0,0)
          .style([FontStyle.Bold])
          .text("All food checked & good to go?")
          .size(0,0)
          .style([])
          .text("            ")
          .raw([192])
          .raw([196])      
          .raw([217])  
          
         
          .newLine()
         

         escposCommands=doc
          .newLine()
          .style([FontStyle.Bold])
          /*
         ESCPOSImage.load('data:image/png;base64,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').then(logo => {
           escposCommands = doc
           .align(TextAlignment.Center)
           .image(logo,BitmapDensity.D24)
           .feed(1)

        
        escposCommands=doc
          .newLine()
          .align(TextAlignment.Center)
          .style([FontStyle.Bold])
          .text("Thai Terrace")
          .newLine()
          .style([])
          .text('151 Baroona Road')
          .newLine()
          .text('Paddington QLD 4064')
          .newLine()
          .text('07 3300 0054')
          .feed(2)
        
  });
       
*/
        
          
          ESCPOSImage.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAc0AAABTCAYAAAD9XlyaAAAgAElEQVR4Ae2dB/gcRfnHUcGCWKKC0oRIkBCa9CIISAABJTTxoamEEhJIgETFgpQkQKihhiIIERJAUAgoKFWq0kFIDL0EJIh0iRQf5/981v/8Mrc3szu7O7O3v7t3nueevbu9m539vrPznXnnLQsoKYKAICAICAKCgCDghcACXr+SHwkCgoAgIAjUgsB7772npk6dqkaOHKlOPvnkWq4pF/FHQEjTHyv5pSAgCAgCURB455131N13363GjBmjPv3pT6sPfOADavHFF1fjxo2Lcj2ptDwCQprlsZN/CgKCgCBQGQFWloceeqhadtll1Qc/+EG1wAILqNVWW0397ne/U/Pmzatcv1QQFgEhzbB4Sm2CgCAgCHgj8NJLL6ktt9wyWVlClqww11lnHTVnzhzvOuSH9SIgpFkv3nI1QUAQEAQSBP7+97+rrbfeuo8wIc0vfelL6p577hGEGoyAkGaDhSNNEwQEge5FYPjw4X3qWAgT1ewhhxwS9Ib/+9//qqefflpdd9116vzzz1ff/OY31corr6xWWGEFtcQSSyTHIUOGqO9973vq0ksvVffff79if1WKGwEhTTc2ckYQEAQEgSgIsJr86Ec/muxfarXsV77ylYTgQlzwueeeUxdccIHabLPN1Je//GU1YMAA9ZnPfEZ9/vOfT95//OMfVx/60If6rk8b+MxvNt54YzVjxgz1/vvvh2hK19UhpNl1IpUbEgQEgSYj8J///EeNHj26hbAWWmghNXHiRMXKMEQZNWqU+tSnPqUg4j322EMddthh6qSTTkqMi6ZNm6YOP/zwxKVl8ODBLeQNefKCVPn9P//5zxDN6ao6hDS7SpxyM4JAdyLAquf1119Xjz32WL8fyK+99lq16qqrtpDmF7/4RXXzzTcHE94zzzyjZs6cqd544w0FSbsKhkgPPPCAWnfdda0rz0033VQ9/PDDrr839nv6y1tvvaWeffZZ9cQTT6hHHnkkWL8R0mys2KVhgkDvIvCvf/1LPfXUU+r2229P9uN+/etfqwMOOEB94QtfUMcff3y/BubYY49VH/vYx1pIc/XVV1e4nnSqoM7db7/91IILLtjSLlad66+/vuJ8kwor8jfffDOxMp41a5b685//rG666aakr+Cqg2r6xz/+sVp7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').then(logo => {
          escposCommands=doc
            .newLine()
            .align(TextAlignment.Center)
            .style([FontStyle.Bold])
            .text("Proudly powered by")
            .style([])
            .feed(1)
            .image(logo,BitmapDensity.D24)
            .text("Order thai takes orders on behalf of").newLine().text("resturant. If there is  a problem please").newLine().text(" contact restaurant directly.")
            .feed(5)
            .cut()
            .generateUInt8Array()
            
          });


        this.bluetooth.connect(printaddr).subscribe(() => {
          this.bluetooth.write(escposCommands)
            .then(() => {
              console.log('Print success');
            })
            .catch((err) => {
              console.error(err);
    
            });
        });
    });
  }
  getPaymentStatus(){
    
    if(this.orderMethod == 'table_reservation'){
      return "Pay in restaurant";
    }
    else if((this.orderDetail.orderStatus=="Accepted" || this.orderDetail.orderStatus=="Pending" || this.orderDetail.orderStatus=="Completed" ||  this.orderDetail.orderStatus=="Rejected" || this.orderDetail.orderStatus =="Missed" ) && this.orderMethod == "pickup" && this.orderDetail.paymentMethod == "Cash"){
      return "Pay at Counter";
    }
    else if((this.orderDetail.orderStatus=="Accepted" || this.orderDetail.orderStatus=="Pending" || this.orderDetail.orderStatus=="Completed" || this.orderDetail.orderStatus =="Missed") && this.orderDetail.paymentMethod == "Stripe" ){
      return "Paid Online";
    }
    else if((this.orderDetail.orderStatus=="Accepted" || this.orderDetail.orderStatus=="Pending" || this.orderDetail.orderStatus=="Completed" ||  this.orderDetail.orderStatus=="Rejected" || this.orderDetail.orderStatus =="Missed" ) && this.orderDetail.paymentMethod == "Callback"){
      return "Call Customer for Payment";
    }
    else if((this.orderDetail.orderStatus=="Missed" || this.orderDetail.orderStatus=="Accepted" || this.orderDetail.orderStatus=="Completed" || this.orderDetail.orderStatus=="Rejected")&& this.orderMethod=="delivery" && this.orderDetail.paymentMethod == "Cash"){
     return "Cash on delivery";
    }
    else if((this.orderDetail.orderStatus=="Rejected" || this.orderDetail.orderStatus =="Missed") && this.orderDetail.paymentMethod == "Stripe"){
      return "Online Payment Cancelled";
    }
  }
  printKitchenSocketRecipt(printaddr:any,port:any){
    var current=new Date(this.orderDetail.orderTime);
    var order_time=moment.utc(current).utcOffset('+10:00').format('MMM D - hh:mm A');

    var current1=new Date(this.orderDetail.orderDeliveryTime);
    var order_deliverytime=moment.utc(current1).utcOffset('+10:00').format('MMM D - hh:mm A');
    var difference = moment.utc(current1,"HH:mm:ss").utcOffset('+10:00').diff(moment.utc(current,"HH:mm:ss").utcOffset('+10:00'), 'minutes')

    const doc = new Document();
    let escposCommands;

    

    ESCPOSImage.load('data:image/png;base64,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').then(logo => {
    escposCommands = doc
        .newLine()
        .newLine()
        .newLine()
        .setColorMode(true)
        .raw([27,99,48,2])
        .setPrintWidth(550)
        .size(0,0)
        .font(FontFamily.A)
    
        
        var headertxt1= " As soon as possible".length;
        var headertxt2 =("~"+difference+"min").length;
        var headertotal=headertxt1 + headertxt2;
        escposCommands = doc
        .align(TextAlignment.LeftJustification)
        .text("     ")
        .reverseColors(true)
        .raw([27,50])
        .style([FontStyle.Bold])
        .text(" As soon as possible")
        for(var i=0;i<(32-headertotal);i++){
          escposCommands=doc
           .text(" ")
          }
        escposCommands=doc
        .text("~"+difference+" min")
        .reverseColors(false)
        .setColorMode(false)
        .newLine()
        .newLine()
        .newLine()
            
            .size(1,0)
            .style([FontStyle.Bold])
            .text("Order Details:")
            .newLine()
            .newLine()
            .style([])
            .size(0,0)
          
            var orderIDLength="Order ID: ".length;
            var orderID=this.orderDetail.orderId.length;
            var total = orderIDLength + orderID;

            escposCommands=doc
            .align(TextAlignment.LeftJustification)
            .text("Order ID: ")
            for(var i=0;i<(42-total);i++){
            escposCommands=doc
             .text(" ")
            }
            escposCommands=doc
            .text(this.orderDetail.orderId)
            .newLine()

            orderIDLength = "Order Accepted At: ".length;
            orderID = order_time.length;
            total = orderIDLength + orderID

            escposCommands=doc
            .text("Order Accepted At: ")
            

            for(var i=0;i<(42-total);i++){
              escposCommands=doc
               .text(" ")
            }

           
           
            escposCommands=doc
            .text(order_time)
            .newLine()
            
            orderIDLength = "Estimated Fulfilment At: ".length;
            orderID = order_deliverytime?order_deliverytime.length:0
            total = orderIDLength + orderID;


            escposCommands=doc
            .text("Estimated Fulfilment At: ")

            for(var i=0;i<(42-total);i++){
              escposCommands=doc
               .text(" ")
            }

            escposCommands=doc
            .text(order_deliverytime?order_deliverytime:"")
            .newLine()

             
            

           if(this.orderDetail.deliveryNote){

            escposCommands=doc
              .newLine()
              .style([FontStyle.Bold])
              .size(2,1)
              .text("! ")
              .style([])
              .size(0,0.5)
              .marginBottom(20)
              .control(FeedControlSequence.CarriageReturn)
              .text(this.orderDetail.deliveryNote)
           }
              
           escposCommands=doc
                .newLine()
                .size(1,0)
                .style([FontStyle.Bold])
                .text("Items: ")
                .newLine()
                .newLine()
                .style([])
                .size(0,0)
           

            if (this.orderDetail.order && this.orderDetail.order.length > 0) {
              this.orderDetail.order.map((item) => {
                var itemPrice=this.getPrice(item)
                var qtyLength=(item.quantity+"x").length;
                var tabLength=4;
                var itemLength=item.productName.length;
                var pricelength=itemPrice.length;
                var totalItemLength=qtyLength+tabLength+itemLength+pricelength;
                var lowerboxspace=totalItemLength-pricelength;
                
                for(var i=0;i<(42);i++){
                  escposCommands=doc
                   .text(" ")
                }
               /* escposCommands=doc 
                  .text(itemPrice)*/

                      escposCommands=doc
                          .raw([218])
                          .raw([196])
                          .raw([191])
                          .newLine()
                         

                escposCommands = doc
                  .style([FontStyle.Bold])
                  .text(item.quantity+"x")
                  .control(FeedControlSequence.HorizontalTab)
                  .text(item.productName)
                  .align(TextAlignment.RightJustification)
                
                var tCover = (42-totalItemLength)+totalItemLength;
                var make=0;
                if(tCover < 42){
                  make=42-tCover
                }
                
                escposCommands=doc
                for(var i=0;i<(40-lowerboxspace);i++){
                  escposCommands=doc
                   .text(" ")
                }
               
               /* escposCommands=doc 
                  .text(itemPrice)*/
                 
                 escposCommands = doc
                 
                  .raw([192])
                  .raw([196])      
                  .raw([217])  

                      
                          
                  if(item.orderProductChoices.length > 0){
                    item.orderProductChoices.map((choice) => {
                      escposCommands = doc
                          .newLine()
                          .style([FontStyle.Italic])
                          .text("  ")
                          .control(FeedControlSequence.HorizontalTab)
                          .style([FontStyle.Italic])
                          .text(choice.groupName+": ")
                          .newLine()
                          .text("  ")
                          .control(FeedControlSequence.HorizontalTab)
                          .text(choice.groupOptionName)

                         
      
                        

                          


                    }
                    );
                  }
                        if(item.instructions){
                          escposCommands=doc
                            .newLine()
                            .text("  ")
                            .control(FeedControlSequence.HorizontalTab)
                            .style([FontStyle.Bold])
                            .size(1,0)
                            .text("!")
                            .size(0,0)
                            .style([FontStyle.Italic])
                            .text(item.instructions)
                           
                            .style([])
                            
                        }
                 escposCommands =doc
                  .newLine()
                  .newLine()

              });
            }
           /* 
            var subTotal=this.getSubTotal();
            var tax=this.getTax();
            var vtotal=this.getTotal();
            escposCommands=doc
               .newLine()
               .newLine()
               .text("_______________________________________________")
               .newLine()
      
              .style([])
              .size(0,0)
              .align(TextAlignment.LeftJustification)
              .text("SubTotal")
              .control(FeedControlSequence.CarriageReturn)
              .align(TextAlignment.RightJustification)
              .text(subTotal)
              .newLine()
              .align(TextAlignment.LeftJustification)
              .text("Tax GST included")
              .control(FeedControlSequence.CarriageReturn)
              .align(TextAlignment.RightJustification)
              .text(tax)
              .newLine()
              .style([FontStyle.Bold])
              .align(TextAlignment.LeftJustification)
              .text("Total")
              .control(FeedControlSequence.CarriageReturn)
              .align(TextAlignment.RightJustification)
              .text(vtotal)
              .newLine()
              .style([])
              .size(0,0)
              .newLine()
              .newLine()
              

          escposCommands = doc
            .raw([218])
            .raw([196])
            .raw([196])
            .raw([196])
            .raw([196])
            .raw([196])
            .raw([196])
            .raw([191])
            .newLine()
            .lineSpacing(0)
            .raw([179])
            .text("             ")
            .raw([179])
        */
         var allfood="All food checked & good to go?".length;
         var tablength=12;
         var totalspace=allfood+tablength;
         escposCommands=doc
         .newLine()
      
         for(var i=0;i<(totalspace);i++){
          escposCommands=doc
           .text(" ")
        }

        escposCommands=doc
          .raw([218])
          .raw([196])
          .raw([191])
          .newLine()
         escposCommands = doc
         
          .size(0,0)
          .style([FontStyle.Bold])
          .text("All food checked & good to go?")
          .size(0,0)
          .style([])
          .text("            ")
          .raw([192])
          .raw([196])      
          .raw([217])  
          
         
          .newLine()
         

         escposCommands=doc
          .newLine()
          .style([FontStyle.Bold])
          /*
         ESCPOSImage.load('data:image/png;base64,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').then(logo => {
           escposCommands = doc
           .align(TextAlignment.Center)
           .image(logo,BitmapDensity.D24)
           .feed(1)

        
        escposCommands=doc
          .newLine()
          .align(TextAlignment.Center)
          .style([FontStyle.Bold])
          .text("Thai Terrace")
          .newLine()
          .style([])
          .text('151 Baroona Road')
          .newLine()
          .text('Paddington QLD 4064')
          .newLine()
          .text('07 3300 0054')
          .feed(2)
        
  });
       
*/
        
          
          ESCPOSImage.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAc0AAABTCAYAAAD9XlyaAAAgAElEQVR4Ae2dB/gcRfnHUcGCWKKC0oRIkBCa9CIISAABJTTxoamEEhJIgETFgpQkQKihhiIIERJAUAgoKFWq0kFIDL0EJIh0iRQf5/981v/8Mrc3szu7O7O3v7t3nueevbu9m539vrPznXnnLQsoKYKAICAICAKCgCDghcACXr+SHwkCgoAgIAjUgsB7772npk6dqkaOHKlOPvnkWq4pF/FHQEjTHyv5pSAgCAgCURB455131N13363GjBmjPv3pT6sPfOADavHFF1fjxo2Lcj2ptDwCQprlsZN/CgKCgCBQGQFWloceeqhadtll1Qc/+EG1wAILqNVWW0397ne/U/Pmzatcv1QQFgEhzbB4Sm2CgCAgCHgj8NJLL6ktt9wyWVlClqww11lnHTVnzhzvOuSH9SIgpFkv3nI1QUAQEAQSBP7+97+rrbfeuo8wIc0vfelL6p577hGEGoyAkGaDhSNNEwQEge5FYPjw4X3qWAgT1ewhhxwS9Ib/+9//qqefflpdd9116vzzz1ff/OY31corr6xWWGEFtcQSSyTHIUOGqO9973vq0ksvVffff79if1WKGwEhTTc2ckYQEAQEgSgIsJr86Ec/muxfarXsV77ylYTgQlzwueeeUxdccIHabLPN1Je//GU1YMAA9ZnPfEZ9/vOfT95//OMfVx/60If6rk8b+MxvNt54YzVjxgz1/vvvh2hK19UhpNl1IpUbEgQEgSYj8J///EeNHj26hbAWWmghNXHiRMXKMEQZNWqU+tSnPqUg4j322EMddthh6qSTTkqMi6ZNm6YOP/zwxKVl8ODBLeQNefKCVPn9P//5zxDN6ao6hDS7SpxyM4JAdyLAquf1119Xjz32WL8fyK+99lq16qqrtpDmF7/4RXXzzTcHE94zzzyjZs6cqd544w0FSbsKhkgPPPCAWnfdda0rz0033VQ9/PDDrr839nv6y1tvvaWeffZZ9cQTT6hHHnkkWL8R0mys2KVhgkDvIvCvf/1LPfXUU+r2229P9uN+/etfqwMOOEB94QtfUMcff3y/BubYY49VH/vYx1pIc/XVV1e4nnSqoM7db7/91IILLtjSLlad66+/vuJ8kwor8jfffDOxMp41a5b685//rG666aakr+Cqg2r6xz/+sVp7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').then(logo => {
          escposCommands=doc
            .newLine()
            .align(TextAlignment.Center)
            .style([FontStyle.Bold])
            .text("Proudly powered by")
            .style([])
            .feed(1)
            .image(logo,BitmapDensity.D24)
            .text("Order thai takes orders on behalf of").newLine().text("resturant. If there is  a problem please").newLine().text(" contact restaurant directly.")
            .feed(5)
            .cut()
            .generateUInt8Array()
            
          });


          var socket = new Socket();
          socket.open(
            printaddr,
            port,
            () => {
              socket.write(escposCommands, () => {
                socket.shutdownWrite();
              });
            },
            (err) => {
              console.error(err);
              this.error=err;
            }
          );
    });
  }
   sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async printReceipt() {
    await this.getRestaurant();
    this.getPrinters(localStorage.getItem('myRestaurantId'));
    
    this.getAllPrinters.forEach((printer) => {
        if(printer.printerType=="bluetooth"){
          if(printer.counterReciept == '1'){
             if(this.orderDetail.paymentMethod == 'Cash')
              {
                 this.printCashRecipt(printer.printerAddress);
              

              }else{
                this.printCashRecipt(printer.printerAddress);
              }
          }
          if(printer.kitchenReciept == '1'){
            this.printKitchenRecipt(printer.printerAddress);    
          }
        }else if(printer.printerType=="wifi"){
          if(printer.counterReciept == '1'){
            if(this.orderDetail.paymentMethod == 'Cash')
             {
              this.printCashSocketRecipt(printer.printerAddress,printer.port);

             

             }else{
              this.printCashSocketRecipt(printer.printerAddress,printer.port);

             }
         }
         if(printer.kitchenReciept == '1'){
          this.printKitchenSocketRecipt(printer.printerAddress,printer.port);
         }
        }
    });

    /*if(this.printer!=''){
      if(this.isCounter == 1){
        if(this.orderDetail.paymentMethod == 'Cash')
        {
          this.printCashRecipt();
         

        }else{
          this.printCashRecipt();
        }
      }else if(this.isKitchen == 1){
        
        this.printKitchenRecipt();      }
    }if(this.socket!=''){
      if(this.isWifiCounter == 1){
        if(this.orderDetail.paymentMethod == 'Cash')
        {
          this.printCashSocketRecipt();
        }else{
          this.printCashSocketRecipt();
        }
      }else if(this.isWifiKitchen == 1){
        this.printKitchenSocketRecipt();
      }
    }*/
    //  this.printCashRecipt();
    //  this.printStripRecipt();
    
    const BILL = this.getBill();
    await this.printHeader();
    await this.printClientAddress();
    await this.customHeaderForPrint("Client Details:");
    await this.printClientDetails();
    await this.customHeaderForPrint("Items:");
    await this.printItems();
    await this.blackLine();
    await this.printTotal();
    await this.blackLine();
    await this.restaurantDetails();
    this.pageCut();
  }

  async customHeaderForPrint(str) {
    let c = document.createElement('canvas');
    c.setAttribute("height", "80")
    c.setAttribute("width", "575")
    let ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#000";
    ctx.font = "bold 28px Open Sans";
    ctx.fillText(str, 0, 55);
    await Pos.printBT({ value: c.toDataURL() })
  }

  async printClientAddress() {
    let c = document.createElement('canvas');
    c.setAttribute("height", "160")
    c.setAttribute("width", "575")
    let ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, c.width, 60);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#FFF";
    ctx.font = "28px Open Sans";
    ctx.fillText("Delivery", 10, 35);
    ctx.fillStyle = "#000";
    ctx.font = "22px Open Sans";
    ctx.fillText(((this.orderDetail.address.length > 50) ? this.orderDetail.address.substr(0, 50) : this.orderDetail.address), 10, 90);
    ctx.fillText(((this.orderDetail.address.length > 51) ? this.orderDetail.address.substr(51, this.orderDetail.address.length - 1) : ''), 10, 130);
    // ctx.fillText(this.getAddress1(), (c.width / 2), (24 * 2));
    // ctx.fillText(this.getAddress2(), (c.width / 2), (24 * 3));
    // ctx.fillText(this.userDetail.phoneNumber, (c.width / 2), (24 * 4));
    // ctx.fillText(this.userDetail.email, (c.width / 2), (24 * 5));
    // ctx.fillText(this.orderDetail.orderTime, (c.width / 2), (24 * 7));
    // ctx.fillText("Thank You", (c.width / 2), (24 * 8));
    await Pos.printBT({ value: c.toDataURL() })
  }

  async restaurantDetails() {
    let c = document.createElement('canvas');
    c.setAttribute("height", "220")
    c.setAttribute("width", "575")
    let ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.font = " 22px Open Sans";
    ctx.fillText(this.userDetail.restaurantName, (c.width / 2), (24 * 1));
    ctx.fillText(this.getAddress1(), (c.width / 2), (24 * 2));
    ctx.fillText(this.getAddress2(), (c.width / 2), (24 * 3));
    ctx.fillText(this.userDetail.phoneNumber, (c.width / 2), (24 * 4));
    ctx.fillText(this.userDetail.email, (c.width / 2), (24 * 5));
    ctx.fillText(this.orderDetail.orderTime, (c.width / 2), (24 * 7));
    ctx.fillText("Thank You", (c.width / 2), (24 * 8));
    await Pos.printBT({ value: c.toDataURL() })
  }
  async printTotal() {
    let blackColor = "#000";
    let whiteColor = "#FFF";
    let leftMargin = 10;
    let topMargin = 35;
    let c;
    let ctx;
    await initCanvas("575", "40");
    getBackground();
    async function initCanvas(width, height) {
      c = await getCanvas(width, height);
      ctx = await getCanvasContext(c);
      getBackground();
    }
    // getHeader("", whiteColor, blackColor, "28px");
    getContent("Subtotal:", this.getSubTotal(), whiteColor, blackColor, "22px");
    if (this.isTaxAvailable()) {
      getContent(this.orderDetail.taxName + '(' + this.orderDetail.tax + '%)', this.getTax(), whiteColor, blackColor, "22px");
    }
    getContent("Total(AUD):", this.getTotal(), whiteColor, blackColor, "22px");
    getHeader("", whiteColor, blackColor, "28px");
    function getCanvas(width, height): any {
      let c: any = document.createElement("canvas");
      c.setAttribute("width", width);
      c.setAttribute("height", height);
      return c;
    }
    function getCanvasContext(canvas) {
      return canvas.getContext("2d");
    }
    function getBackground() {
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, c.width, c.height);
    }
    function getBackgroundWithRect() {
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(0, 0, c.width, c.height);
    }
    async function getHeader(text, backgrounColor, textColor, font) {
      ctx.beginPath();
      ctx.fillStyle = backgrounColor;
      ctx.fillRect(0, 0, c.width, 60);
      ctx.fillStyle = textColor;
      ctx.font = font + " Open Sans";
      ctx.fillText(text, leftMargin, topMargin);
      await printData();
    }
    async function printData() {
      let x = c.toDataURL();
      console.log(x);
      await Pos.printBT({ value: x });
      ctx.restore();
    }
    async function getContent(lefttext, righttext, backgroundColor, textColor, font, rightMargin = 0) {
      ctx.beginPath();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, c.width, 60);
      ctx.fillStyle = textColor;
      ctx.font = font + " Open Sans";
      ctx.fillText(lefttext, leftMargin, topMargin);
      ctx.fillText(righttext, (c.width - (righttext.length * 14) - rightMargin), topMargin);
      await printData();
    }
  }

  async printItems() {
    let blackColor = "#000";
    let whiteColor = "#FFF";
    let leftMargin = 10;
    let topMargin = 35;
    let c;
    let ctx;
    await initCanvas("575", "40");
    getBackground();
    async function initCanvas(width, height) {
      c = await getCanvas(width, height);
      ctx = await getCanvasContext(c);
      getBackground();
    }
    // getHeader("", whiteColor, blackColor, "28px");
    this.orderDetail.order.map((item) => {
      getContent(item.quantity + "x " + this.getFormattedName(item.productName), item.price, whiteColor, blackColor, "22px");
    });
    // getHeader("hello world", whiteColor, blackColor, "28px", true);
    if (this.orderDetail.deliveryNote && this.orderDetail.deliveryNote.length > 0) {
      getHeader("Note: " + this.orderDetail.deliveryNote, whiteColor, blackColor, "22px", true);
    }
    // getHeader("Items:", whiteColor, blackColor, "28px");
    // getContent("Pad See Ew", "11.60", whiteColor, blackColor, "22px");
    // getContent("Pasta", "25.10", whiteColor, blackColor, "22px");
    function getCanvas(width, height): any {
      let c: any = document.createElement("canvas");
      c.setAttribute("width", width);
      c.setAttribute("height", height);
      return c;
    }
    function getCanvasContext(canvas) {
      return canvas.getContext("2d");
    }
    function getBackground() {
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, c.width, c.height);
    }
    function getBackgroundWithRect() {
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(0, 0, c.width, c.height);
    }
    async function getHeader(text, backgrounColor, textColor, font, withIcon = false) {
      ctx.beginPath();
      ctx.fillStyle = backgrounColor;
      ctx.fillRect(0, 0, c.width, 60);
      ctx.fillStyle = textColor;
      ctx.font = font + " Open Sans";
      if (withIcon) {
        const img = document.getElementById('myicon');
        if (img) {
          ctx.drawImage(img, leftMargin, topMargin);
        }
      }
      ctx.fillText(text, leftMargin + 10, topMargin);
      await printData();
    }
    async function printData() {
      let x = c.toDataURL();
      console.log(x);
      await Pos.printBT({ value: x });
      ctx.restore();
    }
    async function getContent(lefttext, righttext, backgroundColor, textColor, font, rightMargin = 0) {
      ctx.beginPath();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, c.width, 60);
      ctx.fillStyle = textColor;
      ctx.font = font + " Open Sans";
      ctx.fillText(lefttext, leftMargin, topMargin);
      ctx.fillText(righttext, (c.width - (righttext.length * 14) - rightMargin), topMargin);
      await printData();
    }
  }

  async printClientDetails() {

    let blackColor = "#000";
    let whiteColor = "#FFF";
    let leftMargin = 10;
    let topMargin = 35;
    let c;
    let ctx;
    await initCanvas("575", "40");
    getBackground();
    async function initCanvas(width, height) {
      c = await getCanvas(width, height);
      ctx = await getCanvasContext(c);
      getBackground();
    }
    // getHeader("", whiteColor, blackColor, "28px");
    getContent("First name:", this.orderDetail.firstName, whiteColor, blackColor, "22px");
    getContent("Last name:", this.orderDetail.lastName, whiteColor, blackColor, "22px");
    getContent("Email:", this.orderDetail.email, whiteColor, blackColor, "22px", -32);
    getContent("Phone:", "+61 " + this.orderDetail.mobile, whiteColor, blackColor, "22px", -32);
    // getHeader("Items:", whiteColor, blackColor, "28px");
    // getHeader("", whiteColor, blackColor, "28px");
    // getContent("Pad See Ew", "11.60", whiteColor, blackColor, "22px");
    // getContent("Pasta", "25.10", whiteColor, blackColor, "22px");
    function getCanvas(width, height): any {
      let c: any = document.createElement("canvas");
      c.setAttribute("width", width);
      c.setAttribute("height", height);
      return c;
    }
    function getCanvasContext(canvas) {
      return canvas.getContext("2d");
    }
    function getBackground() {
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, c.width, c.height);
    }
    function getBackgroundWithRect() {
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(0, 0, c.width, c.height);
    }
    async function getHeader(text, backgrounColor, textColor, font) {
      ctx.beginPath();
      ctx.fillStyle = backgrounColor;
      ctx.fillRect(0, 0, c.width, 60);
      ctx.fillStyle = textColor;
      ctx.font = font + " Open Sans";
      ctx.fillText(text, leftMargin, topMargin);
      await printData();
    }
    async function printData() {
      let x = c.toDataURL();
      console.log(x);
      await Pos.printBT({ value: x });
      ctx.restore();
    }
    async function getContent(lefttext, righttext, backgroundColor, textColor, font, rightMargin = 0) {
      ctx.beginPath();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, c.width, 60);
      ctx.fillStyle = textColor;
      ctx.font = font + " Open Sans";
      ctx.textAlign = "left";
      ctx.fillText(lefttext, leftMargin, topMargin);
      ctx.textAlign = "right";
      ctx.fillText(righttext, c.width, topMargin);
      await printData();
    }
    // await Pos.printBT({ value: x });
  }
  async printHeader() {
    {
      let blackColor = "#000";
      let whiteColor = "#FFF";
      let leftMargin = 10;
      let topMargin = 35;
      let c;
      let ctx;
      await initCanvas("575", "50");
      getBackground();
      async function initCanvas(width, height) {
        c = await getCanvas(width, height);
        ctx = await getCanvasContext(c);
        getBackground();
      }
      getHeader(this.orderDetail.paymentMethod, blackColor, whiteColor, "28px");
      this.blankSpace();
      getContent("ASAP", this.orderDetail.orderRemainingTime + " Min", blackColor, whiteColor, "28px", 15);
      this.blankSpace();
      // getHeader("Delivery", blackColor, whiteColor, "28px");
      // this.blankSpace();
      // getHeader("Client Details:", whiteColor, blackColor, "bold 28px");
      // this.blankSpace();
      // pageCut();
      function getCanvas(width, height): any {
        let c: any = document.createElement("canvas");
        c.setAttribute("width", width);
        c.setAttribute("height", height);
        return c;
      }
      function getCanvasContext(canvas) {
        return canvas.getContext("2d");
      }
      function getBackground() {
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, c.width, c.height);
      }
      async function getHeader(text, backgrounColor, textColor, font) {
        ctx.beginPath();
        ctx.fillStyle = backgrounColor;
        ctx.fillRect(0, 0, c.width, 60);
        ctx.fillStyle = textColor;
        ctx.font = font + " Open Sans";
        ctx.fillText(text, leftMargin, topMargin);
        await printData();
      }
      async function printData() {
        let x = c.toDataURL();
        console.log(x);
        await Pos.printBT({ value: x });
        ctx.restore();
      }
      async function getContent(lefttext, righttext, backgroundColor, textColor, font, rightMargin = 0) {
        ctx.beginPath();
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, c.width, 60);
        ctx.fillStyle = textColor;
        ctx.font = font + " Open Sans";
        ctx.fillText(lefttext, leftMargin, topMargin);
        ctx.fillText(righttext, (c.width - (righttext.length * 14) - rightMargin), topMargin);
        await printData();
      }
      // await Pos.printBT({ value: x });
    }
  }
  async blackLine() {
    let c = document.createElement('canvas');
    c.setAttribute("height", "2")
    c.setAttribute("width", "575")
    let ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, c.width, c.height);
    await Pos.printBT({ value: c.toDataURL() })
  }
  async blankSpace() {
    let c = document.createElement('canvas');
    c.setAttribute("height", "30")
    c.setAttribute("width", "575")
    let ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, c.width, c.height);
    await Pos.printBT({ value: c.toDataURL() })
  }
  async pageCut() {
    await Pos.printBT({ value: 'pagecutter' });
  }

  getBill(): string {
    let titlestr: String = ` {0}                     {1}    {2}    {3}`; // var itemstr:String = "%1$-10s %2$10s %3$11s %4$10s"; 
    let itemstr: String = ` {0}    {1}     {2}   {3}`; // This is the function. 
    String.prototype['format'] = function (args) { var str = this; return str.replace(String.prototype['format'].regex, function (item) { var intVal = parseInt(item.substring(1, item.length - 1)); var replace; if (intVal >= 0) { replace = args[intVal]; } else if (intVal === -1) { replace = "{"; } else if (intVal === -2) { replace = "}"; } else { replace = ""; } return replace; }); }; String.prototype['format'].regex = new RegExp("{-?[0-9]+}", "g");
    var BILL = "";
    // BILL = "                    OrderThai \n"
    //   + "                      XX.AA.BB.CC. \n"
    //   + "                    NO 25 ABC ABCDE \n"
    //   + "                     XXXXXX YYYYYY \n"
    //   + "                     MMM 590019091 \n";
    // BILL += "------------------------------------------------\n";
    // BILL += titlestr['format'](["Item", "Qty", "Rate", "Totel"]);
    // BILL += "\n";
    // BILL += "------------------------------------------------\n";
    // BILL += "\n " + itemstr['format'](["item-001", "01", "10", "10.00"]);
    // BILL += "\n " + itemstr['format'](["item-002", "02", "25", "50.00"]);
    // BILL += "\n " + itemstr['format'](["item-003", "05", "40", "200.00"]);
    // BILL += "\n " + itemstr['format'](["item-004", "10", "50", "500.00"]);
    // BILL += "\n"; BILL += "------------------------------------------------\n";
    // BILL += "\n\n ";
    // BILL += " Total Qty:" + " " + "85" + "\n";
    // BILL += " Total Value:" + " " + "700.00" + "\n";
    // BILL += "\n"; BILL += "------------------------------------------------\n";
    // console.log(BILL);
    // BILL += "\n " + itemstr['format'](["item-002", "02", "25", "50.00"]);
    // BILL += "\n " + itemstr['format'](["item-003", "05", "40", "200.00"]);
    // BILL += "\n " + itemstr['format'](["item-004", "10", "50", "500.00"]);
    BILL += "Payment Mode:" + " " + this.orderDetail.paymentMethod + "\n";
    BILL + "  \n";
    BILL += "ASAP:" + "        this.orderDetail.taxName.length>0 " + this.orderDetail.orderRemainingTime + " Min\n";
    // BILL += "Delivery:\n";
    BILL += "Name:" + "         " + this.orderDetail.name;
    BILL += "  \n";
    BILL += "Phone:" + "        " + this.orderDetail.mobile;
    BILL += "  \n";
    BILL += "Delivery:     " + ((this.orderDetail.address.length > 50) ? this.orderDetail.address.substr(0, 50) : this.orderDetail.address);
    BILL += "  \n";
    BILL += "  \n";
    BILL += "" + ((this.orderDetail.address.length > 51) ? this.orderDetail.address.substr(51, this.orderDetail.address.length - 1) : '');
    BILL += "  \n";
    BILL += "------------------------------------------------\n";
    BILL += titlestr['format'](["Item", "Qty", "Rate", "Total"]);
    BILL += "\n";
    BILL += "------------------------------------------------\n";
    this.orderDetail.order.map((item) => {
      BILL += "\n " + itemstr['format']([this.getFormattedName(item.productName), item.quantity, item.price, this.getPrice(item)]);
    });
    BILL += "\n"; BILL += "------------------------------------------------\n";
    BILL += "\n ";
    BILL += "               Total Qty:" + " " + this.getTotalQuantity() + "\n";
    BILL += "              Total Value:" + " " + this.getSubTotal() + "\n";
    BILL += "\n"; BILL += "------------------------------------------------\n";
    BILL += "                  " + this.userDetail.restaurantName + " \n";
    BILL += "     " + this.getAddress1() + " \n";
    BILL += "                " + this.getAddress2() + " \n";
    BILL += "                  " + this.userDetail.phoneNumber + " \n";
    BILL += "             " + this.userDetail.email + " \n";
    BILL += "\n ";
    BILL += "                   #" + ((this.orderDetail.orderId) ? this.orderDetail.orderId : this.orderDetail.index) + " \n";
    BILL += "\n ";
    BILL += "            " + this.orderDetail.orderTime + "\n";
    BILL += "\n ";
    BILL += "                 " + "Thank You" + "\n";

    return BILL;
  }
  getPrice(item: Dish): any {
    var total=0.00;
    if(item.orderProductChoices.length > 0){
      item.orderProductChoices.map((choice) => {
        if(choice.optionPrice==undefined || choice.optionPrice == null || choice.optionPrice=="" ){
          total += 0.00;
        }else{
          
        total += (Number.parseFloat(choice.optionPrice)*parseInt(item.quantity));
        }
      });
    }
    const value = (Number.parseFloat(item.price) * Number.parseFloat(item.quantity))+total;

    return value.toFixed(2);
  }

  getAddress1() {
    let address = '';
    if (this.userDetail) {
      address += (this.userDetail.address && this.userDetail.address.length > 0) ? this.userDetail.address + ', ' : '';
      address += (this.userDetail.streetName) ? this.userDetail.streetName : '';
    }
    // address = this.getAddress(43, address).replace("\n/g", "\n")
    return address;
  }
  getAddress2() {
    let address = '';
    if (this.userDetail) {
      address += (this.userDetail.city && this.userDetail.city.length > 0) ? this.userDetail.city + ', ' : '';
      address += (this.userDetail.postCode) ? this.userDetail.postCode : '';
    }
    // address = this.getAddress(43, address).replace("\n/g", "\n")
    return address;
  }

  getAddress(i: number, msg: string): string {
    while (i <= msg.length) {
      msg = msg.substring(0, i) + "\n                     " + msg.substring(i, msg.length);
      i = i + 45;
    }
    return msg;
  }

  getFormattedName(val: string): string {
    let final = '';
    final = val;
    if (final.length < 20) {
      while (final.length < 20) {
        final = final + " ";
      }
    } else {
      final = final.substr(0, 20);
    }
    return final;
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  isTaxAvailable() {
    return (Number.parseFloat(this.orderDetail.tax) > 0 && (this.orderDetail.taxName && this.orderDetail.taxName.length > 0));
  }
  getTax() {
    let total = 0.0;
    let tax = 0.0;
    if (this.orderDetail.order && this.orderDetail.order.length > 0) {
      this.orderDetail.order.map((item) => {
        total += Number.parseFloat(this.getPrice(item));
      });
    }
    if(this.orderDetail.taxType == "1"){
      tax=0.00;
    }else if(this.orderDetail.taxType == "2"){
      tax = ((total * Number.parseFloat(this.orderDetail.taxPaymentOption)) / 100);
    }
    
    return isNaN(tax) ? '0.0' : tax.toFixed(2);
  }
  getPaymentTax(){
    let total = 0.0;
    let tax = 0.0;
    if (this.orderDetail.order && this.orderDetail.order.length > 0) {
      this.orderDetail.order.map((item) => {
        total += Number.parseFloat(this.getPrice(item));
      });
    }
    tax = ((total * Number.parseFloat(this.orderDetail.taxPaymentOption)) / 100);
    return isNaN(tax) ? '0.0' : tax.toFixed(2);
  }
  getSubTotal() {
    let total = 0.0;
    if (this.orderDetail.order && this.orderDetail.order.length > 0) {
      this.orderDetail.order.map((item) => {
        total += Number.parseFloat(this.getPrice(item));
      });
    }
    return total.toFixed(2);
  }
  getTotal() {
    let total: number = 0.0;
    const subTotal: number = Number.parseFloat(this.getSubTotal());
    const tax: number = Number.parseFloat(this.getTax());
    const delivery:number = Number.parseFloat(this.orderDetail.deliveryFee);
    total = subTotal + tax + delivery;
    return total.toFixed(2);
  }

   tConvert (time:any) {
    // Check correct time format and split into components
    time = time?.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
  }

}
