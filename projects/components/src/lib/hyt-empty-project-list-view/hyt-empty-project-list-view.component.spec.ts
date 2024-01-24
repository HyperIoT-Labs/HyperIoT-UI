import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HytEmptyProjectListViewComponent } from './hyt-empty-project-list-view.component';

describe('HytEmptyProjectListViewComponent', () => {
  let component: HytEmptyProjectListViewComponent;
  let fixture: ComponentFixture<HytEmptyProjectListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HytEmptyProjectListViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HytEmptyProjectListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
