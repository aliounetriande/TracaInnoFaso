import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import jspdf from 'jspdf';
import { RouterLink } from '@angular/router';
import { IonHeader, IonLabel, IonFooter } from "@ionic/angular/standalone";
import { IonContent, IonTitle, IonToolbar, IonItem, IonButton, IonInput, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { CommonModule, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface SsccOption {
  codeSscc: string;
  typePackage: string;
}

interface gtinContent {
  gtinCode : string;
  typeGtin : string;
}

@Component({
  selector: 'app-creer-data-palette',
  templateUrl: './creer-data-palette.page.html',
  styleUrls: ['./creer-data-palette.page.scss'],
  standalone: true,

  imports: [IonFooter, IonLabel, IonHeader, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, IonItem, IonButton, IonInput, ReactiveFormsModule, RouterLink, IonSelectOption, NgForOf,IonSelect]

})
export class CreerDataPalettePage {
  

  labelForm: FormGroup;
  imageUrl!: string;
  currentPaletteNumber: number = 1;

  
  ssccOptions: SsccOption[] = [
    { codeSscc: '123456789012345678', typePackage: 'SSCC Palette Plumpy Nut' },
    { codeSscc: '987654321098765432', typePackage: 'SSCC Palette Plumpy Sup' },
   
  ];

  gtinContent: gtinContent[] = [
    { gtinCode: '123456789012345678', typeGtin: 'GTIN Carton Plumpy Nut' },
    { gtinCode: '987654321098765432', typeGtin: 'GTIN  Carton Plumpy Sup' },
   
  ];


  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService, private router: Router) {
    /* 
    Cette partie concerne la date d'expiration et de production
    */
    //récupérer la date actuellement
    const today = new Date()
    const productionDate = today.toISOString().substring(0, 10);

    //créer une nouvelle date pour l'expiration (date actuelle + 2 ans )
    const expiryDate = new Date(today);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);
    const formattedExpiryDate = expiryDate.toISOString().substring(0, 10);
     /* 
      Fin de la partie concernant la date d'expiration et de production
     */


      /* 
      Cette partie concerne le calcul pour le Batch
      */

      //calcul du munéro de semain au format ISO
      const weekNumber = this.getWeekNumber(today);
      const weekStr = weekNumber.toString().padStart(2, '0');

      //Mois 
      const month = (today.getMonth() + 1).toString().padStart(2, '0');

      //Année sur deux chiffres
      const year = (today.getFullYear() % 100).toString().padStart(2, '0');

      //concaténation pour la valeur du batch
      const batchVlaue = `${weekStr}${month}${year}`;

      /* 
      Fin de la partie concernant le calcul pour le Batch
      */

      // Charger les valeurs depuis localStorage s'il y en a
    const savedDescription = localStorage.getItem('description') || '';
    const savedOrderNumber = localStorage.getItem('order_number') || '';
    const savedNumberPartCust = localStorage.getItem('number_part_cust') || '';


    

    this.labelForm = this.fb.group({
      sscc: [null, Validators.required],
      content_gtin: [null, Validators.required],
      batch: [batchVlaue, Validators.required],
      description: [savedDescription, Validators.required],
      prod_date: [productionDate, Validators.required],
      expiry_date: [formattedExpiryDate, Validators.required],
      quantity: [{ value: 80, disabled: false }, [Validators.required, Validators.pattern('^[0-9]*$')]],
      order_number: [savedOrderNumber, Validators.required],
      number_part_cust: [savedNumberPartCust, Validators.required],
      totalPalettes: [1, [Validators.required, Validators.min(1)]], 
    });

    
  }

    // fonction pour calculer le numéro de semaine
    private getWeekNumber(date : Date): number {
      const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      let dayNumber = copy.getUTCDay();
      if (dayNumber === 0) dayNumber = 7; // Traitement du dimanche
      copy.setUTCDate(copy.getUTCDate() + 4 - dayNumber);
      // Calcul du nombre de jours écoulés depuis le début de l'année
      const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((copy.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return weekNo;
    }
// fonction pour générer la data matrixe
  generateLabel() {
    if (this.labelForm.valid) {
      const formData = {
        ...this.labelForm.value,
        sscc: this.labelForm.value.sscc.codeSscc, // Extraire uniquement le code SSCC
        content_gtin: this.labelForm.value.content_gtin.gtinCode ,// Extraire uniquement le code GTIN
        totalPalettes: `${this.currentPaletteNumber}/${this.labelForm.value.totalPalettes}` // Ajouter le compteur
      };

      const token = this.authService.getToken(); // Récupérer le token stocké
      console.log("Token envoyé :", token);
      if (!token) {
        console.error("Aucun token trouvé, veuillez vous reconnecter.");
        return;
      }
    
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      this.http.post('http://127.0.0.1:5000/generate-label', formData, { headers: headers, responseType: 'blob' })
        .subscribe(blob => {
          // saveAs(blob, 'Etiquette-palette.png');
          const url = URL.createObjectURL(blob);
          this.imageUrl = url;

           // Incrémenter automatiquement le numéro de la palette
        if (this.currentPaletteNumber < this.labelForm.value.totalPalettes) {
          this.currentPaletteNumber++;
        }
        }, error => {
          console.error('Erreur de génération', error);
        });
    }
  }

  
//fonction pour télécharger la data matrixe
    downloadLabel() {
      if (!this.imageUrl) {
      console.error("Aucune image n'est disponible pour le téléchargement en PDF");
      return;
    }

  
    
    //créé un élément image pour charger l'image
    const img = new Image();
    img.src = this.imageUrl;

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
      doc.save('Etiquette-palette.pdf');
  };
  img.onerror = (error) => {
    console.error('Erreur lors du chargement de l\'image pour le PDF ', error);
    
  }

}

modifyLabel() {
  // On efface l'image pour permettre la modification du formulaire
  this.imageUrl = '';
  this.currentPaletteNumber = this.currentPaletteNumber -1 ;
 
}

logout() {
  this.authService.logout().subscribe({
    next: () => {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      console.error('Erreur lors de la déconnexion :', err);
    }
  });
}

}

