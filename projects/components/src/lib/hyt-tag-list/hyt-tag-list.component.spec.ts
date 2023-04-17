import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytTagListComponent } from './hyt-tag-list.component';

describe('HytTagListComponent', () => {
  let component: HytTagListComponent;
  let fixture: ComponentFixture<HytTagListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytTagListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytTagListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
