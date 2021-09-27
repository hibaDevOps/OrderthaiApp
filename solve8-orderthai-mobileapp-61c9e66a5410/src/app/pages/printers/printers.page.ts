import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, MenuController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute,  Router } from '@angular/router'
import {MyNavService} from 'src/app/services/NavService/my-nav.service';
@Component({
  selector: 'app-printers',
  templateUrl: './printers.page.html',
  styleUrls: ['./printers.page.scss'],
})
export class PrintersPage implements OnInit {
  selectedRole:any;
  constructor( private menuCtrl: MenuController,
    private navCtrl: NavController,
    private actRoute:ActivatedRoute,
    private router:Router,
    private navService:MyNavService) {
      navService.title="Connect a Printer";
     }

  ngOnInit() {
    console.log(this.selectedRole);
  }
  redirectTo(path: string) {
    
      this.navCtrl.navigateRoot(path);
    
  }
  radioGroupChangePage(event:any){
    if(event.detail.value == "bluetooth"){
      this.selectedRole="bluetooth"
      this.redirectTo('/thermal-printer/bluetooth-printer');

    }else{
      this.selectedRole="wifi";
      this.redirectTo('/thermal-printer/wifi-printer');
    }
  }
  swipeEvent(e){
  }
}
