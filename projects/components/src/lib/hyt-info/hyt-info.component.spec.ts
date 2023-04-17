import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HytInfoComponent } from './hyt-info.component';

describe('HytInfoComponent', () => {
  let component: HytInfoComponent;
  let fixture: ComponentFixture<HytInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HytInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
