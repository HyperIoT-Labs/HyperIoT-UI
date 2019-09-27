import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketStatisticsDataComponent } from './packet-statistics-data.component';

describe('PacketStatisticsDataComponent', () => {
  let component: PacketStatisticsDataComponent;
  let fixture: ComponentFixture<PacketStatisticsDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketStatisticsDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketStatisticsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
