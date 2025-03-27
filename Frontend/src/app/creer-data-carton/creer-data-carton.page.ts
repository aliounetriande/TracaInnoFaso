import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,Validators  } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import jspdf from 'jspdf';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonSelect, IonSelectOption, IonInput, IonFooter } from '@ionic/angular/standalone';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { saveAs } from 'file-saver';

// Interfaces pour les options GTIN
interface GtinOptionCarton {
  label: string;
  value: string;
}

interface GtinOptionSachet {
  label: string;
  value: string;
}

@Component({
  selector: 'app-creer-data-carton',
  templateUrl: './creer-data-carton.page.html',
  styleUrls: ['./creer-data-carton.page.scss'],
  standalone: true,
  imports: [IonFooter, IonButton, IonLabel, IonItem, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, HttpClientModule, RouterLink, IonSelect, IonSelectOption, ReactiveFormsModule, IonInput]
})

export class CreerDataCartonPage {

  cartonForm: FormGroup; // Formulaire réactif pour capturer les données du carton
  labelUrl: string | null = null; // Stocke l'URL de l'étiquette générée

  // Liste des options GTIN pour les cartons
  gtinOptionsCarton: GtinOptionCarton[] = [
    { label: 'GTIN Carton plumpy Nut', value: '6188000059007' },
    { label: 'GTIN Carton plumpy Sup', value: '6188000059008' }
  ];

  // Liste des options GTIN pour les sachets
  gtinOptionsSachet: GtinOptionSachet[] = [
    { label: 'GTIN Sachet plumpy Nut', value: '6188000059007' },
    { label: 'GTIN Sachet plumpy Sup', value: '6188000059008' }
  ];

  constructor(private http: HttpClient, private fb: FormBuilder, private authService: AuthService, private router: Router) {
    const currentYear = new Date().getFullYear().toString().slice(-2); // Récupère les 2 derniers chiffres de l'année actuelle
    this.cartonForm = this.fb.group({
      gtin: ['', Validators.required],
      content_gtin: ['', Validators.required],
      batch: [this.generateBatch(), [Validators.required, Validators.pattern(/^\d{6}$/)]], // Génère un numéro de lot au format "SSMMYY"
      expiry_date: [this.generateExpiryDate(), [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]], // Génère la date d'expiration
      quantity: ['150', Validators.required],
      serial_number: [`${currentYear}000003`, [Validators.required, Validators.pattern(/^\d{8}$/)]], // Numéro de série initialisé avec l'année et un compteur
    }); 
  }

  ngOnInit() {
    // Met à jour les valeurs de batch et expiry_date lors de l'initialisation
    this.cartonForm.patchValue({ 
      batch: this.generateBatch(),
      expiry_date: this.generateExpiryDate()
    });
  }

  // Génère un numéro de lot basé sur la semaine, le mois et l'année
  private generateBatch(): string {
    const now = new Date();
    const year = now.getFullYear() % 100; // Derniers 2 chiffres de l'année
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Mois formaté sur 2 chiffres
    const week = this.getWeekNumber(now).toString().padStart(2, '0'); // Numéro de la semaine
    return `${week}${month}${year}`;
  }

  // Retourne le numéro de la semaine pour une date donnée
  private getWeekNumber(date: Date): number {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const millisBetween = date.getTime() - oneJan.getTime();
    const daysBetween = millisBetween / (1000 * 60 * 60 * 24);
    return Math.ceil((daysBetween + oneJan.getDay() + 1) / 7);
  }

  // Génère une date d'expiration 2 ans après la date actuelle
  private generateExpiryDate(): string {
    const now = new Date();
    const expiryYear = (now.getFullYear() + 2) % 100; // Ajoute 2 ans
    const expiryMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // Mois formaté
    return `${expiryMonth}/${expiryYear}`;
  }

  // Envoie les données du formulaire pour générer une étiquette
  generateLabel(): void {
    if (!this.cartonForm.valid) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    const token = this.authService.getToken(); // Récupérer le token utilisateur
    console.log("Token envoyé :", token);
    if (!token) {
      console.error("Aucun token trouvé, veuillez vous reconnecter.");
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    console.log("Données envoyées : ", this.cartonForm.value);

    this.http.post('http://127.0.0.1:5000/generate-label-carton', this.cartonForm.value, { headers: headers, responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          this.labelUrl = URL.createObjectURL(blob);
          console.log("Étiquette générée avec succès !");

          // Incrémente le numéro de série du carton
          let currentCartonNumber = this.cartonForm.get('serial_number')?.value;
          let num = parseInt(currentCartonNumber.slice(2), 10) + 1;
          let newCartonNumber = currentCartonNumber.slice(0, 2) + num.toString().padStart(6, '0');
          this.cartonForm.patchValue({ serial_number: newCartonNumber });
        },
        error: async (error) => {
          console.error("Erreur de génération de l'étiquette", error);
        }
      });
  }

  // Télécharge l'étiquette en format PDF
  downloadLabel(): void {
    if (!this.labelUrl) {
      console.error("Aucune image n'est disponible pour le téléchargement en PDF");
      return;
    }

    const img = new Image();
    img.src = this.labelUrl;

    img.onload = () => {
      const doc = new jspdf({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });
      doc.addImage(img, 'PNG', 0, 0, img.width, img.height);
      doc.save('Etiquette-carton.pdf');
    };
  }

  // Déconnexion de l'utilisateur
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
