import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesMenuComponent } from './des-menu.component';

describe('DesMenuComponent', () => {
  let component: DesMenuComponent;
  let fixture: ComponentFixture<DesMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DesMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
