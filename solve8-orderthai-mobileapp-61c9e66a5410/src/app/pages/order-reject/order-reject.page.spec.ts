import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OrderRejectPage } from './order-reject.page';

describe('OrderRejectPage', () => {
  let component: OrderRejectPage;
  let fixture: ComponentFixture<OrderRejectPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderRejectPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderRejectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
