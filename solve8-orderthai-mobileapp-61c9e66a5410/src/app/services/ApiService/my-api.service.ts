import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { LoaderService } from '../loader-service/loader.service';
import { environment } from 'src/environments/environment';
import { UtilService } from '../Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class MyApiService {

  isOnline: boolean;
  readonly HOST = environment.API;
  constructor(protected http: HttpClient,
    private utils: UtilService,
    private loadingService: LoaderService) {
    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  public async post<T>(path: string, request: any, noLoader?: boolean): Promise<T> {
    if (!noLoader) { await this.loadingService.show(); }
    let message = 'Something went wrong';
    return this.http.post<T | any>(environment.API + path, request).toPromise().then(data => {
      if (data.statusCode != 200) {
        if (path != 'login') {
          this.utils.presentToast(data.message);
        }
        this.loadingService.hide();
        message = data.error;
        throw new Error(data.error);
      }
      if (path.includes('feedback')) {
        this.utils.presentToast(data.message);
      }
      if (path.includes('update')) {
        return (data.android);
      } else {
        return (data.data);
      }
    }).then(async result => {
      if (!noLoader) { await this.loadingService.hide(); }
      return result;
    }).catch(async err => {
      console.log('err in service', err.message);
      await this.loadingService.hide();
      if (navigator.onLine) {
        // this.presentToast(message);
      } else {
        this.utils.presentToast('No internet connection available');
      }
      throw err;
    });
  }

  public async get<T>(path: string): Promise<T> {
    await this.loadingService.show();
    let message = 'Something went wrong';
    return this.http.get<T | any>(environment.API + path).toPromise().then(data => {
      return data;
    }).then(async result => {
      await this.loadingService.hide();
      return result;
    }).catch(async err => {
      console.log('err in service', err.message);
      await this.loadingService.hide();
      if (navigator.onLine) {
        // this.presentToast(message);
      } else {
        this.utils.presentToast('No internet connection available');
      }
      throw err;
    });
  }

  public async put<T>(path: string, request: any): Promise<T> {
    if (!path.includes('time')) {
      await this.loadingService.show();
    }
    let message = 'Something went wrong';
    return this.http.put<T | any>(environment.API + path, request).toPromise().then(data => {
      return data;
    }).then(async result => {
      if (!path.includes('time')) {
        await this.loadingService.hide();
      }
      return result;
    }).catch(async err => {
      console.log('err in service', err.message);
      await this.loadingService.hide();
      if (navigator.onLine) {
        // this.presentToast(message);
      } else {
        this.utils.presentToast('No internet connection available');
      }
      throw err;
    });
  }
  //authentication
  login(req): Promise<any> {
    return this.post<any>('login', req);
  }
  getUserDetails() {
    return this.post<any>('getUser', null);
  }
  pauseOrders(restaurant_id,pause){
    
      return this.post('pauseOrders', {id: restaurant_id, status: pause});
  
  }
  pauseDeliveryOrders(restaurant_id,pause){
    return this.post('pauseDeliveryOrders', {id: restaurant_id, status: pause});
  }
  pauseTableReservationOrders(restaurant_id,pause){
    return this.post('pauseTableReservationOrders', {id: restaurant_id, status: pause});
  }



}