import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AttributeDialogComponent } from '../attribute-dialog/attribute-dialog.component';

interface TableRow {
  id: boolean;
  logicalName: string | null;
  type: string | null;
  getter: string;
  setter: string;
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatTableModule
  ],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent {
  className: string = '';
  tableData = new MatTableDataSource<TableRow>([]);
  displayedColumns: string[] = ['logicalName', 'type', 'getter', 'setter', 'actions'];

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.className = data.className || '';
    this.tableData.data = data.tableData || [];
  }
  addRow(): void {
    const dialogRef = this.dialog.open(AttributeDialogComponent, {
      width: '', // Augmenter la largeur
    height: '', // Ajouter une hauteur
    });

    dialogRef.afterClosed().subscribe((result: TableRow | null) => {
      if (result) {
        // Format the getter/setter signatures
        const formattedRow = {
          ...result,
          getter: result.getter ? `+ get${result.logicalName}() : ${result.type}` : '',
          setter: result.setter ? `+ set${result.logicalName}(value: ${result.type})` : '',
        };
        this.tableData.data = [...this.tableData.data, formattedRow];
        this.tableData._updateChangeSubscription(); // Update table data
      }
    });
  }

  editRow(row: TableRow): void {
    const dialogRef = this.dialog.open(AttributeDialogComponent, {
      width: '', // Augmenter la largeur
    height: '', // Ajouter une hauteur
      data: { ...row },
    });

    dialogRef.afterClosed().subscribe((result: TableRow | null) => {
      if (result) {
        const index = this.tableData.data.findIndex((r) => r.logicalName === row.logicalName);
        if (index !== -1) {
          this.tableData.data[index] = result;
          this.tableData._updateChangeSubscription(); // Update table data
        }
      }
    });
  }

  deleteRow(row: TableRow): void {
    this.tableData.data = this.tableData.data.filter((r) => r !== row);
    this.tableData._updateChangeSubscription(); // Update table data
  }

  closeDialogWithData(): void {
    this.dialogRef.close({
      className: this.className,
      tableData: this.tableData.data, // Return table data
    });
  }
}
