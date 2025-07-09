import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  private online$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor(private zone: NgZone) {
    window.addEventListener('online', () => this.zone.run(() => this.online$.next(true)));
    window.addEventListener('offline', () => this.zone.run(() => this.online$.next(false)));
  }

  get isOnline$() {
    return this.online$.asObservable();
  }

  get isOnline(): boolean {
    return this.online$.value;
  }
} 