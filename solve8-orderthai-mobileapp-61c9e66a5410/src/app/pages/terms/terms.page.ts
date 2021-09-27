import { Component, OnInit } from '@angular/core';
import { MyApiService } from 'src/app/services/ApiService/my-api.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
})
export class TermsPage implements OnInit {
  myterms:any;
  constructor(private apiService:MyApiService) {
    this.apiService.get('terms').then(response => this.myterms = response).catch(err => this.myterms = err.error.text);
    this.myterms = '';
   }

  ngOnInit() {
  }

}
