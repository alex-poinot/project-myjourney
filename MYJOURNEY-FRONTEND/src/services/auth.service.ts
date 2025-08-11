import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  photoUrl?: string;
  isImpersonated?: boolean;
  originalUser?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private originalUserProfile: UserProfile | null = null;
  private readonly AUTHORIZED_IMPERSONATORS = [
    'alexandre.poinot@fr.gt.com',
    'romain.tetillon@fr.gt.com'
  ];

  // Utilisateurs de test disponibles
  private readonly TEST_USERS = [
    {
      displayName: 'Alexandre Poinot',
      mail: 'alexandre.poinot@fr.gt.com',
      userPrincipalName: 'alexandre.poinot@fr.gt.com',
      jobTitle: 'Développeur Senior',
      department: 'IT',
      photoUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      displayName: 'Romain Tetillon',
      mail: 'romain.tetillon@fr.gt.com',
      userPrincipalName: 'romain.tetillon@fr.gt.com',
      jobTitle: 'Chef de Projet',
      department: 'Management',
      photoUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      displayName: 'Marie Dupont',
      mail: 'marie.dupont@fr.gt.com',
      userPrincipalName: 'marie.dupont@fr.gt.com',
      jobTitle: 'Consultante',
      department: 'Audit',
      photoUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      displayName: 'Jean Martin',
      mail: 'jean.martin@fr.gt.com',
      userPrincipalName: 'jean.martin@fr.gt.com',
      jobTitle: 'Auditeur Senior',
      department: 'Audit',
      photoUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  constructor() {
    this.checkAuthenticationStatus();
  }

  private checkAuthenticationStatus(): void {
    // Vérifier si un utilisateur est déjà connecté (localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.userProfileSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      
      // Restaurer l'utilisateur original si nécessaire
      const savedOriginalUser = localStorage.getItem('originalUser');
      if (savedOriginalUser) {
        this.originalUserProfile = JSON.parse(savedOriginalUser);
      }
    }
  }

  async login(email?: string): Promise<void> {
    try {
      let selectedUser: UserProfile;
      
      if (email) {
        // Connexion avec un email spécifique
        const user = this.TEST_USERS.find(u => u.mail.toLowerCase() === email.toLowerCase());
        if (!user) {
          throw new Error('Utilisateur non trouvé');
        }
        selectedUser = user;
      } else {
        // Connexion par défaut avec Alexandre
        selectedUser = this.TEST_USERS[0];
      }

      // Sauvegarder en localStorage
      localStorage.setItem('currentUser', JSON.stringify(selectedUser));
      
      // Sauvegarder comme utilisateur original si ce n'est pas une impersonnification
      if (!this.originalUserProfile) {
        this.originalUserProfile = { ...selectedUser };
        localStorage.setItem('originalUser', JSON.stringify(this.originalUserProfile));
      }

      this.userProfileSubject.next(selectedUser);
      this.isAuthenticatedSubject.next(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('originalUser');
    this.isAuthenticatedSubject.next(false);
    this.userProfileSubject.next(null);
    this.originalUserProfile = null;
  }

  canImpersonate(): boolean {
    const currentUser = this.originalUserProfile || this.userProfileSubject.value;
    return currentUser ? this.AUTHORIZED_IMPERSONATORS.includes(currentUser.mail.toLowerCase()) : false;
  }

  async impersonateUser(targetEmail: string): Promise<boolean> {
    if (!this.canImpersonate()) {
      throw new Error('Vous n\'êtes pas autorisé à utiliser cette fonctionnalité');
    }

    try {
      // Chercher l'utilisateur cible dans la liste des utilisateurs de test
      let targetUser = this.TEST_USERS.find(u => u.mail.toLowerCase() === targetEmail.toLowerCase());
      
      // Si pas trouvé, créer un profil basique
      if (!targetUser) {
        targetUser = {
          displayName: targetEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          mail: targetEmail,
          userPrincipalName: targetEmail,
          jobTitle: 'Utilisateur impersonné',
          department: 'N/A',
          photoUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
        };
      }

      const impersonatedProfile: UserProfile = {
        ...targetUser,
        isImpersonated: true,
        originalUser: this.originalUserProfile?.mail || ''
      };

      // Sauvegarder le profil impersonné
      localStorage.setItem('currentUser', JSON.stringify(impersonatedProfile));
      this.userProfileSubject.next(impersonatedProfile);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'impersonnification:', error);
      return false;
    }
  }

  stopImpersonation(): void {
    if (this.originalUserProfile) {
      localStorage.setItem('currentUser', JSON.stringify(this.originalUserProfile));
      this.userProfileSubject.next({ ...this.originalUserProfile });
    }
  }

  isImpersonating(): boolean {
    const currentUser = this.userProfileSubject.value;
    return currentUser?.isImpersonated || false;
  }

  getOriginalUser(): UserProfile | null {
    return this.originalUserProfile;
  }

  getCurrentUser(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getTestUsers(): UserProfile[] {
    return this.TEST_USERS;
  }
}