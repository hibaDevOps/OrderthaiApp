import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PrintersPage } from './printers.page';

describe('PrintersPage', () => {
  let component: PrintersPage;
  let fixture: ComponentFixture<PrintersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
