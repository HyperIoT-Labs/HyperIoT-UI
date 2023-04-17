import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorTableComponent } from './error-table.component';

describe('ErrorTableComponent', () => {
  let component: ErrorTableComponent;
  let fixture: ComponentFixture<ErrorTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
