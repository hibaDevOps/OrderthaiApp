import { Component, OnInit } from '@angular/core';
import {GlobalConstants}from 'src/app/common/global';
import { AlertController, MenuController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute,  Router } from '@angular/router'
import {MyNavService} from 'src/app/services/NavService/my-nav.service';
import {OrderService} from 'src/app/services/ApiService/order.service';
import { Printer } from 'src/app/Models/printer';

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
  

  constructor(private gv:GlobalConstants,private navCtrl: NavController,
    private actRoute:ActivatedRoute,
    private router:Router,private navService:MyNavService,
    private orderService:OrderService) { 
      navService.title="What Dockets?";
    }

  ngOnInit() {
    this.bluetoothPrinter=GlobalConstants.selectedPrinter;
    this.wifiPrinter=GlobalConstants.selectWifiPrinter;
    this.listOfBluetooth=GlobalConstants.listBluetoothPrinter;
    this.listOfWifi=GlobalConstants.listWifiPrinter;
   
    console.log(this.wifiPrinter);
  }

  toggleBluetoothKitchen(event:any){
    if (event.detail.value == this.toggle_bluetooth_kitchen) {
      return;
    }

    this.toggle_bluetooth_kitchen = event.detail.value;
    if(this.toggle_bluetooth_kitchen){
      GlobalConstants.kitchen=1;
    }
  }
  toggleBluetoothCounter(event:any){
    if (event.detail.value == this.toggle_bluetooth_counter) {
      return;
    }

    this.toggle_bluetooth_counter = event.detail.value;
    if(this.toggle_bluetooth_counter){
      GlobalConstants.counter=1;
    }
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
    console.log(GlobalConstants.listBluetoothPrinter);
    //this.navCtrl.navigateRoot(path);
  
}

}
