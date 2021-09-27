import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderAcceptPage } from './order-accept.page';

describe('OrderAcceptPage', () => {
  let component: OrderAcceptPage;
  let fixture: ComponentFixture<OrderAcceptPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderAcceptPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderAcceptPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
