import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cardinality-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,

  ],
  templateUrl: './cardinality-dialog.component.html',
  styleUrl: './cardinality-dialog.component.css'
})
export class CardinalityDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CardinalityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}