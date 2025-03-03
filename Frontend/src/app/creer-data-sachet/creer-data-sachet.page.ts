import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup,Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import jspdf from 'jspdf';
import { RouterLink } from '@angular/router';
import { saveAs } from 'file-saver';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonButton, IonLabel, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';

interface GtinOption {
  label: string;
  value: string;
}


@Component({
  selector: 'app-creer-data-sachet',
  templateUrl: './creer-data-sachet.page.html',
  styleUrls: ['./creer-data-sachet.page.scss'],
  standalone: true,
  imports: [
    IonLabel, IonItem, IonButton, IonContent, 
    IonHeader, IonTitle, IonToolbar, CommonModule,
    FormsModule, ReactiveFormsModule, HttpClientModule, RouterLink, IonSelect, IonSelectOption, 
  ],
  
})
export class CreerDataSachetPage {

  sachetForm: FormGroup;
  imageUrl: string | null = null;


  gtinOptions: GtinOption[] = [
    { label: 'GTIN Sachet plumpy nut', value: '6188000059007' },
    { label: 'GTIN Carton plumpy nut', value: '6188000059008' }
  ];

  

  constructor(private http: HttpClient, private fb: FormBuilder) {

    this.sachetForm = this.fb.group({
      gtin: ['', Validators.required]
      
    }); 
  
  }

  generateDataMatrix(): void {
    console.log("Génération de la datamatrix pour le sachet", this.sachetForm.value);
    
    if (!this.sachetForm.valid) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    this.http.post('http://127.0.0.1:5000/generate-datamatrix-sachet', this.sachetForm.value, { responseType: 'blob' })
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

  onSelectChange(event: any) {
    console.log("GTIN sélectionné :", event.detail.value);
  }
  

}
