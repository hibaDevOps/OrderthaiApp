import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MyApiService } from '../ApiService/my-api.service';

@Injectable({
    providedIn: 'root'
})
export class StorageManager {
    private static USER_KEY = 'userDetails';
    public static FCM_TOKEN = 'fcm_token';
    public static ACADEMIC_YEAR = 'academic_year';
    private static IS_LOGIN = 'isLogin';
    private static BT: string = 'bluetooth';
    academicYearEvent = new Subject<any>();


    userChangeEvent = new Subject<any>();
    loginChangeEvent = new Subject<any>();
    constructor(private storage: Storage) {
    }
    setUserDetail(user): Promise<any> {
        localStorage.setItem(StorageManager.USER_KEY, JSON.stringify(user));
        return this.storage.set(StorageManager.USER_KEY, user).then(() => {
            this.userChangeEvent.next(user);
        });
    }
    getUserDetail(): any {
        return JSON.parse(localStorage.getItem(StorageManager.USER_KEY));
    }
    setLoginStatus(status): Promise<any> {
        return this.storage.set(StorageManager.IS_LOGIN, status).then(() => {
            this.loginChangeEvent.next(status);
        });
    }
    getLoginStatus(): Promise<any> {
        return this.storage.get(StorageManager.IS_LOGIN);
    }
    getAccessToken(): Promise<string> {
        return this.storage.get(StorageManager.USER_KEY).then(userDetail => {
            userDetail = JSON.parse(userDetail);
            if (userDetail) {
                return userDetail.accessToken;
            } else {
                return null;
            }
        });
    }
 
    clearData() {
        this.storage.remove(StorageManager.USER_KEY);
        localStorage.removeItem(StorageManager.USER_KEY);
        localStorage.removeItem("isRemember");

    }
    updateFCMtoken(token) {
        localStorage.setItem(StorageManager.FCM_TOKEN, token);
    }
    setAcademicYear(academicYear) {
        this.storage.set(StorageManager.ACADEMIC_YEAR, academicYear).then(() => {
            this.academicYearEvent.next(academicYear);
        });
    }
    getAcademicYear() {
        return this.storage.get(StorageManager.ACADEMIC_YEAR);
    }
    setBT(bt: any) {
        this.storage.set(StorageManager.BT, bt);
        return bt;
    }
    getBT() {
        return this.storage.get(StorageManager.BT);
    }
}
