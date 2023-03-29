import { TestBed } from '@angular/core/testing';

import { PasServiceService } from './pas-service.service';

describe('PasServiceService', () => {
  let service: PasServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
