import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private appointmentsKey = 'appointments';
  private appointmentsSubject!: BehaviorSubject<{ title: string; hour: number; date: Date; }[]>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize the BehaviorSubject with data from local storage or an empty array
    const savedAppointments = this.isBrowser() 
      ? JSON.parse(localStorage.getItem(this.appointmentsKey) || '[]')
      : [];
    this.appointmentsSubject = new BehaviorSubject(savedAppointments.map((appointment: any) => ({
      ...appointment,
      date: new Date(appointment.date)
    })));
  }

  private saveToLocalStorage(appointments: { title: string, hour: number, date: Date }[]) {
    if (this.isBrowser()) {
      localStorage.setItem(this.appointmentsKey, JSON.stringify(appointments));
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getAppointments(): Observable<{ title: string, hour: number, date: Date }[]> {
    return this.appointmentsSubject.asObservable();
  }

  addAppointment(appointment: { title: string, hour: number, date: Date }) {
    const currentAppointments = this.appointmentsSubject.getValue();
    const updatedAppointments = [...currentAppointments, appointment];
    this.appointmentsSubject.next(updatedAppointments);
    this.saveToLocalStorage(updatedAppointments);
  }

  deleteAppointment(appointment: { title: string, hour: number, date: Date }) {
    const currentAppointments = this.appointmentsSubject.getValue();
    const updatedAppointments = currentAppointments.filter(a => a !== appointment);
    this.appointmentsSubject.next(updatedAppointments);
    this.saveToLocalStorage(updatedAppointments);
  }
}
