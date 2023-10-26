import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytFilterButtonComponent } from './hyt-filter-button.component';

describe('HytFilterButtonComponent', () => {
  let component: HytFilterButtonComponent;
  let fixture: ComponentFixture<HytFilterButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytFilterButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytFilterButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
