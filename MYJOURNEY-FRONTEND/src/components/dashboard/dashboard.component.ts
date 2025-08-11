import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService, UserProfile } from '../../services/auth.service';
import { environment } from '../../environments/environment';

interface MissionData {
  numeroGroupe: string;
  nomGroupe: string;
  numeroClient: string;
  nomClient: string;
  mission: string;
  avantMission: {
    percentage: number;
    lab: boolean;
    conflitCheck: boolean;
    qac: boolean;
    qam: boolean;
    ldm: boolean;
  };
  pendantMission: {
    percentage: number;
    nog: boolean;
    checklist: boolean;
    revision: boolean;
    supervision: boolean;
  };
  finMission: {
    percentage: number;
    ndsCr: boolean;
    qmm: boolean;
    plaquette: boolean;
    restitution: boolean;
  };
}

interface ClientGroup {
  numeroClient: string;
  nomClient: string;
  missions: MissionData[];
  expanded: boolean;
}

interface GroupData {
  numeroGroupe: string;
  nomGroupe: string;
  clients: ClientGroup[];
  expanded: boolean;
}

interface ModalData {
  isOpen: boolean;
  columnName: string;
  missionId: string;
  currentStatus: boolean;
  selectedFile: File | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Tableau de bord des missions</h1>
        <div class="header-controls">
          <button class="expand-all-btn" (click)="toggleAllGroups()">
            <i class="fas" [ngClass]="allGroupsExpanded ? 'fa-folder-minus' : 'fa-folder-plus'"></i>
            {{ allGroupsExpanded ? 'Réduire tout' : 'Développer tout' }}
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="mission-table">
          <thead>
            <tr>
              <!--<th rowspan="2" class="group-header">
                <button class="collapse-btn" (click)="toggleAllGroups()">
                  {{ allGroupsExpanded ? '▼' : '▶' }}
                </button>
              </th>-->
              <!-- Groupe Information -->
              <th colspan="5" class="column-group-header information">
                Information
              </th>
              <!-- Groupe Avant la mission -->
              <th [attr.colspan]="avantMissionCollapsed ? 1 : 6" class="column-group-header avant-mission">
                <button class="collapse-btn" (click)="toggleColumnGroup('avantMission')">
                  <i class="fas" [ngClass]="avantMissionCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'"></i>
                </button>
                Avant la mission
              </th>
              <!-- Groupe Pendant la mission -->
              <th [attr.colspan]="pendantMissionCollapsed ? 1 : 5" class="column-group-header pendant-mission">
                <button class="collapse-btn" (click)="toggleColumnGroup('pendantMission')">
                  <i class="fas" [ngClass]="pendantMissionCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'"></i>
                </button>
                Pendant la mission
              </th>
              <!-- Groupe Fin de mission -->
              <th [attr.colspan]="finMissionCollapsed ? 1 : 5" class="column-group-header fin-mission">
                <button class="collapse-btn" (click)="toggleColumnGroup('finMission')">
                  <i class="fas" [ngClass]="finMissionCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'"></i>
                </button>
                Fin de mission
              </th>
            </tr>
            <tr>
              <!-- Information columns -->
              <th class="column-header">N° Groupe</th>
              <th class="column-header">Nom Groupe</th>
              <th class="column-header">N° Client</th>
              <th class="column-header">Nom Client</th>
              <th class="column-header">Mission</th>
              
              <!-- Avant la mission columns -->
              <th class="column-header percentage">%</th>
              <th *ngIf="!avantMissionCollapsed" class="column-header">LAB</th>
              <th *ngIf="!avantMissionCollapsed" class="column-header">Conflit Check</th>
              <th *ngIf="!avantMissionCollapsed" class="column-header">QAC</th>
              <th *ngIf="!avantMissionCollapsed" class="column-header">QAM</th>
              <th *ngIf="!avantMissionCollapsed" class="column-header">LDM</th>
              
              <!-- Pendant la mission columns -->
              <th class="column-header percentage">%</th>
              <th *ngIf="!pendantMissionCollapsed" class="column-header">NOG</th>
              <th *ngIf="!pendantMissionCollapsed" class="column-header">Checklist</th>
              <th *ngIf="!pendantMissionCollapsed" class="column-header">Révision</th>
              <th *ngIf="!pendantMissionCollapsed" class="column-header">Supervision</th>
              
