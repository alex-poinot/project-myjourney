import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserProfile } from '../../services/auth.service';

export interface TabGroup {
  name: string;
  tabs: string[];
  icon: string;
  collapsed: boolean;
  hovered?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar-horizontal">
      <!-- Logo et titre -->
      <div class="navbar-brand" (click)="goToHome()">
        <div class="logo-robot">🤖</div>
        <h1 class="brand-title">MyJourney</h1>
      </div>

      <!-- Menu horizontal -->
      <div class="navbar-menu">
        <div *ngFor="let group of tabGroups" 
             class="menu-group"
             (mouseenter)="onGroupHover(group, true)"
             (mouseleave)="onGroupHover(group, false)">
          
          <!-- Icône du groupe -->
          <div class="group-button" 
               [class.active]="isGroupActive(group)"
               (click)="toggleGroup(group)">
            <span class="group-name">{{ group.name }}</span>
            <span class="expand-icon">{{ group.collapsed ? '▼' : '▲' }}</span>
          </div>
          
          <!-- Dropdown des onglets -->
          <div class="dropdown-menu" 
               [class.visible]="!group.collapsed || group.hovered">
            <div *ngFor="let tab of group.tabs" 
                 class="dropdown-item"
                 [class.active]="activeTab === tab"
                 (click)="onTabClick(tab)">
              {{ tab }}
            </div>
          </div>
        </div>
      </div>

      <!-- Profil utilisateur -->
      <div class="navbar-profile">
        <!-- Badge d'impersonnification -->
        <div *ngIf="authService.isImpersonating()" class="impersonation-badge">
          <i class="fas fa-user-secret"></i>
          <span>Mode impersonnification</span>
        </div>
        
        <img [src]="currentUser?.photoUrl || defaultPhoto" [alt]="currentUser?.displayName || 'Utilisateur'" class="profile-photo">
        <div class="profile-info">
          <span class="profile-name">{{ currentUser?.displayName || 'Utilisateur' }}</span>
          <span *ngIf="authService.isImpersonating()" class="impersonation-info">
            ({{ authService.getOriginalUser()?.displayName }})
          </span>
        </div>
        
        <!-- Menu déroulant -->
        <div class="profile-dropdown">
          <button class="profile-menu-btn" (click)="toggleProfileMenu()">
            <i class="fas fa-chevron-down"></i>
          </button>
          
          <div class="dropdown-menu profile-menu" [class.visible]="showProfileMenu">
            <!-- Option d'impersonnification -->
            <div *ngIf="authService.canImpersonate() && !authService.isImpersonating()" 
                 class="dropdown-item" 
                 (click)="openImpersonationModal()">
              <i class="fas fa-user-secret"></i>
              Impersonnifier un utilisateur
            </div>
            
            <!-- Arrêter l'impersonnification -->
            <div *ngIf="authService.isImpersonating()" 
                 class="dropdown-item" 
                 (click)="stopImpersonation()">
              <i class="fas fa-user-check"></i>
              Arrêter l'impersonnification
            </div>
            
            <div class="dropdown-divider"></div>
            
