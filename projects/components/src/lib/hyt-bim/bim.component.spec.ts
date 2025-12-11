import { ComponentFixture, TestBed } from '@angular/core/testing';
import {HytBimComponent} from "components";

describe('BimComponent', () => {
  let component: HytBimComponent;
  let fixture: ComponentFixture<HytBimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HytBimComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HytBimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
