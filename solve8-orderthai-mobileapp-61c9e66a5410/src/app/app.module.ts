import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { UtilService } from './services/Utils/utils';
import { MyApiService } from './services/ApiService/my-api.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MyInterceptorService } from './services/Interceptor/my-interceptor.interceptor';
import { StorageManager } from 'src/app/services/StorageService/StorageManager';
import { IonicStorageModule } from '@ionic/storage';
import { TestOrderService } from './services/StorageService/TestOrderManager';
import { MyClockService } from './services/ClockService/my-clock.service';
import { MyTimerService } from './services/TimerService/my-timer.service';
import { Media } from '@ionic-native/media/ngx';
import { AppVersion} from '@ionic-native/app-version/ngx';
import { OrderService } from './services/ApiService/order.service';
import { BatteryStatus } from '@ionic-native/battery-status/ngx';
import { PopoverComponent } from './pages/popover/popover.component';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';
import {Network} from '@ionic-native/network/ngx';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';
import{GlobalConstants} from 'src/app/common/global';





@NgModule({
  declarations: [AppComponent,PopoverComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot({ mode: 'md' }),
    AppRoutingModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: MyInterceptorService, multi: true },
    UtilService,
    MyApiService,
    Media,
    AppVersion,
    BatteryStatus,
    StorageManager,
    OrderService,
    TestOrderService,
    MyClockService,
    MyTimerService,
    NativeAudio,
    BluetoothSerial,
    Network,
    WifiWizard2,
    GlobalConstants
    
   


  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
