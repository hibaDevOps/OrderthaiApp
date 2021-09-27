import { Component, OnInit } from '@angular/core';
import {GlobalConstants}from 'src/app/common/global';
import { AlertController, MenuController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute,  Router } from '@angular/router'
import {MyNavService} from 'src/app/services/NavService/my-nav.service';
import { Printer } from 'src/app/Models/printer';
import {OrderService} from 'src/app/services/ApiService/order.service';
import { Order } from 'src/app/Models/order';



@Component({
  selector: 'app-list-printers',
  templateUrl: './list-printers.page.html',
  styleUrls: ['./list-printers.page.scss'],
})
export class ListPrintersPage implements OnInit {

  listPrinters:any=[];
  selectedPrintersList:Printer[]=[];
  constructor(private navCtrl: NavController,
    private actRoute:ActivatedRoute,
    private router:Router,
    private navService:MyNavService,
    private orderService:OrderService) { 
      navService.title="Select Printers";
      
    }

  ngOnInit() {
  
    
  }
  savePrinter(){
    var printer:Printer=new Printer();
    printer.address="8900:09090";
    printer.printer_type="bluetooth";
    printer.restaurant_id="17";
    this.selectedPrintersList.push(printer);
    console.log(this.selectedPrintersList);
    //this.orderService.savePrinterList(this.selectedPrintersList);
  }
  ionViewDidEnter(){
       this.listPrinters=GlobalConstants.listBluetoothPrinter;
  }
  selectPrinter(address:any){
    var printer:Printer=new Printer();
    printer.address="8900:09090";
    printer.printer_type="bluetooth";
    printer.restaurant_id="17";
    GlobalConstants.listBluetoothPrinter.push(printer);
    console.log(GlobalConstants.listBluetoothPrinter);
    
    GlobalConstants.selectedPrinter=address;
    
    
  }
 
  redirectTo(path: string) {
    var printer:Printer=new Printer();
    printer.address="8900:09090";
    printer.printer_type="bluetooth";
    printer.restaurant_id="17";
    GlobalConstants.listBluetoothPrinter.push(printer);
    this.navCtrl.navigateRoot(path); 
}
}
