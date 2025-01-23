import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // Utilisez CommonModule au lieu de BrowserModule
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';

interface FormData {
  id: boolean; // Indique si c'est une clé primaire
  logicalName: string | null;
  type: string | null;
}

@Component({
  selector: 'app-attribute-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,  // Remplacez BrowserModule par CommonModule
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule
  ],
  templateUrl: './attribute-dialog.component.html',
  styleUrls: ['./attribute-dialog.component.css']
})
export class AttributeDialogComponent {
  formData: FormData = {
    id: false, // Par défaut, l'attribut n'est pas une clé primaire
    logicalName: null,
    type: null,
  };

  constructor(public dialogRef: MatDialogRef<AttributeDialogComponent>) {}

  onSubmit(): void {
    const newRow = { ...this.formData };
    this.dialogRef.close(newRow);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
