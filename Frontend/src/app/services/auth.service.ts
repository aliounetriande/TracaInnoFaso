import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root', // Fournit ce service à toute l'application
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5000/auth'; // URL de l'API pour l'authentification

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Envoie une requête de connexion à l'API avec les identifiants de l'utilisateur.
   * @param credentials - Objet contenant le nom d'utilisateur et le mot de passe.
   * @returns Observable contenant la réponse de l'API (généralement un token).
   */
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  /**
   * Stocke le token d'authentification dans le localStorage.
   * @param token - Le token JWT renvoyé par l'API après connexion.
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Récupère le token stocké dans le localStorage.
   * @returns Le token sous forme de chaîne ou `null` s'il n'existe pas.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Déconnecte l'utilisateur en supprimant son token et en le redirigeant vers la page de connexion.
   */
  logout(): void {
    localStorage.removeItem('token'); // Suppression du token
    this.router.navigate(['/login']); // Redirection vers la page de connexion
  }

  /**
   * Vérifie si l'utilisateur est authentifié en testant la présence d'un token.
   * @returns `true` si un token est présent, sinon `false`.
   */
  isAuthenticated(): boolean {
    return !!this.getToken(); // Convertit en booléen : true si un token existe, false sinon
  }
}
