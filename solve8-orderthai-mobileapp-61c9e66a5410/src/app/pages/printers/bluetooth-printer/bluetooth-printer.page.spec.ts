import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BluetoothPrinterPage } from './bluetooth-printer.page';

describe('BluetoothPrinterPage', () => {
  let component: BluetoothPrinterPage;
  let fixture: ComponentFixture<BluetoothPrinterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BluetoothPrinterPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BluetoothPrinterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
