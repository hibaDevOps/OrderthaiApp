import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ListPrintersPage } from './list-printers.page';

describe('ListPrintersPage', () => {
  let component: ListPrintersPage;
  let fixture: ComponentFixture<ListPrintersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListPrintersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListPrintersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
