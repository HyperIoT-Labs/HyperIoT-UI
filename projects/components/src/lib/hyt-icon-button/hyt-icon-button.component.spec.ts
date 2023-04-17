import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HytIconButtonComponent } from './hyt-icon-button.component';

describe('HytIconButtonComponent', () => {
  let component: HytIconButtonComponent;
  let fixture: ComponentFixture<HytIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HytIconButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HytIconButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
