import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MyTimerService {
    currentTimeInSeconds: number = 0;
    timeUpEvent = new Subject<any>();
    constructor() {
        setInterval(() => {
            // console.log('current time');
            this.timeUpEvent.next('');
        }, (1000 * 1* 60 ));
    }
}