            <div class="dropdown-item" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              Se déconnecter
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Modal d'impersonnification -->
    <div *ngIf="showImpersonationModal" class="modal-overlay" (click)="closeImpersonationModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Impersonnifier un utilisateur</h3>
          <button class="modal-close" (click)="closeImpersonationModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="warning-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Vous allez prendre l'identité d'un autre utilisateur. Cette action est enregistrée et surveillée.</p>
          </div>
          <div class="form-group">
            <label for="impersonation-email">Adresse email de l'utilisateur :</label>
            <input 
              type="email" 
              id="impersonation-email"
              [(ngModel)]="impersonationEmail"
              placeholder="utilisateur@fr.gt.com"
              class="form-input"
              (keyup.enter)="startImpersonation()">
          </div>
          <div *ngIf="impersonationError" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ impersonationError }}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="closeImpersonationModal()">Annuler</button>
          <button class="btn-impersonate" (click)="startImpersonation()" [disabled]="!impersonationEmail">
            <i class="fas fa-user-secret"></i>
            Impersonnifier
          </button>
        </div>
      </div>
    </div>
        <button class="logout-btn" (click)="logout()" title="Se déconnecter">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-horizontal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: white;
      color: var(--gray-800);
      box-shadow: var(--shadow-md);
      border-bottom: 2px solid var(--primary-color);
      z-index: 100;
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 32px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 8px 12px;
      border-radius: 8px;
    }

    .navbar-brand:hover {
      background: rgba(34, 109, 104, 0.05);
    }

    .logo {
      font-size: 28px;
    }

    .logo-robot {
      font-size: 32px;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
    }

    .brand-title {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .menu-group {
      position: relative;
    }

    .group-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 8px;
      white-space: nowrap;
    }

    .group-button:hover {
      background: rgba(34, 109, 104, 0.05);
    }

    .group-button.active {
      background: rgba(34, 109, 104, 0.1);
      border: 1px solid var(--primary-color);
    }

    .group-name {
      font-weight: 500;
      font-size: 14px;
    }

    .expand-icon {
      font-size: 10px;
      color: var(--primary-color);
      transition: transform 0.2s ease;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 200px;
      background: white;
      border: 1px solid var(--primary-color);
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
      z-index: 1000;
      margin-top: 8px;
    }

    .dropdown-menu.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      padding: 10px 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 6px;
      margin: 4px;
      font-size: 14px;
    }

    .dropdown-item:hover {
      background: rgba(37, 99, 235, 0.05);
    }

    .dropdown-item.active {
      background: var(--primary-color);
      color: white;
      font-weight: 600;
    }

    .navbar-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      position: relative;
    }

    .navbar-profile:hover {
      background: rgba(34, 109, 104, 0.05);
    }

    .impersonation-badge {
      background: var(--warning-color);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      animation: pulse 2s infinite;
    }

    .profile-photo {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid var(--primary-color);
      object-fit: cover;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .profile-name {
      font-weight: 500;
      color: var(--gray-700);
      font-size: 14px;
    }
    
    .impersonation-info {
      font-size: 11px;
      color: var(--warning-color);
      font-style: italic;
    }

    .profile-dropdown {
      position: relative;
    }

    .profile-menu-btn {
      background: none;
      border: none;
      color: var(--gray-600);
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    
    .profile-menu-btn:hover {
      background: rgba(34, 109, 104, 0.1);
      color: var(--primary-color);
    }

    .profile-menu {
      position: absolute;
      top: 100%;
      right: 0;
      min-width: 250px;
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.2s ease;
      z-index: 1000;
      margin-top: 8px;
    }

    .profile-menu.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 6px;
      margin: 4px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dropdown-item:hover {
      background: rgba(34, 109, 104, 0.05);
    }

    .dropdown-item i {
      width: 16px;
      color: var(--primary-color);
    }

    .dropdown-divider {
      height: 1px;
      background: var(--gray-200);
      margin: 8px 0;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: var(--shadow-xl);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--gray-200);
      background: var(--warning-color);
      color: white;
      border-radius: 12px 12px 0 0;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .modal-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .modal-close:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .modal-body {
      padding: 24px;
    }

    .warning-message {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid var(--warning-color);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .warning-message i {
      color: var(--warning-color);
      font-size: 20px;
      margin-top: 2px;
    }

    .warning-message p {
      margin: 0;
      color: var(--gray-700);
      font-size: 14px;
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--gray-700);
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid var(--gray-300);
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(34, 109, 104, 0.1);
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--error-color);
      border-radius: 6px;
      padding: 12px;
      color: var(--error-color);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid var(--gray-200);
      background: var(--gray-50);
      border-radius: 0 0 12px 12px;
    }

    .btn-cancel {
      padding: 10px 20px;
      border: 1px solid var(--gray-300);
      background: white;
      color: var(--gray-700);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: var(--gray-50);
      border-color: var(--gray-400);
    }

    .btn-impersonate {
      padding: 10px 20px;
      border: none;
      background: var(--warning-color);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-impersonate:hover:not(:disabled) {
      background: #d97706;
    }

    .btn-impersonate:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .navbar-horizontal {
        padding: 0 16px;
        gap: 16px;
      }
      
      .group-name {
        display: none;
      }
      
      .profile-name {
        display: none;
      }
      
      .profile-info {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .navbar-horizontal {
        height: 60px;
        padding: 0 12px;
        gap: 8px;
      }
      
      .brand-title {
        font-size: 16px;
      }
      
      .logo {
        font-size: 24px;
        padding: 4px;
      }
    }
  `]
})
export class NavbarComponent {
  @Input() activeTab: string = 'dashboard';
  @Output() tabChange = new EventEmitter<string>();
  
  currentUser: UserProfile | null = null;
  defaultPhoto = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100';

  showImpersonationModal = false;
  impersonationEmail = '';
  impersonationError = '';
  showProfileMenu = false;

  tabGroups: TabGroup[] = [
    {
      name: 'Avant la mission',
      tabs: ['LAB', 'Conflit Check', 'QAC', 'QAM', 'LDM'],
      icon: '📋',
      collapsed: true
    },
    {
      name: 'Pendant la mission',
      tabs: ['NOG', 'Checklist', 'Révision', 'Supervision'],
      icon: '⚙️',
      collapsed: true
    },
    {
      name: 'Fin de mission',
      tabs: ['NDS/CR Mission', 'QMM', 'Plaquette', 'Restitution communication client'],
      icon: '✅',
      collapsed: true
    }
  ];

  constructor(public authService: AuthService) {
    this.authService.userProfile$.subscribe(user => {
      this.currentUser = user;
      // Charger la photo de profil si elle n'est pas encore chargée
      if (user && !user.photoUrl) {
        this.loadUserPhoto();
      }
    });
  }

  private async loadUserPhoto(): Promise<void> {
    // Cette méthode sera appelée automatiquement par AuthService
    // lors du chargement du profil utilisateur
  }

  toggleGroup(group: TabGroup): void {
    group.collapsed = !group.collapsed;
  }

  onGroupHover(group: TabGroup, isHovered: boolean): void {
    (group as any).hovered = isHovered;
  }

  isGroupActive(group: TabGroup): boolean {
    return group.tabs.includes(this.activeTab);
  }

  onTabClick(tab: string): void {
    this.tabChange.emit(tab);
  }

  goToHome(): void {
    this.tabChange.emit('dashboard');
  }
  
  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  openImpersonationModal(): void {
    this.showImpersonationModal = true;
    this.showProfileMenu = false;
    this.impersonationEmail = '';
    this.impersonationError = '';
  }

  closeImpersonationModal(): void {
    this.showImpersonationModal = false;
    this.impersonationEmail = '';
    this.impersonationError = '';
  }

  async startImpersonation(): Promise<void> {
    if (!this.impersonationEmail) {
      this.impersonationError = 'Veuillez saisir une adresse email';
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.impersonationEmail)) {
      this.impersonationError = 'Format d\'email invalide';
      return;
    }

    try {
      const success = await this.authService.impersonateUser(this.impersonationEmail);
      if (success) {
        this.closeImpersonationModal();
        // Optionnel : afficher une notification de succès
      } else {
        this.impersonationError = 'Erreur lors de l\'impersonnification';
      }
    } catch (error: any) {
      this.impersonationError = error.message || 'Erreur lors de l\'impersonnification';
    }
  }

  stopImpersonation(): void {
    this.authService.stopImpersonation();
    this.showProfileMenu = false;
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
    this.showProfileMenu = false;
  }
}