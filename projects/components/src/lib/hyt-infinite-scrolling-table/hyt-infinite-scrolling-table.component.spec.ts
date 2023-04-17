import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HytInfiniteScrollingTableComponent } from './hyt-infinite-scrolling-table.component';

describe('HytInfiniteScrollingTableComponent', () => {
  let component: HytInfiniteScrollingTableComponent;
  let fixture: ComponentFixture<HytInfiniteScrollingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HytInfiniteScrollingTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HytInfiniteScrollingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
