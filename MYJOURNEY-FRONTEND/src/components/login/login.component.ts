import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <div class="logo-robot">🤖</div>
            <h1 class="brand-title">MyJourney</h1>
          </div>
          <h2>Connexion de test</h2>
          <p>Sélectionnez un utilisateur pour tester l'application</p>
        </div>
        
        <div class="login-content">
          <div class="test-users">
            <h3>Utilisateurs de test disponibles :</h3>
            <div class="user-list">
              <div *ngFor="let user of testUsers" 
                   class="user-card"
                   (click)="loginAsUser(user.mail)"
                   [class.loading]="isLoading && selectedEmail === user.mail">
                <img [src]="user.photoUrl" [alt]="user.displayName" class="user-photo">
                <div class="user-info">
                  <div class="user-name">{{ user.displayName }}</div>
                  <div class="user-email">{{ user.mail }}</div>
                  <div class="user-role">{{ user.jobTitle }} - {{ user.department }}</div>
                </div>
                <div class="spinner" *ngIf="isLoading && selectedEmail === user.mail"></div>
                <i class="fas fa-arrow-right login-arrow" *ngIf="!isLoading || selectedEmail !== user.mail"></i>
              </div>
            </div>
          </div>
          
          <div class="divider">
            <span>ou</span>
          </div>
          
          <div class="custom-login">
            <h3>Connexion personnalisée :</h3>
            <div class="form-group">
              <label for="email">Adresse email :</label>
              <input 
                type="email" 
                id="email"
                [(ngModel)]="customEmail"
                placeholder="utilisateur@fr.gt.com"
                class="email-input"
                [disabled]="isLoading">
            </div>
            <button 
              class="login-btn custom" 
              (click)="loginAsUser(customEmail)"
              [disabled]="!customEmail || isLoading">
              <div class="spinner" *ngIf="isLoading && selectedEmail === customEmail"></div>
              <i class="fas fa-sign-in-alt" *ngIf="!isLoading || selectedEmail !== customEmail"></i>
              {{ isLoading && selectedEmail === customEmail ? 'Connexion...' : 'Se connecter' }}
            </button>
          </div>
          
          <div class="login-info">
            <div class="info-item">
              <i class="fas fa-info-circle"></i>
              <span>Mode test - Aucune authentification réelle requise</span>
            </div>
            <div class="info-item">
              <i class="fas fa-user-shield"></i>
              <span>Alexandre et Romain peuvent impersonnifier d'autres utilisateurs</span>
            </div>
            <div class="info-item">
              <i class="fas fa-database"></i>
              <span>Les données sont sauvegardées localement</span>
            </div>
          </div>
        </div>
        
        <div class="login-footer">
          <p>© 2025 MyJourney - Grant Thornton (Mode Test)</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: var(--shadow-xl);
      padding: 40px;
      max-width: 600px;
      width: 100%;
      text-align: center;
      max-height: 90vh;
      overflow-y: auto;
    }

    .login-header {
      margin-bottom: 32px;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .logo-robot {
      font-size: 48px;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
    }

    .brand-title {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .login-header h2 {
      color: var(--gray-800);
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .login-header p {
      color: var(--gray-600);
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
    }

    .login-content {
      margin-bottom: 32px;
      text-align: left;
    }

    .test-users h3,
    .custom-login h3 {
      color: var(--gray-800);
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .user-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 2px solid var(--gray-200);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .user-card:hover {
      border-color: var(--primary-color);
      background: rgba(34, 109, 104, 0.05);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .user-card.loading {
      pointer-events: none;
      opacity: 0.7;
    }

    .user-photo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid var(--primary-color);
      object-fit: cover;
    }

    .user-info {
      flex: 1;
      text-align: left;
    }

    .user-name {
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: 4px;
    }

    .user-email {
      color: var(--primary-color);
      font-size: 14px;
      margin-bottom: 2px;
    }

    .user-role {
      color: var(--gray-600);
      font-size: 12px;
    }

    .login-arrow {
      color: var(--primary-color);
      font-size: 18px;
    }

    .divider {
      text-align: center;
      margin: 24px 0;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--gray-300);
    }

    .divider span {
      background: white;
      padding: 0 16px;
      color: var(--gray-500);
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 16px;
      text-align: left;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--gray-700);
    }

    .email-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid var(--gray-300);
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .email-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(34, 109, 104, 0.1);
    }

    .login-btn {
      width: 100%;
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .login-btn:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .login-btn.custom {
      background: var(--secondary-color);
      color: var(--primary-color);
    }

    .login-btn.custom:hover:not(:disabled) {
      background: var(--primary-color);
      color: white;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .user-card .spinner {
      border-top-color: var(--primary-color);
      border-color: rgba(34, 109, 104, 0.3);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .login-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--gray-600);
      font-size: 14px;
      text-align: left;
    }

    .info-item i {
      color: var(--primary-color);
      width: 20px;
      text-align: center;
    }

    .login-footer {
      border-top: 1px solid var(--gray-200);
      padding-top: 20px;
    }

    .login-footer p {
      color: var(--gray-500);
      font-size: 12px;
      margin: 0;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 24px;
        margin: 0 16px;
      }
      
      .brand-title {
        font-size: 24px;
      }
      
      .login-header h2 {
        font-size: 20px;
      }
      
      .user-card {
        padding: 12px;
      }
      
      .user-photo {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class LoginComponent {
  isLoading = false;
  customEmail = '';
  selectedEmail = '';
  testUsers: UserProfile[] = [];

  constructor(private authService: AuthService) {
    this.testUsers = this.authService.getTestUsers();
  }

  async loginAsUser(email: string): Promise<void> {
    if (!email) return;
    
    this.isLoading = true;
    this.selectedEmail = email;
    
    try {
      await this.authService.login(email);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      this.isLoading = false;
      this.selectedEmail = '';
    }
  }
}