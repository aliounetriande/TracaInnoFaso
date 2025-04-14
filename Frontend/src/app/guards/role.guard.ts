import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  UrlTree
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRoles: string[] = route.data['roles'];
    const userRole = localStorage.getItem('role');

    if (userRole && expectedRoles.includes(userRole)) {
      return true;
    }

    // Redirection si rôle non autorisé
    return this.router.parseUrl('/unauthorized');
  }
}
