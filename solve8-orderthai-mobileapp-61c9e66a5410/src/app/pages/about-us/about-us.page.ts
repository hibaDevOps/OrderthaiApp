import { Component, OnInit } from '@angular/core';
import { MyApiService } from 'src/app/services/ApiService/my-api.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.page.html',
  styleUrls: ['./about-us.page.scss'],
})
export class AboutUsPage implements OnInit {

  aboutus: any;
  constructor(private apiService: MyApiService) {
    this.apiService.get('aboutus').then(response => this.aboutus = response).catch(err => this.aboutus = err.error.text);
    this.aboutus = '';
  }

  ngOnInit() {
  }

}
