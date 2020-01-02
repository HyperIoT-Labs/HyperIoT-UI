import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopologyToolbarComponent } from './topology-toolbar.component';

describe('TopologyToolbarComponent', () => {
  let component: TopologyToolbarComponent;
  let fixture: ComponentFixture<TopologyToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopologyToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopologyToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
