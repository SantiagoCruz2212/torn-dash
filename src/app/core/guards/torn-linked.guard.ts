import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const tornLinkedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasTornLinked) {
    return true;
  }

  // Redirect to link Torn account page
  router.navigate(['/profile/link-torn']);
  return false;
};
