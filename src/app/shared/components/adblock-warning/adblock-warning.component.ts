import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdblockDetectorService } from '../../../core/services/adblock-detector.service';

@Component({
  selector: 'app-adblock-warning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adblock-warning.component.html',
  styleUrl: './adblock-warning.component.css'
})
export class AdblockWarningComponent {
  isRechecking = false;

  constructor(public adblockDetector: AdblockDetectorService) {}

  async recheckAdBlock(): Promise<void> {
    this.isRechecking = true;
    await this.adblockDetector.recheckAdBlock();
    this.isRechecking = false;
  }
}
