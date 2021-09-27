import { Component, OnInit } from '@angular/core';
//-----------------------custom plugin--------------------------------//

import { Plugins } from '@capacitor/core';
import { StorageManager } from 'src/app/services/StorageService/StorageManager';
import { UtilService } from 'src/app/services/Utils/utils';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';
import EscPosEncoder from 'esc-pos-encoder-ionic';
import {Document} from 'src/app/services/EscService/Document';
import { BitmapDensity, FeedControlSequence, FontFamily, FontStyle, TextAlignment } from 'src/app/services/EscService/Enum';
import { ESCPOSImage } from 'src/app/services/EscService/Image';
import {GlobalConstants} from 'src/app/common/global';
import { TextFormat } from 'src/app/services/EscService/Commands';
import { AlertController, MenuController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute,  Router } from '@angular/router'
import { Printer } from 'src/app/Models/printer';


@Component({
  selector: 'app-bluetooth-printer',
  templateUrl: './bluetooth-printer.page.html',
  styleUrls: ['./bluetooth-printer.page.scss'],
})
export class BluetoothPrinterPage implements OnInit {
  MAC = ''; // this is bluetooth printer mac address
  // * End
  pairedList: pairedlist;
  listToggle: boolean = false;
  Error:any;
  searching:boolean=false;
  status:any;
  init:boolean=true;
  btn_txt:any;
  toggle_kitchen:boolean=false;
  toggle_counter:boolean=false;
  bluetoothList:any=[];

  
  constructor(private storageService: StorageManager,private utils:UtilService,private bluetooth:BluetoothSerial,private gv:GlobalConstants,private navCtrl: NavController,
    private actRoute:ActivatedRoute,
    private router:Router) {
     
     }

  ngOnInit() {
    this.btn_txt="Start Search";
    const doc = new Document();
    let escposCommands;
    ESCPOSImage.load('data:image/png;base64,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').then(logo => {
    escposCommands = doc
        .newLine()
        .newLine()
        .newLine()
        .reverseColors(true)
        .style([FontStyle.Bold])
        .font(FontFamily.A)
        .align(TextAlignment.LeftJustification)
        .text("Estimated Time")
        .align(TextAlignment.RightJustification)
        .newLine()
        .feed(5)
        .cut()
        .generateUInt8Array();
    console.log(escposCommands);
  });
    
  }

  checkBluetoothEnabled() {
    this.bluetooth.isEnabled().then(success => {
      this.listPairedDevices();
    }, error => {
      this.Error="Cannot Paired";
    });
  }

  listPairedDevices() {
    this.init=false;
    this.searching=true;
    this.btn_txt="Searching";
    this.bluetooth.list().then(success => {
      this.pairedList = success;
      this.listToggle = true;
      this.searching=false;
      this.btn_txt="Start Search";
      this.Error="Paired device";
      GlobalConstants.listBluetoothPrinter=this.pairedList.address;
     // console.log(GlobalConstants.listBluetoothPrinter);
    
    }, error => {
      this.listToggle = false;
      this.searching=false;
      this.btn_txt="Search Again";
      this.Error="Connot list Devices";

    });
  }

  radioGroupChange(event:any){
    this.Error=event.detail.value;
    this.MAC=event.detail.value;
    GlobalConstants.selectedPrinter=this.MAC;
    this.btn_txt="Next";
    this.selectDevice();


  }

  selectDevice() {
    let connectedDevice = this.pairedList[this.MAC];
    if (!connectedDevice.address) {
      this.Error="Cannot Connect";
      return;
    }
    let address = connectedDevice.address;
    let name = connectedDevice.name;
    connectedDevice.selected=true;
    this.Error="Can connect";

    
    
    this.connect(address);
  }

