import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {HytCheckboxComponent} from "components";

describe('HCheckboxComponent', () => {
  let component: HytCheckboxComponent;
  let fixture: ComponentFixture<HytCheckboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HytCheckboxComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
