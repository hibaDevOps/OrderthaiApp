import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectedPrintersPage } from './selected-printers.page';

describe('SelectedPrintersPage', () => {
  let component: SelectedPrintersPage;
  let fixture: ComponentFixture<SelectedPrintersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedPrintersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedPrintersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
