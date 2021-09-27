import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyNavService {
  myParam: any; // of course replace any with a nice interface of your own
  title: any;
  subTitle:any;
}