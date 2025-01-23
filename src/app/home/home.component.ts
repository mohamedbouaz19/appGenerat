import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../component/dialog/dialog.component';
import Konva from 'konva';

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
    MatDialogModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})


export class HomeComponent implements AfterViewInit {
  @ViewChild('stageContainer', { static: true }) stageContainer!: ElementRef;
  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private transformer!: Konva.Transformer;
  private currentShape: any;
  private tool: string = 'pen';
  private startPoint: { x: number; y: number } | null = null;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    const containerElement = this.stageContainer.nativeElement;

    // Initialize Konva stage
    this.stage = new Konva.Stage({
      container: containerElement,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.transformer = new Konva.Transformer();
    this.layer.add(this.transformer);

    this.stage.on('click', (e) => this.handleClick(e));
    this.stage.on('dblclick', (e) => this.handleDoubleClick(e));
    this.stage.on('mousedown', (e) => this.startDrawing(e));
    this.stage.on('mousemove', (e) => this.draw(e));
    this.stage.on('mouseup', () => this.stopDrawing());
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', () => this.resizeStage());
  }

  resizeStage(): void {
    const containerElement = this.stageContainer.nativeElement;
    this.stage.width(containerElement.offsetWidth);
    this.stage.height(containerElement.offsetHeight);
    this.layer.draw();
  }

  setTool(tool: string): void {
    this.tool = tool;
    this.startPoint = null;
    this.transformer.nodes([]);
    this.layer.draw();
  }

  startDrawing(event: any): void {
    const pos = this.stage.getPointerPosition();
    if (!pos || this.tool === 'pen') return;

    if (this.tool === 'circle') {
      this.currentShape = new Konva.Circle({
        x: pos.x,
        y: pos.y,
        radius: 30,
        fill: 'lightblue',
        stroke: 'black',
        draggable: true,
      });
      this.layer.add(this.currentShape);
    } else if (this.tool === 'class') {
      const classGroup = new Konva.Group({
        x: pos.x,
        y: pos.y,
        draggable: true,
      });

      const rect = new Konva.Rect({
        width: 200,
        height: 80,
        fill: 'white',
        stroke: 'black',
      });

      const title = new Konva.Text({
        text: 'ClassName',
        fontSize: 16,
        fontStyle: 'bold',
        padding: 10,
        width: 200,
        align: 'center',
      });

      classGroup.add(rect, title);
      this.layer.add(classGroup);
    } else if (this.tool === 'line') {
      if (!this.startPoint) {
        this.startPoint = { x: pos.x, y: pos.y };
      } else {
        this.currentShape = new Konva.Line({
          points: [this.startPoint.x, this.startPoint.y, pos.x, pos.y],
          stroke: 'black',
          strokeWidth: 2,
          lineCap: 'round',
          lineJoin: 'round',
        });
        this.layer.add(this.currentShape);
        this.startPoint = null;
      }
    }

    this.layer.draw();
  }

  draw(event: any): void {
    if (!this.currentShape || this.tool !== 'pen') return;

    const pos = this.stage.getPointerPosition();
    if (!pos) return;

    const line = this.currentShape as Konva.Line;
    const newPoints = line.points().concat([pos.x, pos.y]);
    line.points(newPoints);
    this.layer.draw();
  }

  stopDrawing(): void {
    this.currentShape = null;
  }

  handleClick(event: any): void {
    const clickedShape = event.target;

    if (this.tool === 'pen') {
      if (clickedShape === this.stage) {
        this.transformer.nodes([]);
      } else {
        this.transformer.nodes([clickedShape]);
      }
    }

    this.layer.draw();
  }

  undo(): void {
    const children = this.layer.getChildren();
    if (children.length > 0) {
      children[children.length - 1].destroy();
      this.layer.draw();
    }
  }

  clear(): void {
    this.layer.destroyChildren();
    this.layer.add(this.transformer);
    this.layer.draw();
  }

  handleDoubleClick(event: any): void {
    const clickedShape = event.target;
  
    // Vérifie si l'élément cliqué appartient à un groupe (représente une classe)
    if (clickedShape.parent instanceof Konva.Group) {
      const group = clickedShape.parent;
  
      // Ouvre le dialogue avec les données actuelles de la classe
      const dialogRef = this.dialog.open(DialogComponent, {
        width: '1000px',
        height: '600px',
        data: {
          className: group.findOne((node: Konva.Node) => node instanceof Konva.Text)?.text() || '',
        },
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // Mise à jour du nom de la classe
          const titleNode = group.findOne((node: Konva.Node) => node instanceof Konva.Text) as Konva.Text;
          if (titleNode) {
            titleNode.text(result.className);
            titleNode.fontStyle('bold'); // Mise en gras du nom de la classe
          }
  
          // Suppression des attributs existants
          const existingAttributes = group.getChildren().filter(
            (node: Konva.Node) => node instanceof Konva.Text && node !== titleNode
          );
          existingAttributes.forEach((attr: Konva.Node) => attr.destroy());
  
          // Ajout des nouveaux attributs, getters et setters
          let yOffset = 40; // Décalage initial sous le nom de la classe
          result.tableData.forEach((row: any) => {
            // Ajout de l'attribut
            const attributeText = new Konva.Text({
              text: `${row.logicalName || '...'}: ${row.type || '...'}`,
              fontSize: 14,
              padding: 5,
              y: yOffset,
              width: 200,
              align: 'left',
            });
  
            group.add(attributeText);
            yOffset += attributeText.height() + 5; // Ajustement pour chaque ligne
  
            // Ajout du getter
            if (row.getter) {
              const getterText = new Konva.Text({
                text: `get${row.logicalName.charAt(0).toUpperCase() + row.logicalName.slice(1)}(): ${row.type}`,
                fontSize: 14,
                padding: 5,
                y: yOffset,
                width: 200,
                align: 'left',
              });
  
              group.add(getterText);
              yOffset += getterText.height() + 5;
            }
  
            // Ajout du setter
            if (row.setter) {
              const setterText = new Konva.Text({
                text: `set${row.logicalName.charAt(0).toUpperCase() + row.logicalName.slice(1)}(${row.logicalName}: ${row.type}): void`,
                fontSize: 14,
                padding: 5,
                y: yOffset,
                width: 200,
                align: 'left',
              });
  
              group.add(setterText);
              yOffset += setterText.height() + 5;
            }
          });
  
          // Ajustement de la hauteur du rectangle de fond
          const rect = group.findOne((node: Konva.Node) => node instanceof Konva.Rect) as Konva.Rect;
          if (rect) {
            rect.height(yOffset + 10);
          }
  
          // Redessine le calque
          this.layer.draw();
        }
      });
    }
  }
} 