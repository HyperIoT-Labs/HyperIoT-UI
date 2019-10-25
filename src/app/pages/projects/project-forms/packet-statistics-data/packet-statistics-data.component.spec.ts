import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketStatisticsDataComponent } from './packet-statistics-data.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HpacketsService } from '@hyperiot/core';

describe('PacketStatisticsDataComponent', () => {
  let component: PacketStatisticsDataComponent;
  let fixture: ComponentFixture<PacketStatisticsDataComponent>;
  let hPacketService: HpacketsService

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketStatisticsDataComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: HpacketsService, useValue: hPacketService }
      ]
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
