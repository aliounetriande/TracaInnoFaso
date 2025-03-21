import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup,Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    ReactiveFormsModule,
    IonButton,
  ],
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    // Initialisation du formulaire
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  // Méthode pour soumettre le formulaire
  async onSubmit() {
    if (this.loginForm.invalid) {
      this.showToast('Veuillez remplir tous les champs correctement', 'warning');
      return;
    }

    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/home']); // Redirige après connexion
      },
      error: () => {
        this.showToast('Identifiants incorrects', 'danger');
      },
    });
  }

  // Afficher un message Toast
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    toast.present();
  }

  // Accès aux contrôles de formulaire pour validation dans le template
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