              <!-- Fin de mission columns -->
              <th class="column-header percentage">%</th>
              <th *ngIf="!finMissionCollapsed" class="column-header">NDS/CR</th>
              <th *ngIf="!finMissionCollapsed" class="column-header">QMM</th>
              <th *ngIf="!finMissionCollapsed" class="column-header">Plaquette</th>
              <th *ngIf="!finMissionCollapsed" class="column-header">Restitution</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let group of paginatedData; let groupIndex = index">
              <!-- Ligne de groupe -->
              <tr class="group-row main-group" (click)="toggleMainGroup(groupIndex)">
                <!--<td class="group-cell">
                  <button class="collapse-btn">
                    {{ group.expanded ? '▼' : '▶' }}
                  </button>
                  <strong>{{ group.numeroGroupe }} - {{ group.nomGroupe }}</strong>
                </td>-->
                <td colspan="100%" class="group-summary">
                  <div class="group-cell">
                    <div class="collapse-btn-container">
                      <button class="collapse-btn">
                        <i class="fas" [ngClass]="group.expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                      </button>
                    </div>
                    <div class="group-info">
                      <strong>{{ group.numeroGroupe }} - {{ group.nomGroupe }}</strong>
                      <i class="fas fa-tasks"></i> {{ getTotalMissionsInGroup(group) }} mission(s) - 
                      <i class="fas fa-users"></i> {{ getTotalClientsInGroup(group) }} client(s) - 
                      <i class="fas fa-chart-line"></i> Avancement moyen: {{ getMainGroupAverage(group) }}%
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Groupes de clients -->
              <ng-container *ngFor="let client of group.clients; let clientIndex = index">
                <!-- Ligne de sous-groupe (client) -->
                <tr class="group-row client-group" 
                    [class.hidden]="!group.expanded"
                    (click)="toggleClientGroup(groupIndex, clientIndex)">
                  <!--<td class="client-indent"></td>-->
                  <td class="client-cell" colspan="5">
                    <div class="client-row">
                      <button class="collapse-btn">
                        <i class="fas" [ngClass]="client.expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                      </button>
                      <strong>{{ client.numeroClient }} - {{ client.nomClient }}</strong>
                      <span class="client-summary">
                        <i class="fas fa-briefcase"></i> ({{ getTotalMissionsInClient(group, client) }} mission(s))
                      </span>
                    </div>
                  </td>
                  
                  <!-- Colonnes vides pour l'alignement -->
                  <td class="percentage-cell">
                    <div class="progress-circle" [attr.data-percentage]="getClientAverage(client, 'avantMission')">
                      {{ getClientAverage(client, 'avantMission') }}%
                    </div>
                  </td>
                  <td *ngIf="!avantMissionCollapsed" [attr.colspan]="avantMissionCollapsed ? 0 : 5"></td>
                  
                  <td class="percentage-cell">
                    <div class="progress-circle" [attr.data-percentage]="getClientAverage(client, 'pendantMission')">
                      {{ getClientAverage(client, 'pendantMission') }}%
                    </div>
                  </td>
                  <td *ngIf="!pendantMissionCollapsed" [attr.colspan]="pendantMissionCollapsed ? 0 : 4"></td>
                  
                  <td class="percentage-cell">
                    <div class="progress-circle" [attr.data-percentage]="getClientAverage(client, 'finMission')">
                      {{ getClientAverage(client, 'finMission') }}%
                    </div>
                  </td>
                  <td *ngIf="!finMissionCollapsed" [attr.colspan]="finMissionCollapsed ? 0 : 4"></td>
                </tr>
                
                <!-- Missions du client -->
                <tr *ngFor="let mission of client.missions" 
                    class="mission-row" 
                    [class.hidden]="!group.expanded || !client.expanded">
                  <!--<td class="mission-indent"></td>-->
                  
                  <!-- Information -->
                  <td>{{ mission.numeroGroupe }}</td>
                  <td>{{ mission.nomGroupe }}</td>
                  <td>{{ mission.numeroClient }}</td>
                  <td>{{ mission.nomClient }}</td>
                  <td>{{ mission.mission }}</td>
                  
