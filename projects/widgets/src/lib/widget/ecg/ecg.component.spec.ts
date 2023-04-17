import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { EcgComponent } from './ecg.component';

describe('HpacketTableComponent', () => {
  let component: EcgComponent;
  let fixture: ComponentFixture<EcgComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EcgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
