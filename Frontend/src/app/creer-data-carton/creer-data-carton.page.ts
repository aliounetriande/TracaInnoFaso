import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import jspdf from 'jspdf';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonInput } from '@ionic/angular/standalone';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-creer-data-carton',
  templateUrl: './creer-data-carton.page.html',
  styleUrls: ['./creer-data-carton.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HttpClientModule, IonInput]
})
export class CreerDataCartonPage {

  carton = { 
    gtin: '', 
    content_gtin: '', 
    batch: '', 
    expiry_date: '', 
    quantity: 150 
  };

   labelUrl: string | null = null;

  constructor(private http: HttpClient) {}

  generateLabel(): void {
    if (!this.carton.gtin || !this.carton.content_gtin || !this.carton.batch || !this.carton.expiry_date) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    this.http.post('http://127.0.0.1:5000/generate-label-carton', this.carton, { responseType: 'blob' })
      .subscribe(blob => {
        this.labelUrl = URL.createObjectURL(blob);
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

}
