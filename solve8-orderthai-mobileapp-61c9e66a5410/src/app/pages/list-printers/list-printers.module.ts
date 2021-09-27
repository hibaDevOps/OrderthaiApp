import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPrintersPageRoutingModule } from './list-printers-routing.module';

import { ListPrintersPage } from './list-printers.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListPrintersPageRoutingModule
  ],
  declarations: [ListPrintersPage]
})
export class ListPrintersPageModule {}
