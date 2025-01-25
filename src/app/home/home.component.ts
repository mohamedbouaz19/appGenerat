import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import Konva from 'konva';
import { DialogComponent } from '../component/dialog/dialog.component';
import { CardinalityDialogComponent } from '../component/cardinality-dialog/cardinality-dialog.component';

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
  private tool: string = '';
  private startPoint: Konva.Group | null = null;
  private currentShape: any;
  private connections: { from: Konva.Group; to: Konva.Group; line: Konva.Line }[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    const containerElement = this.stageContainer.nativeElement;

    this.stage = new Konva.Stage({
      container: containerElement,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.transformer = new Konva.Transformer();
    this.layer.add(this.transformer);

    this.stage.on('click', (event) => this.handleStageClick(event));
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
    if (!pos) return;

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
      this.createClass(pos.x, pos.y);
    } else if (this.tool === 'line') {
      const target = event.target;
      if (target instanceof Konva.Rect && target.parent instanceof Konva.Group) {
        const clickedClass = target.parent as Konva.Group;

        if (!this.startPoint) {
          this.startPoint = clickedClass;
        } else {
          const endPoint = clickedClass;
          if (this.startPoint !== endPoint) {
            this.createConnection(this.startPoint, endPoint);
          }
          this.startPoint = null;
        }
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

  createClass(x: number, y: number): void {
    const classGroup = new Konva.Group({
      x,
      y,
      draggable: true,
    });

    const rect = new Konva.Rect({
      width: 150,
      height: 100,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
    });

    const text = new Konva.Text({
      text: 'ClassName',
      fontSize: 16,
      fontStyle: 'bold',
      width: 150,
      align: 'center',
      padding: 10,
    });

    const isLeft = x < this.stage.width() / 2; // Vérifie si la classe est à gauche
    const addCardinalityButton = new Konva.Text({
      text: '+',
      fontSize: 15,
      fill: 'black',
      x: isLeft ? rect.width() + 5 : -15, // Positionne à droite ou à gauche
      y: rect.height() / 2 , // Centré verticalement
      draggable: false,
      cursor: 'pointer',
    });

    addCardinalityButton.on('click', () => {
      const dialogRef = this.dialog.open(CardinalityDialogComponent, {
        width: '400px',
        height: '300px',
        data: {
          cardinality: '',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          addCardinalityButton.text(result.cardinality);
          this.layer.draw();
        }
      });
    });

    classGroup.add(rect, text, addCardinalityButton);
    this.layer.add(classGroup);

    classGroup.on('dragmove', () => this.updateConnections(classGroup));
    this.layer.draw();
  }

  createConnection(from: Konva.Group, to: Konva.Group): void {
    const fromPos = this.getSideCenter(from, 'right');
    const toPos = this.getSideCenter(to, 'left');

    const line = new Konva.Line({
      points: [fromPos.x, fromPos.y, toPos.x, toPos.y],
      stroke: 'black',
      strokeWidth: 2,
    });

    this.layer.add(line);
    this.connections.push({ from, to, line });
    this.layer.draw();
  }

  getSideCenter(group: Konva.Group, side: 'left' | 'right'): { x: number; y: number } {
    const rect = group.findOne((node: Konva.Node) => node instanceof Konva.Rect) as Konva.Rect;
    const xOffset = side === 'left' ? 0 : rect.width();
    return {
      x: group.x() + xOffset,
      y: group.y() + rect.height() / 2,
    };
  }

  updateConnections(group: Konva.Group): void {
    this.connections.forEach((connection) => {
      if (connection.from === group || connection.to === group) {
        const fromPos = this.getSideCenter(connection.from, 'right');
        const toPos = this.getSideCenter(connection.to, 'left');

        connection.line.points([fromPos.x, fromPos.y, toPos.x, toPos.y]);
      }
    });
    this.layer.draw();
  }

  handleStageClick(event: any): void {
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
    this.connections = [];
    this.layer.draw();
  }
}
