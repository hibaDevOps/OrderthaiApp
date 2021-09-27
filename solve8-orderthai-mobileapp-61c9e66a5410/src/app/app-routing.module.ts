import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/AuthService/auth-guard.guard';

const routes: Routes = [
  {path:'home',redirectTo:'my-orders',pathMatch:'full'},
  { path: 'my-orders', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule), canActivate: [AuthGuard] },
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  { path: 'forgot-password', loadChildren: () => import('./pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule) },
  { path: 'terms-and-conditions', loadChildren: () => import('./pages/terms/terms.module').then(m => m.TermsPageModule), canActivate: [AuthGuard] },
  { path: 'feedback', loadChildren: () => import('./pages/feedback/feedback.module').then(m => m.FeedbackPageModule), canActivate: [AuthGuard] },
  { path: 'about-us', loadChildren: () => import('./pages/about-us/about-us.module').then(m => m.AboutUsPageModule), canActivate: [AuthGuard] },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule), canActivate: [AuthGuard] },
  { path: 'thermal-printer', loadChildren: () => import('./pages/printers/printers.module').then(m => m.PrintersPageModule), canActivate: [AuthGuard] },
  { path: 'order-detail', loadChildren: () => import('./pages/order-detail/order-detail.module').then(m => m.OrderDetailPageModule), canActivate: [AuthGuard] },
  { path: 'order-accept', loadChildren: () => import('./pages/order-accept/order-accept.module').then(m => m.OrderAcceptPageModule), canActivate: [AuthGuard] },
  { path: 'order-reject', loadChildren: () => import('./pages/order-reject/order-reject.module').then(m => m.OrderRejectPageModule), canActivate: [AuthGuard] },
  {
    path: 'reports',
    loadChildren: () => import('./pages/reports/reports.module').then( m => m.ReportsPageModule)
  },
  {
    path: 'orders-paused',
    loadChildren: () => import('./pages/orders-paused/orders-paused.module').then( m => m.OrdersPausedPageModule)
  },
  {
    path: 'bluetooth',
    loadChildren: () => import('./pages/bluetooth-printer/bluetooth-printer.module').then( m => m.BluetoothPrinterPageModule)
  },
  {
    path: 'selected-printers',
    loadChildren: () => import('./pages/selected-printers/selected-printers.module').then( m => m.SelectedPrintersPageModule)
  },
  {
    path: 'list-printers',
    loadChildren: () => import('./pages/list-printers/list-printers.module').then( m => m.ListPrintersPageModule)
  }

  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
