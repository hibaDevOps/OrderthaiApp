import { Injectable } from '@angular/core';
import { MyApiService } from './my-api.service';

@Injectable({
    providedIn: 'root'
})
export class FeedbackService extends MyApiService {

    submitFeedback(request):Promise<any> {
        return this.post('feedback', request);
    }
}