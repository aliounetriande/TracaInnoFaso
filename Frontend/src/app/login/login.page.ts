import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  NavController
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
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton
  ]
})
export class LoginPage {
  username: string = '';
  password: string = '';
  usernameError = false;
  passwordError = false;

  constructor(private navCtrl: NavController) {}

  onSubmit() {
    this.usernameError = this.username.trim() === '';
    this.passwordError = this.password.trim() === '';

    if (!this.usernameError && !this.passwordError) {
      console.log('Tentative de connexion avec:', this.username);
      // Navigation vers home
      setTimeout(() => {
        this.navCtrl.navigateForward('/home');
      }, 1000);
    }
  }
}
