import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common'; // Ajoutez cette ligne
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule,MatDialog} from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    DragDropModule,
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatDialogModule

  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private _dialog:MatDialog){}
  // Tableau pour stocker les cartes dupliquées
  cards: any[] = [];

  // Méthode pour ajouter une nouvelle carte
  addCard() {
    console.log('Adding a new card');
    this.cards.push({}); // Ajouter une nouvelle carte vide au tableau
  }
  
  openAddEditClassForm(){
    this._dialog.open(DialogComponent);

  }
}
