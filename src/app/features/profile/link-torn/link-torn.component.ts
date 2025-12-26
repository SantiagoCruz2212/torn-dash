import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-link-torn',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './link-torn.component.html',
  styleUrl: './link-torn.component.css'
})
export class LinkTornComponent {
  linkForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.linkForm = this.fb.group({
      apiKey: ['', [Validators.required, Validators.minLength(16)]]
    });
  }

  onSubmit(): void {
    if (this.linkForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.linkTornAccount(this.linkForm.value.apiKey).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Successfully linked to ${response.tornPlayerName}!`;

        // Redirect to marketplace after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/marketplace/browse']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to link Torn account. Please check your API key.';
      }
    });
  }

  skipForNow(): void {
    this.router.navigate(['/dashboard']);
  }
}
