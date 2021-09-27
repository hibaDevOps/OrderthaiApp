import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListPrintersPage } from './list-printers.page';

const routes: Routes = [
  {
    path: '',
    component: ListPrintersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListPrintersPageRoutingModule {}
