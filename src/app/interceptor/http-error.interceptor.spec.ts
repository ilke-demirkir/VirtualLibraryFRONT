import { TestBed } from '@angular/core/testing';
import { HttpErrorInterceptor } from './http-error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

describe('HttpErrorInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpErrorInterceptor,
          multi: true
        }
      ]
    });
  });

  it('should be created', () => {
    const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
    expect(interceptors).toBeTruthy();
  });
});