                  <!-- Avant la mission -->
                  <td class="percentage-cell">
                    <div class="progress-circle" [attr.data-percentage]="mission.avantMission.percentage">
                      {{ mission.avantMission.percentage }}%
                    </div>
                  </td>
                  <td *ngIf="!avantMissionCollapsed" class="status-cell" (click)="openStatusModal('LAB', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.avantMission.lab)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.avantMission.lab ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.avantMission.lab"></i>
                  </td>
                  <td *ngIf="!avantMissionCollapsed" class="status-cell" (click)="openStatusModal('Conflit Check', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.avantMission.conflitCheck)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.avantMission.conflitCheck ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.avantMission.conflitCheck"></i>
                  </td>
                  <td *ngIf="!avantMissionCollapsed" class="status-cell" (click)="openStatusModal('QAC', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.avantMission.qac)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.avantMission.qac ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.avantMission.qac"></i>
                  </td>
                  <td *ngIf="!avantMissionCollapsed" class="status-cell" (click)="openStatusModal('QAM', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.avantMission.qam)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.avantMission.qam ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.avantMission.qam"></i>
                  </td>
                  <td *ngIf="!avantMissionCollapsed" class="status-cell" (click)="openStatusModal('LDM', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.avantMission.ldm)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.avantMission.ldm ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.avantMission.ldm"></i>
                  </td>
                  
                  <!-- Pendant la mission -->
                  <td class="percentage-cell">
                    <div class="progress-circle" [attr.data-percentage]="mission.pendantMission.percentage">
                      {{ mission.pendantMission.percentage }}%
                    </div>
                  </td>
                  <td *ngIf="!pendantMissionCollapsed" class="status-cell" (click)="openStatusModal('NOG', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.pendantMission.nog)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.pendantMission.nog ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.pendantMission.nog"></i>
                  </td>
                  <td *ngIf="!pendantMissionCollapsed" class="status-cell" (click)="openStatusModal('Checklist', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.pendantMission.checklist)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.pendantMission.checklist ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.pendantMission.checklist"></i>
                  </td>
                  <td *ngIf="!pendantMissionCollapsed" class="status-cell" (click)="openStatusModal('Révision', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.pendantMission.revision)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.pendantMission.revision ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.pendantMission.revision"></i>
                  </td>
                  <td *ngIf="!pendantMissionCollapsed" class="status-cell" (click)="openStatusModal('Supervision', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.pendantMission.supervision)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.pendantMission.supervision ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.pendantMission.supervision"></i>
                  </td>
                  
                  <!-- Fin de mission -->
                  <td class="percentage-cell">
                    <div class="progress-circle" [attr.data-percentage]="mission.finMission.percentage">
                      {{ mission.finMission.percentage }}%
                    </div>
                  </td>
                  <td *ngIf="!finMissionCollapsed" class="status-cell" (click)="openStatusModal('NDS/CR Mission', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.finMission.ndsCr)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.finMission.ndsCr ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.finMission.ndsCr"></i>
                  </td>
                  <td *ngIf="!finMissionCollapsed" class="status-cell" (click)="openStatusModal('QMM', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.finMission.qmm)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.finMission.qmm ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.finMission.qmm"></i>
                  </td>
                  <td *ngIf="!finMissionCollapsed" class="status-cell" (click)="openStatusModal('Plaquette', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.finMission.plaquette)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.finMission.plaquette ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.finMission.plaquette"></i>
                  </td>
                  <td *ngIf="!finMissionCollapsed" class="status-cell" (click)="openStatusModal('Restitution communication client', mission.numeroGroupe + '-' + mission.numeroClient + '-' + mission.mission, mission.finMission.restitution)">
                    <i class="fas status-icon" 
                       [ngClass]="mission.finMission.restitution ? 'fa-check-circle' : 'fa-clock'"
                       [class.completed]="mission.finMission.restitution"></i>
                  </td>
                </tr>
              </ng-container>
            </ng-container>
          </tbody>
        </table>
      </div>

      <div class="pagination-footer">
        <div class="pagination-container">
          <div class="mission-count-display">
            {{ startIndex + 1 }}-{{ endIndex }} sur {{ totalMissions }} missions
          </div>
          
