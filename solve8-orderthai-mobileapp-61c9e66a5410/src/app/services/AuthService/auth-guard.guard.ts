import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import { AuthenticationServiceService } from './authentication-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  currentUser: any;
  constructor(private router: Router,
    private authService: AuthenticationServiceService) { }
  canActivate(): boolean {
    // this.authService.currentUser.subscribe(data => {
    //   this.currentUser = data;
    // });
    if (this.authService.currentUserValue()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
