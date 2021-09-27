import { Component, OnInit } from '@angular/core';
//-----------------------custom plugin--------------------------------//

import { Plugins } from '@capacitor/core';
import { StorageManager } from 'src/app/services/StorageService/StorageManager';
import { UtilService } from 'src/app/services/Utils/utils';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';
import EscPosEncoder from 'esc-pos-encoder-ionic';


@Component({
  selector: 'app-bluetooth-printer',
  templateUrl: './bluetooth-printer.page.html',
  styleUrls: ['./bluetooth-printer.page.scss'],
})
export class BluetoothPrinterPage  {
  MAC = ''; // this is bluetooth printer mac address
  // * End
  pairedList: pairedlist;
  listToggle: boolean = false;
  Error:any;
  searching:boolean=false;
  status:any;
  init:boolean=true;
  btn_txt:any;
  esc:EscPosEncoder=new EscPosEncoder();
  
  constructor(private storageService: StorageManager,private utils:UtilService,private bluetooth:BluetoothSerial) { }

  ionViewDidEnter() {
    this.btn_txt="Start Search";
    print();
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
    }, error => {
      this.listToggle = false;
      this.searching=false;
      this.btn_txt="Start Search";

      this.Error="Connot list Devices";

    });
  }

  radioGroupChange(event:any){
    this.Error=event.detail.value;
    this.MAC=event.detail.value;
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
    const result = this.esc.initialize();
    var esc = '\x1B'; //ESC byte in hex notation
    var newLine = '\x0A';
    var unlock_reverse='\x1D\x421';
    var lock_reverse='\x1D\x420';
    var lock_bold=esc + '\x451';
    var unlock_bold=esc + '\x450';
    var right_align=esc + '\x612';
    var hori_tab='\x09';


    var cmds = esc + "@"; 
    cmds += newLine + newLine + newLine + newLine + newLine;
    cmds += unlock_reverse + "As soon as possible                    " + "~25mins";
    cmds += lock_reverse;
    cmds += newLine + newLine;
    cmds += lock_bold + "Order Details" + newLine + newLine;
    
    cmds += unlock_bold +"Order ID: \t\t\t\t" + "123456" + newLine;
    cmds += "Order Accepted At: \t\t" +"Aug 15th 6:44pm"+newLine;
    cmds += "Estimated Fulfilment At: \t"+"Aug 15th 7:00pm"+newLine;
    cmds += newLine + newLine + hori_tab+"I want it to delivered not cold but hot like last time please pay attention.";
    cmds += newLine + newLine +"Items:"+newLine+newLine;
    cmds += "1X"+hori_tab+" Pad Thai Chicken " + hori_tab+"$13"+newLine +newLine +newLine;
    cmds += lock_bold + "All Food Checked and good to go?" + newLine + newLine;
    
    cmds += unlock_bold;


    cmds += newLine + newLine + newLine + newLine + newLine;

    cmds += '\x1B@\x1DV1';

    let img = new Image();
    img.src = '/assets/icon/delivery-truck.png';
    result
      .align('center')
      .newline()
      .line('Congratulation, print success')
      .line('Bluetooth MAC : ' + this.MAC)
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut();

    const resultByte = result.encode();
    return resultByte;

  }
  testPrintViaBluetooth() {
    
    // socket receive bytecode, therefore we need to create a byte stream by using esc-pos-encoder-ionic
    const resultByte = this.kitchenReciept();

    // send byte code into the printer
    this.bluetooth.connect(this.MAC).subscribe(() => {
      this.bluetooth.write(resultByte)
        .then(() => {
          console.log('Print success');
          this.Error="Print success";
        })
        .catch((err) => {
          console.error(err);
          this.Error="Cannot Print";

        });
    });
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
