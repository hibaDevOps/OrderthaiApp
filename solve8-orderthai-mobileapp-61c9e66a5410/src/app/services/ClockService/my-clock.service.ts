import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MyClockService {
    currentTimeInSeconds: number = 0;
    constructor() {
        setInterval(() => {
            this.currentTimeInSeconds++;
        }, 1000);
    }
}