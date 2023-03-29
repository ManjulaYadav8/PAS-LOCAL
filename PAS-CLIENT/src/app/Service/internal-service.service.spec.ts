import { TestBed } from '@angular/core/testing';

import { InternalServiceService } from './internal-service.service';

describe('InternalServiceService', () => {
  let service: InternalServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternalServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
