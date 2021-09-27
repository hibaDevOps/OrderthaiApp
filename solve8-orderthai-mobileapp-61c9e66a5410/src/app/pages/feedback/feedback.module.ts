import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeedbackPageRoutingModule } from './feedback-routing.module';

import { FeedbackPage } from './feedback.page';
import { FeedbackService } from 'src/app/services/ApiService/feedback.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeedbackPageRoutingModule,
  ],
  declarations: [FeedbackPage],
  providers: [FeedbackService]
})
export class FeedbackPageModule { }
