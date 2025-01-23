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
  conceptualName: string|null;
  logicalName: string|null;
  type: string|null;
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
  displayedColumns: string[] = ['id', 'conceptualName', 'logicalName', 'type', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {}

  addRow(): void {
    const dialogRef = this.dialog.open(AttributeDialogComponent, {
      width: '800px',
      height: '600px',
    });

    dialogRef.afterClosed().subscribe((result: TableRow | null) => {
      if (result) {
        const newRow = { ...result, conceptualName: this.className };
        this.tableData.data = [...this.tableData.data, newRow];
      }
    });
  }

  editRow(row: TableRow): void {
    const dialogRef = this.dialog.open(AttributeDialogComponent, {
      width: '800px',
      height: '600px',
      data: { ...row },
    });

    dialogRef.afterClosed().subscribe((result: TableRow | null) => {
      if (result) {
        const index = this.tableData.data.findIndex((item) => item.logicalName === row.logicalName);
        if (index !== -1) {
          const updatedData = [...this.tableData.data];
          updatedData[index] = result;
          this.tableData.data = updatedData;
        }
      }
    });
  }

  deleteRow(row: TableRow): void {
    this.tableData.data = this.tableData.data.filter((item) => item.logicalName !== row.logicalName);
  }

  closeDialogWithData(): void {
    this.dialogRef.close({
      className: this.className,
      tableData: this.tableData.data
    });
  }
}