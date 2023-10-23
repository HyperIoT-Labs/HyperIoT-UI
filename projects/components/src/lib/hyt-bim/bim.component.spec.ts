import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BimComponent } from './bim.component';

describe('BimComponent', () => {
  let component: BimComponent;
  let fixture: ComponentFixture<BimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BimComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
