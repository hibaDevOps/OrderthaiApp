import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { FeedbackService } from 'src/app/services/ApiService/feedback.service';
import { StorageManager } from 'src/app/services/StorageService/StorageManager';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {
  feedback: string;
  version: any;
  restaurantId: any;
  restaurantEmail: any;
  toEmail: string = 'feedback@orderthai.com.au';
  title: string = 'Feedback (Restaurant app on Android)';
  constructor(
    private appVersion: AppVersion,
    private feedBackService: FeedbackService,
    private storageService: StorageManager) {
    this.feedback = '';
    this.getVersion();
  }
  async getVersion() {
    // this.restaurantId = (this.storageService.getUserDetail()).id;

    Promise.resolve(this.storageService.getUserDetail()).then((response) => {
      this.restaurantId = response.id;
      this.restaurantEmail = response.email;
    });
    try { this.version = await this.appVersion.getVersionNumber(); } catch (e) { this.version = '1.0.0' }
  }
  ngOnInit() {
  }
  async sendFeedback() {
    let feedback = 'Restaurant ID:'+this.restaurantId+'\n';
    feedback +='Application Version:'+this.version+'\n';
    feedback +='Message:\n';
    feedback +=this.feedback;
    let request = {};
    request['from'] = this.restaurantEmail;
    request['to'] = this.toEmail;
    request['header'] = this.title;
    request['body'] = feedback;
    const response = await this.feedBackService.submitFeedback(request);
    console.log(request,response);

  }
}
