import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HytAccordionGroupComponent } from './hyt-accordion-group.component';

describe('HytAccordionGroupComponent', () => {
  let component: HytAccordionGroupComponent;
  let fixture: ComponentFixture<HytAccordionGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HytAccordionGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HytAccordionGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
