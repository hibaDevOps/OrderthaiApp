import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import moment from 'moment';
import { Order } from 'src/app/Models/order';
import { OrderService } from 'src/app/services/ApiService/order.service';
import { MyNavService } from 'src/app/services/NavService/my-nav.service';
import { TestOrderService } from 'src/app/services/StorageService/TestOrderManager';
import { UtilService } from 'src/app/services/Utils/utils';

@Component({
  selector: 'app-order-reject',
  templateUrl: './order-reject.page.html',
  styleUrls: ['./order-reject.page.scss'],
})
export class OrderRejectPage implements OnInit {

  public orderDetails: Order;
  public orderTime: string = '';
  constructor(
    private testOrder: TestOrderService,
    private navService: MyNavService,
    private navCtrl: NavController,
    private apiService: OrderService,
    private utils: UtilService,
  ) { }


  ngOnInit() {
  }

  ionViewDidEnter() {
    this.orderDetails = this.navService.myParam;
  }

  onReject() {
    if (!this.orderDetails.orderId) {
      this.testOrder.updateStatus('reject', this.orderDetails.index,'').then(() => {
        this.updateRecord('Rejected');
      });
      return;
    }
    this.apiService.updateStatus(this.orderDetails.orderId, 'reject','').then(acceptRes => {
      this.updateRecord('Rejected');
    }).catch(err => {
      console.log(err);
    })

  }
  updateRecord = (status) => {
    this.orderDetails.orderStatus = status;
    this.navService.myParam = this.orderDetails;
    setTimeout(() => {
      this.navCtrl.back();
    }, 100);
  }

  getTel(phone: string) {
    return 'tel:+61 ' + phone;
  }
}
