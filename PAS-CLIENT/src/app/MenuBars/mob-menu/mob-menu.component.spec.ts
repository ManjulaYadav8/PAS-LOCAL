import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobMenuComponent } from './mob-menu.component';

describe('MobMenuComponent', () => {
  let component: MobMenuComponent;
  let fixture: ComponentFixture<MobMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
