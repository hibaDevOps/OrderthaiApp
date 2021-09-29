import { Component, OnInit } from '@angular/core';
import {Network} from '@ionic-native/network/ngx';
import {WifiWizard2} from '@ionic-native/wifi-wizard-2/ngx';
import {GlobalConstants} from 'src/app/common/global';
import { AlertController, MenuController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute,  Router } from '@angular/router'
import { Printer } from 'src/app/Models/printer';
import {PrinterAPIService} from 'src/app/services/ApiService/printer_api.service';
declare var Socket: any;
@Component({
  selector: 'app-wifi-printer',
  templateUrl: './wifi-printer.page.html',
  styleUrls: ['./wifi-printer.page.scss'],
})
export class WifiPrinterPage {
  error:any;
  result:[];
  name:any;
  IP:any;
  PORT:string="9100";
  


  constructor(private network: Network,private wiz:WifiWizard2,private navCtrl: NavController,
    private actRoute:ActivatedRoute,
    private router:Router,
    private printerService:PrinterAPIService) { 
    if (this.network.type == 'none'){
      this.error="no network"


    }else if(this.network.type === 'wifi'){
     this.error="wifi";
     this.error=this.wiz.getWifiIP();
      
    }

    this.network.onConnect().subscribe(()=> {
      if(network.Connection.WIFI){

        this.error="network conneted;";

      }
    });

    this.network.onDisconnect().subscribe(()=> {
      this.error="network is disconnected";
    });

   
   }
   redirectTo(path: string) {
    
    this.navCtrl.navigateRoot(path);
  
}

   async connect(){
      this.IP=this.name;
      
      GlobalConstants.selectWifiPrinter=this.IP;
      this.error=GlobalConstants.selectWifiPrinter;
      var printer :Printer=new Printer();
      printer.printerAddress=this.IP;
      printer.port=this.PORT;
      printer.kitchenReciept="";
      printer.counterReciept="";
      printer.restaurantId=localStorage.getItem("myRestaurantId");
      
      GlobalConstants.listWifiPrinter.push(printer);
      await this.printerService.savePrinterList(printer);
      console.log(GlobalConstants.selectWifiPrinter);
     
  }


 
 
  

  ionViewDidEnter() {
    let connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      // We just got a connection but we need to wait briefly
       // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          this.error="we got a wifi connection, woohoo!";
          console.log('we got a wifi connection, woohoo!');

        }
        console.log(this.network);
      }, 3000);
    },error=>{
      console.log(error);
      
    });
  }
  swipeEvent(e){
  }
  kitchenReciept(){
    var esc = '\x1B'; //ESC byte in hex notation
    var newLine = '\x0A';
    var unlock_reverse='\x1D\x421';
    var lock_reverse='\x1D\x420';
    var lock_bold=esc + '\x451';
    var unlock_bold=esc + '\x450';
    var right_align=esc + '\x612';
    var hori_tab='\x09';
    var triple_size='\x1D\x213';
    var triple_size_unlock='\x1D\x210';
    var square='&#9634';



    var cmds = esc + "@"; 
    cmds += newLine + newLine + newLine + newLine + newLine;
    cmds += unlock_reverse + "As soon as possible                    " + "~25mins";
    cmds += lock_reverse;
    cmds += newLine + newLine;
    cmds += lock_bold + "Order Details" + newLine + newLine;
    
    cmds += unlock_bold +"Order ID: \t\t\t\t" + "123456" + newLine;
    cmds += "Order Accepted At: \t\t" +"Aug 15th 6:44pm"+newLine;
    cmds += "Estimated Fulfilment At: \t"+"Aug 15th 7:00pm"+newLine;
    cmds += newLine + newLine+ hori_tab+"I want it to delivered not cold but hot like last time please pay attention.";
    cmds += newLine + newLine +"Items:"+newLine+newLine;
    cmds += "1X"+hori_tab+" Pad Thai Chicken " + hori_tab+"$13"+ newLine +newLine +newLine;
    cmds += lock_bold + "All Food Checked and good to go?" + newLine + newLine;
    
    cmds += unlock_bold;


    cmds += newLine + newLine + newLine + newLine + newLine;
   
    cmds += '\x1B@\x1DV1';
    return cmds;
   
   

  }
  print(){

    console.log(this.IP+this.PORT)
    const socket = new Socket();
    const resultByte= new Uint8Array([27, 64, 29, 118, 48, 0, 3, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 86, 0]);


  socket.open(
    this.IP,
    this.PORT,
    () => {
      socket.write(resultByte, () => {
        socket.shutdownWrite();
      });
    },
    (err) => {
      console.error(err);
      this.error=err;
    }
  );
  }
}
