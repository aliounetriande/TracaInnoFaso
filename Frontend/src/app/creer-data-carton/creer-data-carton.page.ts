import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,Validators  } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import jspdf from 'jspdf';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonSelect, IonSelectOption, IonInput } from '@ionic/angular/standalone';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { saveAs } from 'file-saver';

interface GtinOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-creer-data-carton',
  templateUrl: './creer-data-carton.page.html',
  styleUrls: ['./creer-data-carton.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HttpClientModule, RouterLink, IonSelect, IonSelectOption, ReactiveFormsModule, IonInput]
})

export class CreerDataCartonPage {

  cartonForm: FormGroup;
  labelUrl: string | null = null;

  gtinOptions: GtinOption[] = [
    { label: 'GTIN Sachet plumpy nut', value: '6188000059007' },
    { label: 'GTIN Carton plumpy nut', value: '6188000059008' }
  ];



  // carton = { 
  //   gtin: '', 
  //   content_gtin: '', 
  //   batch: '', 
  //   expiry_date: '', 
  //   quantity: 150 
  // };


  constructor(private http: HttpClient, private fb: FormBuilder, private authService: AuthService, private router: Router) {
    const currentYear = new Date().getFullYear().toString().slice(-2); // Récupère "25" pour 2025
    this.cartonForm = this.fb.group({
          gtin: ['', Validators.required],
          content_gtin: ['', Validators.required],
          batch: [this.generateBatch(), [Validators.required, Validators.pattern(/^\d{6}$/)]], 
          expiry_date: [this.generateExpiryDate(), [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
          quantity: ['150', Validators.required],
          serial_number: [`${currentYear}000003`, [Validators.required, Validators.pattern(/^\d{8}$/)]],
          
        }); 
  }

  ngOnInit() {
    this.cartonForm.patchValue({ 
      batch: this.generateBatch(),
      expiry_date: this.generateExpiryDate()
    });
  }
  

  private generateBatch(): string {
    const now = new Date();
    const year = now.getFullYear() % 100; // Obtenir les deux derniers chiffres de l'année (ex: 25 pour 2025)
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Mois avec zéro initial si < 10
    const week = this.getWeekNumber(now).toString().padStart(2, '0'); // Numéro de la semaine avec zéro initial
  
    return `${week}${month}${year}`;
  }
  
  // Fonction pour obtenir le numéro de la semaine de l'année
  private getWeekNumber(date: Date): number {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const millisBetween = date.getTime() - oneJan.getTime();
    const daysBetween = millisBetween / (1000 * 60 * 60 * 24);
    
    return Math.ceil((daysBetween + oneJan.getDay() + 1) / 7);
  }


  private generateExpiryDate(): string {
    const now = new Date();
    const expiryYear = (now.getFullYear() + 2) % 100; // Année +2 (ex: 2027 -> 27)
    const expiryMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // Mois avec zéro initial
  
    return `${expiryMonth}/${expiryYear}`;
  }
  
  
  
  generateLabel(): void {
    if (!this.cartonForm.valid) {

      alert("Veuillez remplir tous les champs !");
      return;
    }

    this.http.post('http://127.0.0.1:5000/generate-label-carton', this.cartonForm.value, { responseType: 'blob' })

      .subscribe(blob => {
        this.labelUrl = URL.createObjectURL(blob);

         // Incrémenter le numéro de carton
      let currentCartonNumber = this.cartonForm.get('serial_number')?.value;
      let num = parseInt(currentCartonNumber.slice(2), 10) + 1; // Récupère les 6 derniers chiffres et incrémente
      let newCartonNumber = currentCartonNumber.slice(0, 2) + num.toString().padStart(6, '0'); // Reformate en 8 chiffres

      this.cartonForm.patchValue({ serial_number: newCartonNumber });

      }, error => {
        console.error("Erreur de génération de l'étiquette", error);
      });


  }

  downloadLabel(): void {
    // if (this.labelUrl) {
    //   saveAs(this.labelUrl, "etiquette.png");
    // }
    if (!this.labelUrl) {
      console.error("Aucune image n'est disponible pour le téléchargement en PDF");
      return;
    }
    
    //créé un élément image pour charger l'image
    const img = new Image();
    img.src = this.labelUrl;

   //créer le document PDF 
    img.onload = () => {

      const doc = new jspdf({
        orientation: img.width >img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });

      //Ajouter l'image dans le PDF
      doc.addImage(img, 'PNG', 0, 0, img.width, img.height);

      //sauvegarder le pdf
      doc.save('Etiquette-carton.pdf');
  };
  img.onerror = (error) => {
    console.error('Erreur lors du chargement de l\'image pour le PDF ', error);
    
  }

  }

  logout() {
    this.authService.logout(); // Appel de la méthode logout du service
    this.router.navigate(['/login']); // Redirection vers la page de connexion
  }

}
