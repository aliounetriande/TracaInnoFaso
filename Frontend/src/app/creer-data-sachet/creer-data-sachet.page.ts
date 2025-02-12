import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-creer-data-sachet',
  templateUrl: './creer-data-sachet.page.html',
  styleUrls: ['./creer-data-sachet.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CreerDataSachetPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
