import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';  // Assure-toi que le chemin d'importation est correct

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      return true;  // Si l'utilisateur est authentifié, on lui permet d'accéder à la route
    } else {
      this.router.navigate(['/login']);  // Sinon, on le redirige vers la page de connexion
      return false;  // On empêche l'accès à la route
    }
  }
}
