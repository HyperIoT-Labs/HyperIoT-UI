import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {HytCardComponent} from "components";

describe('HCardComponent', () => {
  let component: HytCardComponent;
  let fixture: ComponentFixture<HytCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
