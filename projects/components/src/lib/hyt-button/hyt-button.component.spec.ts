import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {HytButtonComponent} from "components";

describe('HBottonComponent', () => {
  let component: HytButtonComponent;
  let fixture: ComponentFixture<HytButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HytButtonComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
