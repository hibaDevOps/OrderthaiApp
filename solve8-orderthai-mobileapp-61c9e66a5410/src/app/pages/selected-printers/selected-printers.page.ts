import { Component, OnInit } from '@angular/core';
import {GlobalConstants}from 'src/app/common/global';
import { AlertController, MenuController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute,  Router } from '@angular/router'
import {MyNavService} from 'src/app/services/NavService/my-nav.service';
import {OrderService} from 'src/app/services/ApiService/order.service';
import {PrinterAPIService}from 'src/app/services/ApiService/printer_api.service';

import { Printer } from 'src/app/Models/printer';
import { MyApiService } from 'src/app/services/ApiService/my-api.service';

@Component({
  selector: 'app-selected-printers',
  templateUrl: './selected-printers.page.html',
  styleUrls: ['./selected-printers.page.scss'],
})
export class SelectedPrintersPage implements OnInit {
  public bluetoothPrinter:string='';
  public wifiPrinter:string='';
  public listOfBluetooth:Printer[]=[];
  public listOfWifi:Printer[]=[];
  public toggle_bluetooth_kitchen:boolean=false;
  public toggle_bluetooth_counter:boolean=false;

  public toggle_wifi_kitchen:boolean=false;
  public toggle_wifi_counter:boolean=false;

  public getAllPrinters:Printer[]=[];
  

  constructor(private gv:GlobalConstants,private navCtrl: NavController,
    private actRoute:ActivatedRoute,
    private router:Router,private navService:MyNavService,
    private orderService:OrderService,
    private apiService:MyApiService,
    private printerService:PrinterAPIService) { 
      navService.title="What Dockets?";
    }

  async getPrinters(restaurant_id){
   this.getAllPrinters=(await this.printerService.getPrinterFromId(restaurant_id));
   this.getAllPrinters.sort((a, b) => {
    return (b.id - a.id);
  });

  this.getAllPrinters.map((item) => {
    item.id = (item.id) ? item.id : item.id;
    item.printerType = (item.printerType && item.printerType.length > 0) ? item.printerType : '';
    item.port=(item.port) ? item.port : '';
    item.counterReciept=item.counterReciept;
    item.kitchenReciept=item.kitchenReciept;
  });
   console.log(this.getAllPrinters);
  }

  ngOnInit() {
    this.bluetoothPrinter=GlobalConstants.selectedPrinter;
    this.wifiPrinter=GlobalConstants.selectWifiPrinter;
    this.listOfBluetooth=GlobalConstants.listBluetoothPrinter;
    this.listOfWifi=GlobalConstants.listWifiPrinter;
    this.getPrinters(localStorage.getItem("myRestaurantId"));
    
    console.log(this.wifiPrinter);
  }

 async toggleKitchen(event:any,printer:Printer){
    if (event == this.toggle_bluetooth_kitchen) {
      return;
    }

    this.toggle_bluetooth_kitchen = event;
    if(this.toggle_bluetooth_kitchen){
      GlobalConstants.kitchen=1;

    }
   
    await this.printerService.updatePrinter(printer,false);
  }
  async toggleCounter(event:any,printer:Printer){
    if (event == this.toggle_bluetooth_counter) {
      return;
    }

    this.toggle_bluetooth_counter = event;
    if(this.toggle_bluetooth_counter){
      GlobalConstants.counter=1;
    }
    await this.printerService.updatePrinter(printer,false);
  }
  
  toggleWifiKitchen(event:any){
    if (event.detail.value == this.toggle_wifi_kitchen) {
      return;
    }

    this.toggle_wifi_kitchen = event.detail.value;
    if(this.toggle_wifi_kitchen){
      GlobalConstants.wifiKitchen=1;
    }
  }
  toggleWifiCounter(event:any){
    if (event.detail.value == this.toggle_wifi_counter) {
      return;
    }

    this.toggle_wifi_counter = event.detail.value;
    if(this.toggle_wifi_counter){
      GlobalConstants.wifiCounter=1;
    }
  }
  redirectTo(path: string) {
  //  console.log(GlobalConstants.listBluetoothPrinter);
    this.navCtrl.navigateRoot(path);
  
}

}
