import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import jspdf from 'jspdf';
import { saveAs } from 'file-saver';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonButton, IonInput, IonLabel 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-creer-data-sachet',
  templateUrl: './creer-data-sachet.page.html',
  styleUrls: ['./creer-data-sachet.page.scss'],
  standalone: true,
  imports: [
    IonLabel, IonItem, IonButton, IonContent, 
    IonHeader, IonTitle, IonToolbar, CommonModule, 
    FormsModule, IonInput, HttpClientModule
  ]
})
export class CreerDataSachetPage {
  sachet = { 
    gtin: '', 
    batch: '', 
    expiry_date: ''
  };

  imageUrl: string | null = null;

  constructor(private http: HttpClient) {}

  generateDataMatrix(): void {
    if (!this.sachet.gtin || !this.sachet.batch || !this.sachet.expiry_date) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    this.http.post('http://127.0.0.1:5000/generate-datamatrix-sachet', this.sachet, { responseType: 'blob' })
      .subscribe(blob => {
        this.imageUrl = URL.createObjectURL(blob);
      }, error => {
        console.error("Erreur de génération de la datamatrix", error);
      });
  }

  downloadImage(): void {
    if (!this.imageUrl) {
      console.error("Aucune image n'est disponible pour le téléchargement en PDF");
      return;
    }

    const img = new Image();
    img.src = this.imageUrl;

    img.onload = () => {
      const doc = new jspdf({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });

      doc.addImage(img, 'PNG', 0, 0, img.width, img.height);
      doc.save('Etiquette-sachet.pdf');
    };

    img.onerror = (error) => {
      console.error("Erreur lors du chargement de l'image pour le PDF", error);
    };
  }
}
