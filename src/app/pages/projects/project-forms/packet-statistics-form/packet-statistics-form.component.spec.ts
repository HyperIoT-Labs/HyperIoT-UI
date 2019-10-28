import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketStatisticsFormComponent } from './packet-statistics-form.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HpacketsService } from '@hyperiot/core';

describe('PacketStatisticsFormComponent', () => {
  let component: PacketStatisticsFormComponent;
  let fixture: ComponentFixture<PacketStatisticsFormComponent>;
  let hPacketService: HpacketsService

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketStatisticsFormComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: HpacketsService, useValue: hPacketService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketStatisticsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
