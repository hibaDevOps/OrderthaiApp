import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MenuController, NavController } from '@ionic/angular';
import { AuthGuard } from 'src/app/services/AuthService/auth-guard.guard';
import { AuthenticationServiceService } from 'src/app/services/AuthService/authentication-service.service';
import { StorageManager } from 'src/app/services/StorageService/StorageManager';
import { UtilService } from 'src/app/services/Utils/utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  emailPatter: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  passwordLength: number = 6;
  loginForm: FormGroup;
  isRemember:boolean;
  constructor(
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private utils: UtilService,
    private storageService:StorageManager,
    private authGuard:AuthGuard,
    private authService: AuthenticationServiceService
  ) {
    if (authGuard.canActivate() ) {
      this.menuCtrl.enable(true);
      this.menuCtrl.swipeGesture(true);
      navCtrl.navigateRoot(['home']);
  } else {
      this.menuCtrl.enable(false);
      this.menuCtrl.swipeGesture(false);
  }
    this.initComponent();
  }
  initComponent() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.pattern(this.emailPatter)]),
      password: new FormControl('', [Validators.required, Validators.minLength(this.passwordLength)])
    });
  }

 async ngOnInit() {
 }
  RememberMe(event:any){
    if(event.detail.checked == true){
     this.isRemember=true;
    }else{
      localStorage.setItem("isRemember","false");
      this.isRemember=false;
    }

  }
  async login(form: FormGroup) {
    if (form.valid) {
      const response = await this.authService.login(form.value['email'].replace(/\s/g, ''), form.value['password']);
      if (response.success) {
        this.utils.presentToast('Login successfully');
        await this.storageService.setLoginStatus(JSON.stringify(response));
        this.menuCtrl.enable(true);
        this.menuCtrl.swipeGesture(true);
        if(this.isRemember){
        localStorage.setItem("isRemember","true");
        }else{
          localStorage.setItem("isRemember","false");
        }
        this.navCtrl.navigateRoot('my-orders');
      } else {
        this.utils.presentToast(response.message);
      }
    } else {
      localStorage.setItem("isRemember","false");
      if (form.value['email'].length === 0) {
        this.utils.presentToast('Please enter email address');
        return;
      } else if (form.value['email'].length < 6 || !form.value['email'].match(this.emailPatter)) {
        this.utils.presentToast('Please enter valid email address');
        return;
      }
      if (form.value['password'].length === 0) {
        this.utils.presentToast('Please enter password');
        return;
      } else if (form.value['password'].length < this.passwordLength) {
        this.utils.presentToast('Your password must be at least ' + this.passwordLength + ' characters')
        return;
      }
    }
  }
}
