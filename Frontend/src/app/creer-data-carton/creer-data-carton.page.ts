import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
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

  produit = { 
    gtin: '', 
    content_gtin: '', 
    batch: '', 
    expiry_date: '', 
    quantity: 150 
  };

   labelUrl: string | null = null;

  constructor(private http: HttpClient) {}

  generateLabel(): void {
    if (!this.produit.gtin || !this.produit.content_gtin || !this.produit.batch || !this.produit.expiry_date) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    this.http.post('http://127.0.0.1:4200/generate-label', this.produit, { responseType: 'blob' })
      .subscribe(blob => {
        this.labelUrl = URL.createObjectURL(blob);
      }, error => {
        console.error("Erreur de génération de l'étiquette", error);
      });
  }

  downloadLabel(): void {
    if (this.labelUrl) {
      saveAs(this.labelUrl, "etiquette.pdf");
    }
  }

}
