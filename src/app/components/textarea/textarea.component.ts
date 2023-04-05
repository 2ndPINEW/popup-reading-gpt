import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
})
export class TextareaComponent {
  @Output()
  submitText = new EventEmitter<string>();

  /** チャットの入力欄 */
  chatInput = new FormControl('');

  private pressKeys: string[] = [];

  keyUp(e: KeyboardEvent) {
    this.pressKeys = this.pressKeys.filter((key) => key !== e.key);
  }

  keyDown(e: KeyboardEvent) {
    this.pressKeys.push(e.key);
    if (
      e.key === 'Enter' &&
      (this.pressKeys.includes('Control') || this.pressKeys.includes('Meta'))
    ) {
      if (this.chatInput.value) {
        this.submitText.emit(this.chatInput.value);
        this.chatInput.setValue('');
      }
    }
  }
}
