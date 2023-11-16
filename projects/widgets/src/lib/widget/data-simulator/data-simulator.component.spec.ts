import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSimulatorComponent } from './data-simulator.component';

describe('DataSimulatorComponent', () => {
  let component: DataSimulatorComponent;
  let fixture: ComponentFixture<DataSimulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataSimulatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
