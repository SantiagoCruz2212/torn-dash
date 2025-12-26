import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BackendApiService } from './backend-api.service';
import {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  LinkTornRequest,
  LinkTornResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private backendApi: BackendApiService) {
    // Check if user is authenticated on service initialization
    this.checkAuth();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get hasTornLinked(): boolean {
    const user = this.currentUserValue;
    return user !== null && user.tornPlayerId !== null;
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.backendApi.post<AuthResponse>('/auth/register', data).pipe(
      tap((response) => {
        this.setAuthData(response);
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.backendApi.post<AuthResponse>('/auth/login', data).pipe(
      tap((response) => {
        this.setAuthData(response);
      })
    );
  }

  logout(): Observable<any> {
    return this.backendApi.post('/auth/logout', {}).pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  checkAuth(): void {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.clearAuthData();
      return;
    }

    this.backendApi.get<{ user: User }>('/auth/me').subscribe({
      next: (response) => {
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      },
      error: () => {
        this.clearAuthData();
      }
    });
  }

  linkTornAccount(apiKey: string): Observable<LinkTornResponse> {
    const data: LinkTornRequest = { apiKey };
    return this.backendApi.post<LinkTornResponse>('/auth/link-torn', data).pipe(
      tap((response) => {
        this.currentUserSubject.next(response.user);
      })
    );
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}