  connect(address) {
    // Attempt to connect device with specified address, call app.deviceConnected if success
    this.bluetooth.connect(address).subscribe(success => {
      this.deviceConnected();
      
    }, error => {
      this.Error="Cannot Connect";

    });
  }
  toggleKitchen(event:any){
    if (event.detail.value == this.toggle_kitchen) {
      return;
    }

    this.toggle_kitchen = event.value;
    if(this.toggle_kitchen){
      GlobalConstants.kitchen=1;
    }
  }
  toggleCounter(event:any){
    if (event.detail.value == this.toggle_counter) {
      return;
    }

    this.toggle_counter = event.value;
    if(this.toggle_counter){
      GlobalConstants.counter=1;
    }
  }
  selectPrinter(address:any,i:any){
    this.Error=address;
    this.MAC=address;
    GlobalConstants.selectedPrinter=this.MAC;
   // this.btn_txt="Next";
   this.Error = this.Error + " After two lines";
    var printer:Printer=new Printer();
      printer.address="";
      printer.port="";
      printer.Kitchen_receipt="";
      printer.counter_receipt="";
      printer.restaurant_id="17";
      this.Error = this.Error + " After Printer receipt lines";   
      this.Error=this.Error+" "+printer.address+printer.port+printer.Kitchen_receipt+printer.counter_receipt+printer.restaurant_id+printer.printer_type;
   // GlobalConstants.listBluetoothPrinter.push(printer);
    this.Error = this.Error + " After list of bluetoothPrinter add lines";
    //this.bluetoothList=GlobalConstants.listBluetoothPrinter;
    
    this.selectDevice();
  }
  deviceConnected() {
    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetooth.subscribe('\n').subscribe(success => {
      this.Error="device connected";
    }, error => {
      this.Error="cannot connect device";

    });
  }

  deviceDisconnected() {
    // Unsubscribe from data receiving
    this.bluetooth.disconnect();
  }


