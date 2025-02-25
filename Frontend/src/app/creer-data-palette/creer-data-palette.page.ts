import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import jspdf from 'jspdf';
import { RouterLink } from '@angular/router';
import { IonHeader, IonLabel } from "@ionic/angular/standalone";
import { IonContent, IonTitle, IonToolbar, IonItem, IonButton, IonInput } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-creer-data-palette',
  templateUrl: './creer-data-palette.page.html',
  styleUrls: ['./creer-data-palette.page.scss'],
  standalone: true,

  imports: [IonLabel, IonHeader, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonButton, IonInput, ReactiveFormsModule, RouterLink]

})
export class CreerDataPalettePage {
  

  labelForm: FormGroup;
  imageUrl!: string;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.labelForm = this.fb.group({
      sscc: ['', Validators.required],
      content_gtin: ['', Validators.required],
      batch: ['', Validators.required],
      description: ['', Validators.required],
      expiry_date: ['', Validators.required],
      prod_date: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      order_number: ['', Validators.required],
      number_part_cust: ['', Validators.required],
    });
  }

  generateLabel() {
    if (this.labelForm.valid) {
      this.http.post('http://127.0.0.1:5000/generate-label', this.labelForm.value, { responseType: 'blob' })
        .subscribe(blob => {
          // saveAs(blob, 'Etiquette-palette.png');
          const url = URL.createObjectURL(blob);
          this.imageUrl = url;
        }, error => {
          console.error('Erreur de génération', error);
        });
    }
  }

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
}

