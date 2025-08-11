import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult, AccountInfo } from '@azure/msal-browser';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { loginRequest, graphConfig } from '../auth/auth.config';

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

  constructor(
    private msalService: MsalService,
    private http: HttpClient
  ) {
    this.checkAuthenticationStatus();
  }

  private checkAuthenticationStatus(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.msalService.instance.setActiveAccount(accounts[0]);
      this.isAuthenticatedSubject.next(true);
      // Charger le profil utilisateur de manière asynchrone
      this.loadUserProfile().catch(error => {
        console.error('Erreur lors du chargement du profil:', error);
      });
    }
  }

  async login(): Promise<void> {
    try {
      const result = await firstValueFrom(this.msalService.loginPopup(loginRequest));
      if (result) {
        this.msalService.instance.setActiveAccount(result.account);
        this.isAuthenticatedSubject.next(true);
        await this.loadUserProfile();
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  logout(): void {
    this.msalService.logout();
    this.isAuthenticatedSubject.next(false);
    this.userProfileSubject.next(null);
    this.originalUserProfile = null;
  }

  private async loadUserProfile(): Promise<void> {
    try {
      const account = this.msalService.instance.getActiveAccount();
      if (!account) return;

      // Acquérir un token pour Microsoft Graph
      const tokenResponse = await firstValueFrom(this.msalService.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account: account
      }));

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${tokenResponse.accessToken}`
      });

      // Récupérer les informations du profil
      const profile = await this.http.get<any>(graphConfig.graphMeEndpoint, { headers }).toPromise();
      
      // Récupérer la photo de profil
      let photoUrl = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100';
      try {
        const photoBlob = await this.http.get(graphConfig.graphPhotoEndpoint, { 
          headers, 
          responseType: 'blob' 
        }).toPromise();
        
        if (photoBlob) {
          photoUrl = URL.createObjectURL(photoBlob);
        }
      } catch (photoError) {
        console.log('Photo de profil non disponible, utilisation de l\'image par défaut');
      }

      const userProfile: UserProfile = {
        displayName: profile.displayName || profile.userPrincipalName,
        mail: profile.mail || profile.userPrincipalName,
        userPrincipalName: profile.userPrincipalName,
        jobTitle: profile.jobTitle,
        department: profile.department,
        photoUrl: photoUrl
      };

      // Sauvegarder le profil original si ce n'est pas déjà fait
      if (!this.originalUserProfile) {
        this.originalUserProfile = { ...userProfile };
      }

      this.userProfileSubject.next(userProfile);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
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
      // Créer un profil d'impersonnification basique
      const impersonatedProfile: UserProfile = {
        displayName: targetEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        mail: targetEmail,
        userPrincipalName: targetEmail,
        jobTitle: 'Utilisateur impersonné',
        department: 'N/A',
        photoUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        isImpersonated: true,
        originalUser: this.originalUserProfile?.mail || ''
      };

      this.userProfileSubject.next(impersonatedProfile);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'impersonnification:', error);
      return false;
    }
  }

  stopImpersonation(): void {
    if (this.originalUserProfile) {
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
}