  /**
   *
   */
  print(){
    this.testPrintViaBluetooth();
  };
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
    var bti=new Uint8Array([27, 64, 29, 118, 48, 0, 3, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 86, 0]);



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
    var sq = ' ___';
        sq +='   |';
        sq +='____'
    cmds += '\x1B@\x1DV1';

   
   

  }
  async testPrintViaBluetooth() {
    
    // socket receive bytecode, therefore we need to create a byte stream by using esc-pos-encoder-ionic
    const doc = new Document();
    let escposCommands;
    ESCPOSImage.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAABTCAYAAADHq7TAAAAC7klEQVR4Ae2ai43CMBBEUwIdQAl0ACVQAiXQAXQAHUAH0AElUAIlUEJOw52liI+U3c3MxXEsRXAcOH6etbMeu6rJZb1e11VVha77/d55K6vOa3ypcLPZhKDRaVmC73a7MPjj8XjpzvifdMW7AI9jvtdABz8ej2HF35sd/6T34LPZLE75oQY6+PV6DSleLPhyufygV/yj3iueLTiewZEEBgkQo9AVLxYcyUeRiiNMI+BIgBiFHupFg0+nU7fqh8OBIXgtUTwCfjqd8gWfz+duxZH5MYpEcSQh3gkua/CIC1MsOMN9wdCRhHpE8azBIy4MY2KTKV4sOJIQz6w+mUxYgmvGuNd3Y7kvslD3grNMCBm413cbwQkjXfIc97owq9WKgPxbZa/BWX6bbIx7FceGI6tIFH/2sGOrmGU7yRQvGhxZmDV7Y7kvUsU99tP5fEYbKUU2xj3gLBMCPSkD99hPgwBHMmId44MA97gwLPdFGurFgnuOfVGm879KZZObx34qEpxpO0nHuNWFYdpOvQZnui9S8MvlYnqODwbc6rsNBvx2u5kUZ7ov0lC3ujDFgjNtJ6ni1mNfTNtJCo6b4dnc9sJzn1lkKSsgANP2Yq7M0BYpOFNBa90juLXHcv/+qHjuClrbPypu7bHcvz8qrlQQ6SsSlE+Xqh1SxQGMdTkWIFhvNzcSccIZmw44GsbO2tC5MnCsx9t668jnmbsoMnBAW8+sIxqy3i1FeFuh0x4b4NFpjEIPde9xzgSPTmMUKjjUxnhNEN5XRshTwa3O6reOYdhQVPBomKeOYIQ7FdyzUZhgm68YLl2XLMAZmwtUcExKTeW877MDR+rphW3+juG4UhXHuPQc+mlCI4lh5O50cGRezcVIE6rN++122/W89qyPDo677Pd7F/xisaiRBDGKBNwKjwgBNCPEUyfKwHFDzPKYob+lsQDG/xDeLKX/BTzdFKkswh/r83Qh2cHszQZObZAqnm7ah9cRvA8qKNvwAxfWegAQQ6FgAAAAAElFTkSuQmCC').then(logo => {
    escposCommands = doc
            .newLine()
            .newLine()
            .newLine()
            .setColorMode(false)
            .reverseColors(true)
            .style([FontStyle.Bold])
            .size(0,0)
            .font(FontFamily.A)
            .align(TextAlignment.Center)
            .text("As soon as possible                     25mins")
            .reverseColors(false)
            .newLine()
            .newLine()
            .size(1,1)
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
            .text("786766")
            .newLine()
            .marginLeft(0)
            .align(TextAlignment.LeftJustification)
            .text("Order Accepted At: ")
            .control(FeedControlSequence.HorizontalTab)
            .control(FeedControlSequence.HorizontalTab)
            .text("24 Aug 2013")
            .newLine()
            .marginLeft(0)
            .align(TextAlignment.LeftJustification)
            .text("Estimated Fulfilment At ")
            .control(FeedControlSequence.HorizontalTab)
            .text("29 Aug 2013")
            .newLine()
            .newLine()
            .style([FontStyle.Bold])
            .size(2,1)
            .text("! ")
            .style([])
            .size(0,0.5)
            .marginBottom(20)
            .control(FeedControlSequence.CarriageReturn)
            .text("Coffee must not b coldlike before")
            .newLine()
            .newLine()
            .size(0,0)
            .style([FontStyle.Bold])
            .text("Items: ")
            .newLine()
            .newLine()
            .text("1x")
            .control(FeedControlSequence.HorizontalTab)
            .text("Pad Thai Chicken")
            .newLine()
            .style([FontStyle.Italic])
            .text("")
            .control(FeedControlSequence.HorizontalTab)
            .style([FontStyle.Italic])
            .text("Choose you sauce:spice sauce")
            .newLine()
            .text("")
            .control(FeedControlSequence.HorizontalTab)
            .text("Size Medium")
            .newLine()
            .text("")
            .control(FeedControlSequence.HorizontalTab)
            .style([FontStyle.Bold])
            .size(2,0)
            .text("!")
            .size(0,0)
            .style([FontStyle.Italic])
            .text("Please make sure you add more choice")
            .newLine()
            .newLine()
            .style([FontStyle.Bold])
            .align(TextAlignment.Center)
            .text("Proudly powered by")
            .newLine()
            .feed(5)
            .cut()
            .generateUInt8Array();
       
         


        this.bluetooth.connect(this.MAC).subscribe(() => {
          this.bluetooth.write(escposCommands)
            .then(() => {
              console.log('Print success');
              this.Error="Print success";
            })
            .catch((err) => {
              console.error(err);
              this.Error="Cannot Print";
    
            });
        });
    });

    // send byte code into the printer
    
  }

  
  redirectTo(path: string) {
    
    this.navCtrl.navigateRoot(path);
  
}

//This will print
printStuff()
{  
 //The text that you want to print
 var myText="Hello hello hello \n\n\n This is a test \n\n\n";
}
}
interface pairedlist {
  "class": number,
  "id": string,
  "address": string,
  "name": string,
  "selected":boolean
}
