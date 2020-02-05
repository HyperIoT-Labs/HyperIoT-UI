import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketTableSettingsComponent } from './packet-table-settings.component';

describe('PacketTableSettingsComponent', () => {
  let component: PacketTableSettingsComponent;
  let fixture: ComponentFixture<PacketTableSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketTableSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketTableSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
