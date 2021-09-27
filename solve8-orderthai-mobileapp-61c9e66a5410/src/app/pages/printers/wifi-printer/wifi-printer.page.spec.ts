import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WifiPrinterPage } from './wifi-printer.page';

describe('WifiPrinterPage', () => {
  let component: WifiPrinterPage;
  let fixture: ComponentFixture<WifiPrinterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WifiPrinterPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WifiPrinterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
