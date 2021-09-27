import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectedPrintersPage } from './selected-printers.page';

const routes: Routes = [
  {
    path: '',
    component: SelectedPrintersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectedPrintersPageRoutingModule {}
