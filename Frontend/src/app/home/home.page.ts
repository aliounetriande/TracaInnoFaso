import { Component, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { AuthService } from '../services/auth.service'; 
import { Router } from '@angular/router';

register();

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class HomePage implements AfterViewInit {

  constructor(private authService: AuthService, private router: Router) {}

  swiperConfig = {
    slidesPerView: 1,
    spaceBetween: 0,
    autoplay: {
      delay: 30000, // Défilement automatique toutes les 30 secondes
      disableOnInteraction: false
    },
    pagination: {
      clickable: true
    },
    navigation: true,
    effect: 'fade',
    loop: true
  };

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  ngAfterViewInit() {
    const swiperEl: any = document.querySelector('swiper-container');
    if (swiperEl) {
      Object.assign(swiperEl, this.swiperConfig);
      const swiper = swiperEl.swiper;
      if (swiper) {
        swiper.init();
      }
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // Effacer le token du localStorage
        localStorage.removeItem('token');
  
        // Rediriger vers la page de connexion
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur lors de la déconnexion :', err);
      }
    });
  }
}