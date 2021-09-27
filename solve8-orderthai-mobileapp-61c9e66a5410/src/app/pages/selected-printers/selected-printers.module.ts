import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectedPrintersPageRoutingModule } from './selected-printers-routing.module';

import { SelectedPrintersPage } from './selected-printers.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectedPrintersPageRoutingModule
  ],
  declarations: [SelectedPrintersPage]
})
export class SelectedPrintersPageModule {}
