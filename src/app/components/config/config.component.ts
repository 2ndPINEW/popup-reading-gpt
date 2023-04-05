import { Component } from '@angular/core';
import { GptService } from 'src/app/service/gpt.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent {
  constructor (
    private gptService: GptService,
  ) {}

  saveApiKey(apiKey: string) {
    this.gptService.setLocalApiKey(apiKey).subscribe()
  }
}
