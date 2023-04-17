import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDebugComponent } from './dashboard-debug.component';

describe('DashboardDebugComponent', () => {
  let component: DashboardDebugComponent;
  let fixture: ComponentFixture<DashboardDebugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardDebugComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
