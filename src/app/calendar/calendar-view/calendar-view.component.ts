import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentModalComponent } from '../appointment-modal/appointment-modal.component';
import {
  CdkDragDrop,
  CdkDragMove,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentsService } from '../../service/appointments.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss',
})
export class CalendarViewComponent implements OnInit {
  selectedDate: Date = new Date();
  hours = Array.from({ length: 24 }, (_, i) => i);
  //appointments: { title: string, hour: number, date: string }[] = [];
  appointment$!: Observable<{ title: string; hour: number; date: Date }[]>;
  hoveredHour: number | null = null;

  @ViewChild('dayView') dayView!: ElementRef<HTMLDivElement>;

  constructor(
    public dialog: MatDialog,
    public appointmentsService: AppointmentsService
  ) {}

  ngOnInit(): void {
    this.appointment$ = this.appointmentsService.getAppointments();
  }

  openAddAppointmentModal() {
    const dialogRef = this.dialog.open(AppointmentModalComponent, {
      width: '270px',
      data: { title: '', hour: 0, date: this.selectedDate },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result.date = new Date(this.selectedDate);
        result.date.setHours(result.hour);
        this.appointmentsService.addAppointment(result);
      }
    });
  }

  deleteAppointment(appointment: { title: string; hour: number; date: Date }) {
    this.appointmentsService.deleteAppointment(appointment);
  }

  getAppointmentsForHour(hour: number) {
    return this.appointment$.pipe(
      map((appointment: any) =>
        appointment.filter(
          (a: { hour: number; date: { toDateString: () => string } }) =>
            a.hour === hour &&
            a.date.toDateString() === this.selectedDate.toDateString()
        )
      )
    );
  }

  onDragMoved(event: CdkDragMove) {
    if (this.dayView) {
      const mouseY = event.pointerPosition.y;
      const slots = Array.from(this.dayView.nativeElement.querySelectorAll('.time-slot'));

      let found = false;
      for (const slot of slots) {
        const rect = slot.getBoundingClientRect();
        
        if (mouseY >= rect.top && mouseY <= rect.bottom) {
          const hour = parseInt(slot.getAttribute('data-hour') || '0', 10);
          this.hoveredHour = hour;
          found = true;
          break;
        }
      }

      if (!found) {
        this.hoveredHour = null;
      }
    }
  }

  drop(event: CdkDragDrop<{ title: string, hour: number, date: Date }[]>) {
    const appointment = event.item.data;

    if (this.hoveredHour !== null && appointment.hour !== this.hoveredHour) {
      const newDate = new Date(this.selectedDate);
      newDate.setHours(this.hoveredHour);

      const updatedAppointment = { 
        ...appointment, 
        hour: this.hoveredHour, 
        date: newDate 
      };

      this.appointmentsService.deleteAppointment(appointment);
      this.appointmentsService.addAppointment(updatedAppointment);
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // Clear hovered hour after drop
    this.hoveredHour = null;
  }

  updateHoveredHour(event: any, hour: number) {
    this.hoveredHour = hour;
  }

  previousDay() {
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.selectedDate = new Date(this.selectedDate);
  }

  nextDay() {
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.selectedDate = new Date(this.selectedDate);
  }
}
