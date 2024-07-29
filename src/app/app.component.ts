import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CalendarViewComponent } from "./calendar/calendar-view/calendar-view.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CalendarViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'calender-app';
}
