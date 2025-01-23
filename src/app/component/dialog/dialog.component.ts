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
  getter: boolean;
  setter: boolean;
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

  // Rendre dialogRef public pour qu'il soit accessible dans le template
  constructor(
    public dialog: MatDialog,  // Public pour être utilisé dans le template
    public dialogRef: MatDialogRef<DialogComponent>,  // Public pour être utilisé dans le template
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  addRow(): void {
    const dialogRef = this.dialog.open(AttributeDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: TableRow | null) => {
      if (result) {
        this.tableData.data = [...this.tableData.data, result];
      }
    });
  }

  editRow(row: TableRow): void {
    const dialogRef = this.dialog.open(AttributeDialogComponent, {
      width: '400px',
      data: { ...row }
    });

    dialogRef.afterClosed().subscribe((result: TableRow | null) => {
      if (result) {
        const index = this.tableData.data.findIndex((r) => r.logicalName === row.logicalName);
        if (index !== -1) {
          this.tableData.data[index] = result;
        }
      }
    });
  }

  deleteRow(row: TableRow): void {
    this.tableData.data = this.tableData.data.filter((r) => r !== row);
  }

  getMethodSignature(name: string | null, type: string | null): string {
    if (!name || !type) return '';
    return `get${name.charAt(0).toUpperCase() + name.slice(1)}(): ${type}`;
  }

  setMethodSignature(name: string | null, type: string | null): string {
    if (!name || !type) return '';
    return `set${name.charAt(0).toUpperCase() + name.slice(1)}(${name}: ${type}): void`;
  }

  closeDialogWithData(): void {
    this.dialog.closeAll();  // Fermeture du dialog
    // Renvoie des données className et tableData
    this.dialogRef.close({
      className: this.className,
      tableData: this.tableData.data
    });
  }
}
