import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {

  _displayLoading: boolean;
  get displayLoading(): boolean {
    return this._displayLoading;
  }

  @Input('displayLoading')
  set displayLoading(value: boolean) {
    this._displayLoading = value;
  }

  constructor() { }

}
