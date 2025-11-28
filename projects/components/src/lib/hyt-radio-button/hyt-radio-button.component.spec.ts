import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {HytRadioButtonComponent} from "components";


describe('HRadioButtonComponent', () => {
  let component: HytRadioButtonComponent;
  let fixture: ComponentFixture<HytRadioButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytRadioButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytRadioButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
