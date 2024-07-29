import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

export const routes: Routes = [
    {
        path: 'calendar',
        loadComponent: () => import('./calendar/calendar-view/calendar-view.component').then(m => m.CalendarViewComponent)
    },
    {
        path: '',
        redirectTo: '/calendar',
        pathMatch: 'full'
    }
];

export const appRouting = [provideRouter(routes)];