          <div class="pagination-controls">
            <button 
              class="pagination-btn" 
              [disabled]="currentPage === 1"
              (click)="goToPage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i> Précédent
            </button>
            
            <div class="page-numbers">
              <ng-container *ngFor="let page of getVisiblePages()">
                <button 
                  *ngIf="page !== '...' && page !== ''"
                  class="page-btn"
                  [class.active]="page === currentPage"
                  (click)="goToPage(+page)">
                  {{ page }}
                </button>
                <span *ngIf="page === '...'" class="page-btn ellipsis">...</span>
                <span *ngIf="page === ''" class="page-btn empty"></span>
              </ng-container>
            </div>
            
            <button 
              class="pagination-btn" 
              [disabled]="currentPage === totalPages"
              (click)="goToPage(currentPage + 1)">
              Suivant <i class="fas fa-chevron-right"></i>
            </button>
          </div>         
        </div>
      </div>

      <!-- Modal pour les statuts -->
      <div *ngIf="modalData.isOpen" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ modalData.columnName }}</h3>
            <button class="modal-close" (click)="closeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="modalData.currentStatus"
                  class="status-checkbox">
                <span class="checkbox-text">Tâche terminée</span>
              </label>
            </div>
            <div class="form-group">
              <label for="file-input">Fichier joint :</label>
              <input 
                type="file" 
                id="file-input"
                (change)="onFileSelected($event)"
                class="file-input">
              <div *ngIf="modalData.selectedFile" class="file-info">
                <span class="file-name">{{ modalData.selectedFile.name }}</span>
                <button class="remove-file" (click)="removeFile()">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Annuler</button>
            <button class="btn-save" (click)="saveStatus()">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hidden {
      display: none;
    }
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 70px);
      background: var(--gray-50);
      overflow: hidden;
    }

    .dashboard-header {
      flex-shrink: 0;
      padding: 24px 24px 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dashboard-header h1 {
      margin: 0 0 8px 0;
      color: var(--primary-color);
      font-size: 28px;
      font-weight: 700;
    }

    .dashboard-header p {
      margin: 0;
      color: var(--gray-600);
      font-size: 16px;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .expand-all-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .expand-all-btn:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .table-controls {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: white;
      border-bottom: 1px solid var(--gray-200);
    }

    .pagination-info {
      font-size: 14px;
      color: var(--gray-600);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
    }

    .pagination-btn {
      padding: 8px 12px;
      border: 1px solid var(--gray-300);
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .pagination-btn:hover:not(:disabled) {
      background: var(--gray-50);
      border-color: var(--primary-color);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 14px;
      color: var(--gray-700);
      font-weight: 500;
    }

    .table-wrapper {
      flex: 1;
      overflow: auto;
      margin: 0 24px;
      background: white;
      border-radius: 12px;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--gray-200);
    }

    .mission-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      min-width: 100%;
    }

    .column-group-header {
      background: var(--primary-color);
      color: white;
      padding: 12px 16px;
      font-weight: 600;
      text-align: center;
      border-bottom: 2px solid var(--secondary-color);
      position: relative;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .group-cell {
      display: flex;
      align-items: center;
      gap: 0.5vw;
    }

    .client-row {
      padding-left: 16px;
      display: flex;
      align-items: center;
      gap: 0.5vw;
    }
    
    .column-group-header.information {
      background: var(--primary-dark);
    }

    .column-group-header.avant-mission {
      background: var(--primary-color);
    }

    .column-group-header.pendant-mission {
      background: var(--secondary-color);
      color: var(--primary-color);
    }

    .column-group-header.fin-mission {
      background: var(--primary-color);
    }

    .column-header {
      background: var(--gray-100);
      color: var(--gray-700);
      padding: 10px 12px;
      font-weight: 600;
      text-align: center;
      border-bottom: 1px solid var(--gray-200);
      white-space: nowrap;
      position: sticky;
      top: 49px;
      z-index: 10;
    }

    .column-header.percentage {
      background: rgb(232 240 240);
      color: var(--primary-color);
      min-width: 60px;
    }

    .group-row.main-group {
      background: var(--gray-50);
      cursor: pointer;
      transition: background-color 0.2s;
      font-weight: 600;
    }

    .group-row.main-group:hover {
      background: var(--gray-100);
    }

    .group-row.client-group {
      background: rgba(100, 206, 199, 0.1);
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .group-row.client-group:hover {
      background: rgba(100, 206, 199, 0.2);
    }

    .client-indent {
      width: 40px;
      background: rgba(100, 206, 199, 0.1);
    }

    .client-cell {
      padding: 10px 16px;
      font-weight: 500;
      color: var(--secondary-color);
    }

    .client-summary {
      font-size: 12px;
      color: var(--gray-600);
      font-weight: normal;
      margin-left: 8px;
    }
    .group-summary {
      padding: 12px 16px;
      color: var(--gray-600);
      font-style: italic;
    }

    .mission-row {
      border-bottom: 1px solid var(--gray-100);
      transition: all 0.2s;
    }

    .mission-row:hover {
      background: var(--gray-50);
    }

    .mission-row.hidden {
      display: none;
    }

    .mission-indent {
      width: 60px;
      background: var(--gray-50);
    }

    .mission-row td {
      padding: 10px 12px;
      text-align: center;
      vertical-align: middle;
    }

    .percentage-cell {
      padding: 8px !important;
    }

    .progress-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 11px;
      margin: 0 auto;
      position: relative;
    }

    .progress-circle[data-percentage="0"] {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error-color);
    }

    .progress-circle[data-percentage="25"] {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning-color);
    }

    .progress-circle[data-percentage="50"] {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning-color);
    }

    .progress-circle[data-percentage="75"] {
      background: rgba(100, 206, 199, 0.1);
      color: var(--success-color);
    }

    .progress-circle[data-percentage="100"] {
      background: rgba(100, 206, 199, 0.1);
      color: var(--success-color);
    }

    .status-cell {
      padding: 8px !important;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .status-cell:hover {
      background: rgba(34, 109, 104, 0.1);
    }

    .status-icon {
      font-size: 16px;
      display: inline-block;
      transition: all 0.2s ease;
    }

    .status-icon.completed {
      color: var(--success-color);
    }

    .status-icon:not(.completed) {
      color: var(--warning-color);
    }

    .collapse-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 12px;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .group-info {
      display: flex;
      gap: 0.5vw;
      align-items: center;
    }

    .collapse-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    .column-group-header .collapse-btn {
      margin-right: 8px;
    }

    .pagination-footer {
      flex-shrink: 0;
      padding: 16px 24px;
    }

    .page-numbers {
      display: flex;
      gap: 4px;
    }

    .page-btn {
      padding: 8px 12px;
      border: 1px solid var(--gray-300);
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      min-width: 40px;
      transition: all 0.2s;
    }

    .page-btn:hover {
      background: var(--gray-50);
      border-color: var(--primary-color);
    }

    .page-btn.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .page-btn.ellipsis {
      background: var(--gray-100);
      color: var(--gray-500);
      border-color: var(--gray-200);
      cursor: default;
      pointer-events: none;
    }

    .page-btn.empty {
      background: transparent;
      border-color: transparent;
      cursor: default;
      pointer-events: none;
      visibility: hidden;
    }

    .page-numbers {
      display: flex;
      gap: 4px;
      justify-content: center;
    }

    .pagination-container {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .header-controls {
        width: 100%;
        justify-content: flex-end;
      }
      
      .table-controls {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }
      
      .pagination-controls {
        justify-content: center;
      }
      
      .pagination-container {
        flex-direction: column;
        gap: 12px;
      }
      
      .mission-count-display {
        text-align: center;
      }
      
      .page-numbers {
        display: none;
      }
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
      z-index: 1000;
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
      background: var(--primary-color);
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

    .form-group {
      margin-bottom: 20px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
    }

    .status-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .checkbox-text {
      color: var(--gray-700);
    }

    .file-input {
      width: 100%;
      padding: 10px 12px;
      border: 2px dashed var(--gray-300);
      border-radius: 8px;
      background: var(--gray-50);
      cursor: pointer;
      transition: all 0.2s;
    }

    .file-input:hover {
      border-color: var(--primary-color);
      background: rgba(34, 109, 104, 0.05);
    }

    .file-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--gray-100);
      border-radius: 6px;
      margin-top: 8px;
    }

    .file-name {
      font-size: 14px;
      color: var(--gray-700);
    }

    .remove-file {
      background: var(--error-color);
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-file:hover {
      background: #dc2626;
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

    .btn-save {
      padding: 10px 20px;
      border: none;
      background: var(--primary-color);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-save:hover {
      background: var(--primary-dark);
    }

    @media (max-width: 1200px) {
      .mission-table {
        font-size: 12px;
      }
      
      .column-header,
      .mission-row td {
        padding: 8px 6px;
      }
      
      .progress-circle {
        width: 35px;
        height: 35px;
        font-size: 10px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  avantMissionCollapsed = false;
  pendantMissionCollapsed = false;
  finMissionCollapsed = false;
  allGroupsExpanded = true;

  groupedData: GroupData[] = [];
  paginatedData: GroupData[] = [];
  allMissions: MissionData[] = [];
  completeGroupedData: GroupData[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalMissions = 0;
  totalPages = 0;
  startIndex = 0;
  endIndex = 0;

  currentUser: UserProfile | null = null;
  userEmail: string = '';

  public modalData: ModalData = {
    isOpen: false,
    columnName: '',
    missionId: '',
    currentStatus: false,
    selectedFile: null
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(user => {
      this.currentUser = user;
      this.userEmail = user?.mail || '';
      this.initializeData();
      this.updatePagination();
    });
  }

  initializeData(): void {
    // Récupérer les données des missions depuis l'API
    this.http.get<{ success: boolean; data: MissionData[]; count: number; timestamp: string }>(`${environment.apiUrl}/missions/getAllMissionsDashboard/${this.userEmail}`)
      .subscribe((response) => {
        let data = response.data;
        
        const realData: MissionData[] = data;

        // Grouper d'abord par numeroGroupe, puis par numeroClient
        const groupedByGroupe = realData.reduce((acc, mission) => {
          const groupKey = mission.numeroGroupe;
          if (!acc[groupKey]) {
            acc[groupKey] = {
              numeroGroupe: mission.numeroGroupe,
              nomGroupe: mission.nomGroupe,
              missions: []
            };
          }
          acc[groupKey].missions.push(mission);
          return acc;
        }, {} as { [key: string]: { numeroGroupe: string; nomGroupe: string; missions: MissionData[] } });

        // Créer la structure finale avec double groupement
        this.groupedData = Object.values(groupedByGroupe).map(group => {
          // Grouper les missions par numeroClient
          const clientGroups = group.missions.reduce((acc, mission) => {
            const clientKey = mission.numeroClient;
            if (!acc[clientKey]) {
              acc[clientKey] = {
                numeroClient: mission.numeroClient,
                nomClient: mission.nomClient,
                missions: [],
                expanded: true
              };
            }
            acc[clientKey].missions.push(mission);
            return acc;
          }, {} as { [key: string]: ClientGroup });

          return {
            numeroGroupe: group.numeroGroupe,
            nomGroupe: group.nomGroupe,
            clients: Object.values(clientGroups),
            expanded: true
          };
        });

        this.totalMissions = this.groupedData.reduce((total, group) => 
          total + group.clients.reduce((clientTotal, client) => 
            clientTotal + client.missions.length, 0), 0);
        
        // Sauvegarder les données complètes pour les compteurs
        this.completeGroupedData = JSON.parse(JSON.stringify(this.groupedData));
        
        // Créer une liste plate de toutes les missions pour la pagination
        this.allMissions = this.groupedData.flatMap(group => 
          group.clients.flatMap(client => client.missions)
        );
        
        this.updatePagination();
      }, (error) => {
        console.error('Erreur lors de la récupération des missions :', error);
      });
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.totalMissions / this.itemsPerPage);
    this.startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.endIndex = Math.min(this.startIndex + this.itemsPerPage, this.totalMissions);
    
    // Obtenir les missions paginées
    const paginatedMissions = this.allMissions.slice(this.startIndex, this.endIndex);
    
    // Reconstruire la structure groupée avec seulement les missions paginées
    const groupedPaginated = new Map<string, GroupData>();
    
    paginatedMissions.forEach(mission => {
      const groupKey = mission.numeroGroupe;
      const clientKey = mission.numeroClient;
      
      if (!groupedPaginated.has(groupKey)) {
        groupedPaginated.set(groupKey, {
          numeroGroupe: mission.numeroGroupe,
          nomGroupe: mission.nomGroupe,
          clients: new Map<string, ClientGroup>(),
          expanded: true
        } as any);
      }
      
      const group = groupedPaginated.get(groupKey)!;
      const clientsMap = group.clients as any;
      
      if (!clientsMap.has(clientKey)) {
        clientsMap.set(clientKey, {
          numeroClient: mission.numeroClient,
          nomClient: mission.nomClient,
          missions: [],
          expanded: true
        });
      }
      
      clientsMap.get(clientKey).missions.push(mission);
    });
    
    // Convertir les Maps en arrays
    this.paginatedData = Array.from(groupedPaginated.values()).map(group => ({
      ...group,
      clients: Array.from((group.clients as any).values())
    }));
    
    // Synchroniser l'état d'expansion avec les données complètes
    this.syncExpansionState();
    
    // Mettre à jour l'état du bouton
    this.updateAllGroupsExpandedState();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    
    if (this.totalPages <= 7) {
      // Si 7 pages ou moins, afficher seulement les pages existantes
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Plus de 7 pages : logique avec ellipses
    // Toujours inclure la page 1
    pages.push(1);
    
    if (this.currentPage <= 3) {
      // Début : 1, 2, 3, 4, 5, ..., dernière
      pages.push(2, 3, 4, 5, '...', this.totalPages);
    } else if (this.currentPage >= this.totalPages - 2) {
      // Fin : 1, ..., avant-4, avant-3, avant-2, avant-1, dernière
      pages.push('...', this.totalPages - 4, this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages);
    } else {
      // Milieu : toujours afficher page-1, page, page+1
      // Format : 1, ..., courante-1, courante, courante+1, ..., dernière
      pages.push('...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages);
    }
    
    return pages;
  }

  toggleColumnGroup(group: 'avantMission' | 'pendantMission' | 'finMission'): void {
    switch (group) {
      case 'avantMission':
        this.avantMissionCollapsed = !this.avantMissionCollapsed;
        break;
      case 'pendantMission':
        this.pendantMissionCollapsed = !this.pendantMissionCollapsed;
        break;
      case 'finMission':
        this.finMissionCollapsed = !this.finMissionCollapsed;
        break;
    }
  }

  toggleMainGroup(index: number): void {
    this.paginatedData[index].expanded = !this.paginatedData[index].expanded;
    
    // Synchroniser avec les données complètes
    const completeGroup = this.completeGroupedData.find(g => g.numeroGroupe === this.paginatedData[index].numeroGroupe);
    if (completeGroup) {
      completeGroup.expanded = this.paginatedData[index].expanded;
    }
    
    // Quand on ouvre/ferme le groupe, synchroniser tous les clients avec l'état du groupe
    this.paginatedData[index].clients.forEach(client => {
      client.expanded = this.paginatedData[index].expanded;
      
      // Synchroniser avec les données complètes
      if (completeGroup) {
        const completeClient = completeGroup.clients.find(c => c.numeroClient === client.numeroClient);
        if (completeClient) {
          completeClient.expanded = client.expanded;
        }
      }
    });
    
    // Mettre à jour l'état du bouton
    this.updateAllGroupsExpandedState();
  }

  toggleClientGroup(groupIndex: number, clientIndex: number): void {
    this.paginatedData[groupIndex].clients[clientIndex].expanded = 
      !this.paginatedData[groupIndex].clients[clientIndex].expanded;
    
    // Synchroniser avec les données complètes
    const completeGroup = this.completeGroupedData.find(g => g.numeroGroupe === this.paginatedData[groupIndex].numeroGroupe);
    if (completeGroup) {
      const completeClient = completeGroup.clients.find(c => c.numeroClient === this.paginatedData[groupIndex].clients[clientIndex].numeroClient);
      if (completeClient) {
        completeClient.expanded = this.paginatedData[groupIndex].clients[clientIndex].expanded;
      }
    }
    
    // Mettre à jour l'état du bouton
    this.updateAllGroupsExpandedState();
  }

  toggleAllGroups(): void {
    this.allGroupsExpanded = !this.allGroupsExpanded;
    
    // Mettre à jour les données complètes
    this.completeGroupedData.forEach(group => {
      group.expanded = this.allGroupsExpanded;
      group.clients.forEach(client => {
        client.expanded = this.allGroupsExpanded;
      });
    });
    
    // Mettre à jour les données paginées
    this.paginatedData.forEach(group => {
      group.expanded = this.allGroupsExpanded;
      group.clients.forEach(client => {
        client.expanded = this.allGroupsExpanded;
      });
    });
  }

  private syncExpansionState(): void {
    // Synchroniser l'état d'expansion des données paginées avec les données complètes
    this.paginatedData.forEach(paginatedGroup => {
      const completeGroup = this.completeGroupedData.find(g => g.numeroGroupe === paginatedGroup.numeroGroupe);
      if (completeGroup) {
        paginatedGroup.expanded = completeGroup.expanded;
        
        paginatedGroup.clients.forEach(paginatedClient => {
          const completeClient = completeGroup.clients.find(c => c.numeroClient === paginatedClient.numeroClient);
          if (completeClient) {
            paginatedClient.expanded = completeClient.expanded;
          }
        });
      }
    });
  }

  private updateAllGroupsExpandedState(): void {
    // Vérifier si tous les groupes et clients sont développés
    const allExpanded = this.completeGroupedData.every(group => 
      group.expanded && group.clients.every(client => client.expanded)
    );
    
    this.allGroupsExpanded = allExpanded;
  }

  getTotalMissionsInGroup(group: GroupData): number {
    // Trouver le groupe complet correspondant
    const completeGroup = this.completeGroupedData.find(g => g.numeroGroupe === group.numeroGroupe);
    if (!completeGroup) return 0;
    
    return completeGroup.clients.reduce((total, client) => total + client.missions.length, 0);
  }

  getTotalClientsInGroup(group: GroupData): number {
    // Trouver le groupe complet correspondant
    const completeGroup = this.completeGroupedData.find(g => g.numeroGroupe === group.numeroGroupe);
    if (!completeGroup) return 0;
    
    return completeGroup.clients.length;
  }

  getTotalMissionsInClient(group: GroupData, client: ClientGroup): number {
    // Trouver le groupe complet correspondant
    const completeGroup = this.completeGroupedData.find(g => g.numeroGroupe === group.numeroGroupe);
    if (!completeGroup) return 0;
    
    // Trouver le client complet correspondant
    const completeClient = completeGroup.clients.find(c => c.numeroClient === client.numeroClient);
    if (!completeClient) return 0;
    
    return completeClient.missions.length;
  }

  getMainGroupAverage(group: GroupData): number {
    const allMissions = group.clients.flatMap(client => client.missions);
    if (allMissions.length === 0) return 0;
    
    const total = allMissions.reduce((sum, mission) => {
      const avg = (mission.avantMission.percentage + mission.pendantMission.percentage + mission.finMission.percentage) / 3;
      return sum + avg;
    }, 0);
    
    return Math.round(total / allMissions.length);
  }

  getClientAverage(client: ClientGroup, phase: 'avantMission' | 'pendantMission' | 'finMission'): number {
    if (client.missions.length === 0) return 0;
    
    const total = client.missions.reduce((sum, mission) => {
      return sum + mission[phase].percentage;
    }, 0);
    
    return Math.round(total / client.missions.length);
  }

  public openStatusModal(columnName: string, missionId: string, currentStatus: boolean): void {
    this.modalData = {
      isOpen: true,
      columnName: columnName,
      missionId: missionId,
      currentStatus: currentStatus,
      selectedFile: null
    };
  }

  public closeModal(): void {
    this.modalData.isOpen = false;
    this.modalData.selectedFile = null;
  }

  public onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.modalData.selectedFile = target.files[0];
    }
  }

  public removeFile(): void {
    this.modalData.selectedFile = null;
  }

  public saveStatus(): void {
    // Ici vous pouvez ajouter la logique pour sauvegarder le statut
    console.log('Sauvegarde:', {
      columnName: this.modalData.columnName,
      missionId: this.modalData.missionId,
      status: this.modalData.currentStatus,
      file: this.modalData.selectedFile
    });
    
    // Fermer le modal après sauvegarde
    this.closeModal();
  }
}