import { Component } from '@angular/core';
import { GptService } from './service/gpt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  status$ = this.gptService.status$

  constructor (
    private gptService: GptService,
  ) {}
}
