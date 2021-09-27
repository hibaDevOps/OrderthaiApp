import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MyApiService } from '../ApiService/my-api.service';
import { StorageManager } from 'src/app/services/StorageService/StorageManager';
import { User } from 'src/app/Models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceService {
  public static CURRENT_USER = 'currentUser';
  user: User;
  deviceId: string;
  constructor(public http: HttpClient,
    public api: MyApiService,
    private storageService: StorageManager) {
    this.getUserData();
  }
  async getUserData() {
    this.user = this.storageService.getUserDetail();
  }
  currentUserValue(): any {
    return this.storageService.getUserDetail();
  }
  async login(username: string, password: string) {
    try {
      const user: User = await this.api.login({ username, password });
      if (user.token) {
        user['email'] = username;
        await this.storageService.setUserDetail(user);
        this.user = user;
        return Promise.resolve({ success: true, message: '' });
      } else {
        return Promise.resolve({ success: false, message: 'The email or password is incorrect or may inactive' });
      }
    } catch (err) {
      return Promise.reject({ success: false, message: err.error.message });
    }
  }

  logout() {
    this.storageService.clearData();
    this.user = null;

  }
}
