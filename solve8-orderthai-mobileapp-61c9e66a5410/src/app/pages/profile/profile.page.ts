import { Component, OnInit } from '@angular/core';
import { StorageManager } from 'src/app/services/StorageService/StorageManager';
import { User } from 'src/app/Models/user';
import { MyApiService } from 'src/app/services/ApiService/my-api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userDetail: any;

  constructor(private storageManager: StorageManager, private apiService: MyApiService) {
    this.getUserDetail();
  }

  ngOnInit() {
  }
  async getUserDetail() {
    this.userDetail = (await this.apiService.getUserDetails()).data.restaurant;
  }

  getAddress() {
    let address = '';
    if (this.userDetail) {
      address += (this.userDetail.address) ? this.userDetail.address + ', ' : '';
      address += (this.userDetail.streetName) ? this.userDetail.streetName : '';
      address += (this.userDetail.city) ? ', ' + this.userDetail.city : '';
      address += (this.userDetail.postCode) ? ', ' + this.userDetail.postCode : '';
    }
    return address;
  }
}
