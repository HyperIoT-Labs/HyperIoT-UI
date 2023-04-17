import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefibrillatorComponent } from './defibrillator.component';

describe('DefibrillatorComponent', () => {
  let component: DefibrillatorComponent;
  let fixture: ComponentFixture<DefibrillatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefibrillatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefibrillatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
