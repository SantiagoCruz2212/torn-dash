import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdService, AdProvider } from '../../../core/services/ad.service';

@Component({
  selector: 'app-ad-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-box.component.html',
  styleUrl: './ad-box.component.css'
})
export class AdBoxComponent implements OnInit, AfterViewInit {
  @Input() provider: AdProvider = 'adsense';
  @Input() client?: string; // For AdSense (ca-pub-xxxxx)
  @Input() slot?: string; // For AdSense
  @Input() format: string = 'auto'; // For AdSense
  @Input() scriptId?: string; // For Adsterra/PropellerAds
  @Input() minHeight: string = '300px'; // Default box height
  @Input() responsive: boolean = true;

  @ViewChild('adContainer', { static: false }) adContainer?: ElementRef;

  constructor(private adService: AdService) {}

  ngOnInit(): void {
    if (this.provider === 'adsense' && this.client) {
      this.adService.initializeAdSense(this.client);
    } else if (this.provider === 'adsterra' && this.scriptId) {
      this.adService.initializeAdsterra(this.scriptId);
    } else if (this.provider === 'propellerads' && this.scriptId) {
      this.adService.initializePropellerAds(this.scriptId);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.provider === 'adsense') {
        this.adService.pushAdSense();
      }
    }, 100);
  }
}
