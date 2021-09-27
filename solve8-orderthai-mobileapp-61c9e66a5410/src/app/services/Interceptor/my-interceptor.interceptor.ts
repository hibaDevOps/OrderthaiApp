import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';


import { MockServer } from '../ApiService/mock-server';
import { environment } from 'src/environments/environment';
import { StorageManager } from '../StorageService/StorageManager';
import { User } from 'src/app/Models/user';
import { AuthenticationServiceService } from '../AuthService/authentication-service.service';
import { Router } from '@angular/router';
import { UtilService } from '../Utils/utils';

@Injectable({
  providedIn: 'root'
})
export class MyInterceptorService implements HttpInterceptor {
  userDetail: User;
  constructor(
    private storageManager: StorageManager,
    private utils: UtilService,
    private authService: AuthenticationServiceService,
    private router: Router
  ) {
  }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.getUserDetail();
    if (!req.headers.has('Content-Type')) {
      req = req.clone({
        setHeaders: {
          'content-type': 'application/json'
        }
      });
    }
    if (this.userDetail && this.userDetail.token.length > 0) {
      if (!req.headers.has('accessToken')) {
        req = req.clone({
          headers: req.headers.set('authorization', 'Bearer '+this.userDetail.token)
        });
      }
    }
    // menipulate header
    req = req.clone({
      headers: req.headers.set('Accept', 'application/json')
    });
    // menipulate url
    // murge req body

    // console.log('url interceptor:' + req.url);
    // console.log(environment.production);

    // req = req.clone({
    //   url: environment.API
    // });
    if (!environment.production) {
      return MockServer.serve(req);
    } else {
      return next.handle(req).pipe(
        map((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // console.log(event.body);

            // if (event.body.timestamp) {
            //   this.timerService.currentTimeInSecond = event.body.timestamp;
            // }
            if (event.body.status === 200 &&
              Object.getOwnPropertyNames(event.body.data).length === 0) {
              // this.presentToast(event.body.message);
            } else {
              if (event.body.success === 400) {
                this.authService.logout();
                this.storageManager.clearData();
                this.router.navigate(['login']);
              }
            }
          }
          return event;
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.authService.logout();
            this.storageManager.clearData();
            this.router.navigate(['login']);
            return throwError(error);
          }
          if (error.status == 400 && error.error.message && error.error.message.length > 0) {
            this.utils.presentToast(error.error.message);
          }
          return throwError(error);
        }));
    }
  }
  createRequest({ request, url }): any {
    return request;
  }
  async getUserDetail(){
    this.userDetail = this.storageManager.getUserDetail();
    // console.log(this.userDetail);    
  }
}