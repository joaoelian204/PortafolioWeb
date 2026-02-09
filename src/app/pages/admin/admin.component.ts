import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ProfileInfo, Project, Skill, SkillCategory } from '../../core/models/database.types';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';

type AdminTab = 'profile' | 'skills' | 'projects';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  template: `
    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <svg viewBox="0 0 16 16" fill="currentColor" class="logo-icon">
              <path
                d="M14.5 2H9l-1 1v4l1 1h5.5l.5-.5v-5l-.5-.5zM14 7H9V3h5v4zM6 9H1l-1 1v4l1 1h5l1-1v-4l-1-1zm0 5H1v-4h5v4zm8-1h-5l-1-1V8l1-1h5l1 1v4l-1 1zm0-5H9v4h5V8zM6 2H1L0 3v4l1 1h5l1-1V3L6 2zm0 5H1V3h5v4z"
              />
            </svg>
            <span class="logo-text">Admin</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <span class="nav-label">{{ i18n.language() === 'es' ? 'MENÚ' : 'MENU' }}</span>
            <button
              class="nav-item"
              [class.active]="activeTab() === 'profile'"
              (click)="activeTab.set('profile')"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 10c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"
                />
              </svg>
              <span>{{ i18n.t('admin.profile') }}</span>
            </button>
            <button
              class="nav-item"
              [class.active]="activeTab() === 'skills'"
              (click)="activeTab.set('skills')"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M2.5 1l-.5.5v13l.5.5h11l.5-.5v-13l-.5-.5h-11zM3 14V2h10v12H3zm2-9h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z"
                />
              </svg>
              <span>{{ i18n.t('admin.skills') }}</span>
            </button>
            <button
              class="nav-item"
              [class.active]="activeTab() === 'projects'"
              (click)="activeTab.set('projects')"
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10l-.5-.5zm-.5 10H2V6h12v7zm0-8H2V3h4.29l.85.85.36.15H14v1z"
                />
              </svg>
              <span>{{ i18n.t('admin.projects') }}</span>
            </button>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
              </svg>
            </div>
            <div class="user-details">
              <span class="user-email">{{ supabase.currentUser()?.email }}</span>
              <span class="user-role">{{
                i18n.language() === 'es' ? 'Administrador' : 'Administrator'
              }}</span>
            </div>
          </div>
          <button
            class="logout-btn"
            (click)="logout()"
            [title]="i18n.language() === 'es' ? 'Cerrar Sesión' : 'Logout'"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M11.5 9.5l1.5-1.5-1.5-1.5-.71.71.65.64H8v1h3.44l-.65.64.71.71zM13 3H9v1h4v8H9v1h4.5l.5-.5v-9l-.5-.5z"
              />
              <path d="M1 3.5l.5-.5H7v1H2v8h5v1H1.5l-.5-.5v-9z" />
            </svg>
          </button>
        </div>
      </aside>

      <!-- Mobile Header -->
      <header class="mobile-header">
        <h1 class="mobile-title">{{ i18n.t('admin.title') }}</h1>
        <button class="logout-btn-mobile" (click)="logout()">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M11.5 9.5l1.5-1.5-1.5-1.5-.71.71.65.64H8v1h3.44l-.65.64.71.71zM13 3H9v1h4v8H9v1h4.5l.5-.5v-9l-.5-.5z"
            />
            <path d="M1 3.5l.5-.5H7v1H2v8h5v1H1.5l-.5-.5v-9z" />
          </svg>
        </button>
      </header>

      <!-- Mobile Tabs -->
      <nav class="mobile-tabs">
        <button
          class="mobile-tab"
          [class.active]="activeTab() === 'profile'"
          (click)="activeTab.set('profile')"
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
          </svg>
          <span>{{ i18n.t('admin.profile') }}</span>
        </button>
        <button
          class="mobile-tab"
          [class.active]="activeTab() === 'skills'"
          (click)="activeTab.set('skills')"
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.5 1l-.5.5v13l.5.5h11l.5-.5v-13l-.5-.5h-11zM3 14V2h10v12H3z" />
          </svg>
          <span>{{ i18n.t('admin.skills') }}</span>
        </button>
        <button
          class="mobile-tab"
          [class.active]="activeTab() === 'projects'"
          (click)="activeTab.set('projects')"
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10l-.5-.5z" />
          </svg>
          <span>{{ i18n.t('admin.projects') }}</span>
        </button>
      </nav>

      <!-- Content -->
      <main class="admin-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">
              @switch (activeTab()) {
                @case ('profile') {
                  {{ i18n.t('admin.profile') }}
                }
                @case ('skills') {
                  {{ i18n.t('admin.skills') }}
                }
                @case ('projects') {
                  {{ i18n.t('admin.projects') }}
                }
              }
            </h1>
            <p class="page-description">
              @switch (activeTab()) {
                @case ('profile') {
                  {{
                    i18n.language() === 'es'
                      ? 'Gestiona tu información personal y redes sociales'
                      : 'Manage your personal information and social networks'
                  }}
                }
                @case ('skills') {
                  {{
                    i18n.language() === 'es'
                      ? 'Administra tus habilidades y tecnologías'
                      : 'Manage your skills and technologies'
                  }}
                }
                @case ('projects') {
                  {{
                    i18n.language() === 'es'
                      ? 'Gestiona tu portafolio de proyectos'
                      : 'Manage your project portfolio'
                  }}
                }
              }
            </p>
          </div>
          @if (activeTab() === 'skills') {
            <button class="btn btn-primary" (click)="openSkillModal()">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                />
              </svg>
              {{ i18n.language() === 'es' ? 'Nueva Habilidad' : 'New Skill' }}
            </button>
          }
          @if (activeTab() === 'projects') {
            <button class="btn btn-primary" (click)="openProjectModal()">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                />
              </svg>
              {{ i18n.language() === 'es' ? 'Nuevo Proyecto' : 'New Project' }}
            </button>
          }
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm-.5-9h1v5h-1V5zm0 6h1v1h-1v-1z"
              />
            </svg>
            <span>{{ errorMessage() }}</span>
            <button class="alert-close" (click)="errorMessage.set(null)">×</button>
          </div>
        }
        @if (successMessage()) {
          <div class="alert alert-success">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"
              />
            </svg>
            <span>{{ successMessage() }}</span>
            <button class="alert-close" (click)="successMessage.set(null)">×</button>
          </div>
        }
        @switch (activeTab()) {
          @case ('profile') {
            <section class="section">
              <div class="section-card">
                <div class="card-header">
                  <h3 class="card-title">
                    {{ i18n.language() === 'es' ? 'Información Personal' : 'Personal Information' }}
                  </h3>
                </div>
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="form">
                  <div class="form-row">
                    <div class="form-group">
                      <label class="label">{{ i18n.t('admin.name') }}</label>
                      <input type="text" formControlName="name" class="input" />
                    </div>
                    <div class="form-group">
                      <label class="label">{{
                        i18n.language() === 'es' ? 'Título' : 'Title'
                      }}</label>
                      <input type="text" formControlName="title" class="input" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="label">{{ i18n.t('admin.bio') }}</label>
                    <textarea formControlName="bio" class="input textarea" rows="4"></textarea>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="label">{{ i18n.t('admin.email') }}</label>
                      <input type="email" formControlName="email" class="input" />
                    </div>
                    <div class="form-group">
                      <label class="label">{{
                        i18n.language() === 'es' ? 'Ubicación' : 'Location'
                      }}</label>
                      <input type="text" formControlName="location" class="input" />
                    </div>
                  </div>

                  <h3 class="subsection-title">
                    {{ i18n.language() === 'es' ? 'Enlaces Sociales' : 'Social Links' }}
                  </h3>

                  <!-- Social Links Grid -->
                  <div class="social-links-container">
                    @if (socialLinks().length === 0) {
                      <div class="empty-social-state">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        <p>
                          {{
                            i18n.language() === 'es'
                              ? 'No tienes enlaces sociales agregados'
                              : 'No social links added yet'
                          }}
                        </p>
                      </div>
                    }

                    <div class="social-links-grid">
                      @for (link of socialLinks(); track link.type) {
                        <div class="social-link-card">
                          <div
                            class="social-link-icon"
                            [innerHTML]="getSocialIcon(link.type)"
                          ></div>
                          <div class="social-link-info">
                            <span class="social-link-name">{{ getSocialName(link.type) }}</span>
                            <a [href]="link.url" target="_blank" class="social-link-url">{{
                              link.url
                            }}</a>
                          </div>
                          <div class="social-link-actions">
                            <button
                              type="button"
                              class="social-action-btn"
                              (click)="editSocialLink(link)"
                              [title]="i18n.language() === 'es' ? 'Editar' : 'Edit'"
                            >
                              <svg viewBox="0 0 16 16" fill="currentColor">
                                <path
                                  d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              class="social-action-btn social-action-btn-danger"
                              (click)="removeSocialLink(link.type)"
                              [title]="i18n.language() === 'es' ? 'Eliminar' : 'Remove'"
                            >
                              <svg viewBox="0 0 16 16" fill="currentColor">
                                <path
                                  d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      }
                    </div>

                    <button type="button" class="add-social-btn" (click)="openSocialModal()">
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path
                          d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                        />
                      </svg>
                      {{ i18n.language() === 'es' ? 'Agregar Red Social' : 'Add Social Network' }}
                    </button>
                  </div>

                  <!-- CV Upload Section -->
                  <h3 class="subsection-title">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      style="width: 20px; height: 20px; margin-right: 8px;"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    {{ i18n.language() === 'es' ? 'Currículum Vitae (CV)' : 'Resume / CV' }}
                  </h3>

                  <div class="cv-upload-section">
                    @if (currentCvUrl()) {
                      <div class="current-cv">
                        <div class="cv-info">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            class="cv-icon"
                          >
                            <path
                              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                            ></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                          <span class="cv-filename">CV.pdf</span>
                        </div>
                        <div class="cv-actions">
                          <a
                            [href]="currentCvUrl()"
                            target="_blank"
                            class="btn btn-sm btn-secondary"
                          >
                            <svg
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              style="width: 14px; height: 14px;"
                            >
                              <path
                                d="M6.823 7.823a.25.25 0 0 1 0-.354l2.5-2.5a.25.25 0 0 1 .354.354L7.53 7.47l2.147 2.146a.25.25 0 0 1-.354.354l-2.5-2.5z"
                              />
                              <path
                                d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h4.768l.417-1.667A.5.5 0 0 1 6.67 1h2.66a.5.5 0 0 1 .485.333L10.232 3H14.5zM4.5 6.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm3 2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
                              />
                            </svg>
                            {{ i18n.language() === 'es' ? 'Ver' : 'View' }}
                          </a>
                          <button type="button" class="btn btn-sm btn-danger" (click)="deleteCv()">
                            <svg
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              style="width: 14px; height: 14px;"
                            >
                              <path
                                d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
                              />
                              <path
                                fill-rule="evenodd"
                                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                              />
                            </svg>
                            {{ i18n.language() === 'es' ? 'Eliminar' : 'Delete' }}
                          </button>
                        </div>
                      </div>
                    }

                    <div class="cv-upload-area" [class.has-file]="currentCvUrl()">
                      <input
                        type="file"
                        id="cv-upload"
                        accept=".pdf"
                        (change)="onCvFileSelected($event)"
                        class="file-input"
                        #cvFileInput
                      />
                      <label for="cv-upload" class="upload-label">
                        @if (isUploadingCv()) {
                          <div class="upload-spinner"></div>
                          <span>{{
                            i18n.language() === 'es' ? 'Subiendo...' : 'Uploading...'
                          }}</span>
                        } @else {
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            class="upload-icon"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          <span>
                            {{
                              currentCvUrl()
                                ? i18n.language() === 'es'
                                  ? 'Cambiar CV (PDF)'
                                  : 'Change CV (PDF)'
                                : i18n.language() === 'es'
                                  ? 'Subir CV (PDF)'
                                  : 'Upload CV (PDF)'
                            }}
                          </span>
                        }
                      </label>
                    </div>
                    <p class="cv-hint">
                      {{
                        i18n.language() === 'es'
                          ? 'Solo archivos PDF. El archivo se sobrescribirá si subes uno nuevo.'
                          : 'PDF files only. The file will be overwritten if you upload a new one.'
                      }}
                    </p>
                  </div>

                  <div class="form-actions">
                    <button type="submit" class="btn btn-primary" [disabled]="isSaving()">
                      @if (isSaving()) {
                        {{ i18n.language() === 'es' ? 'Guardando...' : 'Saving...' }}
                      } @else {
                        {{ i18n.t('admin.save') }} {{ i18n.t('admin.profile') }}
                      }
                    </button>
                  </div>
                </form>
              </div>
            </section>
          }

          @case ('skills') {
            <section class="section">
              <div class="section-card">
                <div class="card-header">
                  <h3 class="card-title">
                    {{ i18n.language() === 'es' ? 'Lista de Habilidades' : 'Skills List' }}
                  </h3>
                  <span class="card-badge"
                    >{{ skills().length }}
                    {{ i18n.language() === 'es' ? 'registros' : 'items' }}</span
                  >
                </div>
                <div class="table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>{{ i18n.t('admin.label') }}</th>
                        <th>{{ i18n.t('admin.category') }}</th>
                        <th>{{ i18n.language() === 'es' ? 'Destacado' : 'Featured' }}</th>
                        <th>{{ i18n.language() === 'es' ? 'Acciones' : 'Actions' }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (skill of skills(); track skill.id) {
                        <tr>
                          <td>
                            <span class="skill-label">{{ skill.label }}</span>
                          </td>
                          <td>
                            <span class="badge" [attr.data-category]="skill.category">
                              {{ skill.category }}
                            </span>
                          </td>
                          <td>
                            @if (skill.is_featured) {
                              <span class="badge badge-success">{{
                                i18n.language() === 'es' ? 'Sí' : 'Yes'
                              }}</span>
                            } @else {
                              <span class="badge badge-muted">{{
                                i18n.language() === 'es' ? 'No' : 'No'
                              }}</span>
                            }
                          </td>
                          <td>
                            <div class="actions">
                              <button
                                class="action-btn"
                                (click)="editSkill(skill)"
                                [title]="i18n.t('admin.edit')"
                              >
                                <svg viewBox="0 0 16 16" fill="currentColor">
                                  <path
                                    d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z"
                                  />
                                </svg>
                              </button>
                              <button
                                class="action-btn action-btn-danger"
                                (click)="deleteSkill(skill.id)"
                                [title]="i18n.t('admin.delete')"
                              >
                                <svg viewBox="0 0 16 16" fill="currentColor">
                                  <path
                                    d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          }

          @case ('projects') {
            <section class="section">
              <div class="section-card">
                <div class="card-header">
                  <h3 class="card-title">
                    {{ i18n.language() === 'es' ? 'Lista de Proyectos' : 'Projects List' }}
                  </h3>
                  <span class="card-badge"
                    >{{ projects().length }}
                    {{ i18n.language() === 'es' ? 'registros' : 'items' }}</span
                  >
                </div>
                <div class="projects-grid">
                  @for (project of projects(); track project.id) {
                    <div class="project-card">
                      <div class="project-header">
                        <h3 class="project-title">{{ project.title }}</h3>
                        <div class="project-badges">
                          @if (project.is_featured) {
                            <span class="badge badge-primary">{{
                              i18n.language() === 'es' ? 'Destacado' : 'Featured'
                            }}</span>
                          }
                          @if (!project.is_published) {
                            <span class="badge badge-warning">{{
                              i18n.language() === 'es' ? 'Borrador' : 'Draft'
                            }}</span>
                          }
                        </div>
                      </div>
                      <p class="project-description">{{ project.description }}</p>
                      <div class="project-tech">
                        @for (tech of project.tech_stack; track tech) {
                          <span class="tech-tag">{{ tech }}</span>
                        }
                      </div>
                      <div class="project-actions">
                        <button class="btn btn-secondary btn-sm" (click)="editProject(project)">
                          {{ i18n.t('admin.edit') }}
                        </button>
                        <button class="btn btn-danger btn-sm" (click)="deleteProject(project.id)">
                          {{ i18n.t('admin.delete') }}
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </section>
          }
        }
      </main>

      <!-- Social Link Modal -->
      @if (showSocialModal()) {
        <div class="modal-overlay">
          <div class="modal social-modal">
            <div class="modal-header">
              <h3>
                {{
                  editingSocialLink()
                    ? i18n.language() === 'es'
                      ? 'Editar Red Social'
                      : 'Edit Social Network'
                    : i18n.language() === 'es'
                      ? 'Agregar Red Social'
                      : 'Add Social Network'
                }}
              </h3>
              <button class="modal-close" (click)="closeSocialModal()">×</button>
            </div>
            <div class="modal-body">
              @if (!editingSocialLink() && !selectedSocialType()) {
                <!-- Step 1: Select social network -->
                <div class="social-select-grid">
                  @for (social of availableSocialNetworks(); track social.type) {
                    <button
                      type="button"
                      class="social-select-item"
                      (click)="selectSocialType(social.type)"
                    >
                      <div
                        class="social-select-icon"
                        [innerHTML]="getSocialIcon(social.type)"
                      ></div>
                      <span>{{ social.name }}</span>
                    </button>
                  }
                </div>
              } @else {
                <!-- Step 2: Enter URL -->
                <div class="social-url-form">
                  <div class="selected-social-header">
                    <div
                      class="selected-social-icon"
                      [innerHTML]="
                        getSocialIcon(selectedSocialType() || editingSocialLink()?.type || '')
                      "
                    ></div>
                    <span class="selected-social-name">{{
                      getSocialName(selectedSocialType() || editingSocialLink()?.type || '')
                    }}</span>
                  </div>
                  <div class="form-group">
                    <label class="label">{{
                      i18n.language() === 'es' ? 'URL del perfil' : 'Profile URL'
                    }}</label>
                    <input
                      type="url"
                      class="input"
                      [(ngModel)]="socialLinkUrl"
                      [placeholder]="
                        getSocialPlaceholder(
                          selectedSocialType() || editingSocialLink()?.type || ''
                        )
                      "
                    />
                  </div>
                  <div class="modal-actions">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      (click)="editingSocialLink() ? closeSocialModal() : backToSocialSelect()"
                    >
                      {{
                        editingSocialLink()
                          ? i18n.language() === 'es'
                            ? 'Cancelar'
                            : 'Cancel'
                          : i18n.language() === 'es'
                            ? 'Volver'
                            : 'Back'
                      }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-primary"
                      (click)="saveSocialLink()"
                      [disabled]="!socialLinkUrl.trim()"
                    >
                      {{ i18n.language() === 'es' ? 'Guardar' : 'Save' }}
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Skill Modal -->
      @if (showSkillModal()) {
        <div class="modal-overlay">
          <div class="modal">
            <div class="modal-header">
              <h3>
                {{
                  editingSkill()
                    ? i18n.language() === 'es'
                      ? 'Editar Habilidad'
                      : 'Edit Skill'
                    : i18n.language() === 'es'
                      ? 'Agregar Habilidad'
                      : 'Add Skill'
                }}
              </h3>
              <button class="modal-close" (click)="closeSkillModal()">×</button>
            </div>
            <form [formGroup]="skillForm" (ngSubmit)="saveSkill()" class="modal-body">
              <div class="form-group">
                <label class="label">{{ i18n.t('admin.label') }} *</label>
                <input type="text" formControlName="label" class="input" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="label">{{ i18n.t('admin.category') }} *</label>
                  <select formControlName="category" class="input">
                    <option value="languages">
                      {{ i18n.language() === 'es' ? 'Lenguajes' : 'Languages' }}
                    </option>
                    <option value="frameworks">
                      {{ i18n.language() === 'es' ? 'Frameworks' : 'Frameworks' }}
                    </option>
                    <option value="databases">
                      {{ i18n.language() === 'es' ? 'Bases de Datos' : 'Databases' }}
                    </option>
                    <option value="tools">
                      {{ i18n.language() === 'es' ? 'Herramientas' : 'Tools' }}
                    </option>
                    <option value="other">
                      {{ i18n.language() === 'es' ? 'Otros' : 'Other' }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="label">{{ i18n.t('admin.icon') }}</label>
                  <input
                    type="text"
                    formControlName="icon"
                    class="input"
                    [placeholder]="
                      i18n.language() === 'es' ? 'ej., typescript' : 'e.g., typescript'
                    "
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="label">{{ i18n.language() === 'es' ? 'Orden' : 'Sort Order' }}</label>
                <input type="number" formControlName="sort_order" class="input" />
              </div>
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="is_featured" />
                  <span>{{
                    i18n.language() === 'es' ? 'Habilidad Destacada' : 'Featured Skill'
                  }}</span>
                </label>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeSkillModal()">
                  {{ i18n.t('admin.cancel') }}
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="skillForm.invalid || isSaving()"
                >
                  @if (isSaving()) {
                    {{ i18n.language() === 'es' ? 'Guardando...' : 'Saving...' }}
                  } @else {
                    {{ i18n.t('admin.save') }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Project Modal -->
      @if (showProjectModal()) {
        <div class="modal-overlay">
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3>
                {{
                  editingProject()
                    ? i18n.language() === 'es'
                      ? 'Editar Proyecto'
                      : 'Edit Project'
                    : i18n.language() === 'es'
                      ? 'Agregar Proyecto'
                      : 'Add Project'
                }}
              </h3>
              <button class="modal-close" (click)="closeProjectModal()">×</button>
            </div>
            <form [formGroup]="projectForm" (ngSubmit)="saveProject()" class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="label">{{ i18n.t('admin.titleField') }} *</label>
                  <input
                    type="text"
                    formControlName="title"
                    class="input"
                    (input)="onTitleChange($event)"
                  />
                </div>
                <div class="form-group">
                  <label class="label">{{
                    i18n.language() === 'es' ? 'Slug (auto-generado)' : 'Slug (auto-generated)'
                  }}</label>
                  <input
                    type="text"
                    formControlName="slug"
                    class="input"
                    readonly
                    [placeholder]="i18n.language() === 'es' ? 'slug-del-proyecto' : 'project-slug'"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="label">{{ i18n.t('admin.description') }}</label>
                <textarea formControlName="description" class="input textarea" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label class="label"
                  >{{ i18n.t('admin.techStack') }} ({{
                    i18n.language() === 'es' ? 'separado por comas' : 'comma separated'
                  }})</label
                >
                <input
                  type="text"
                  formControlName="tech_stack_input"
                  class="input"
                  [placeholder]="
                    i18n.language() === 'es'
                      ? 'Angular, TypeScript, Supabase'
                      : 'Angular, TypeScript, Supabase'
                  "
                />
              </div>
              <div class="form-group">
                <label class="label">{{
                  i18n.language() === 'es' ? 'Imágenes del Proyecto' : 'Project Images'
                }}</label>
                <input
                  type="file"
                  #fileInput
                  multiple
                  accept="image/*"
                  (change)="onImagesSelected($event)"
                  class="input"
                />
                <small class="form-hint">{{
                  i18n.language() === 'es'
                    ? 'Selecciona una o más imágenes (máximo 10)'
                    : 'Select one or more images (max 10)'
                }}</small>

                @if (selectedImages().length > 0) {
                  <div class="image-preview-grid">
                    @for (image of selectedImages(); track $index) {
                      <div class="image-preview-item">
                        <img [src]="image.preview" [alt]="image.name" />
                        <button
                          type="button"
                          class="remove-image-btn"
                          (click)="removeImage($index)"
                        >
                          <svg viewBox="0 0 16 16" fill="currentColor">
                            <path
                              d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm3-8H5v1h6V6zm0 3H5v1h6V9z"
                            />
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                }

                @if (projectImages().length > 0) {
                  <div class="existing-images">
                    <label class="label-small">{{
                      i18n.language() === 'es' ? 'Imágenes existentes:' : 'Existing images:'
                    }}</label>
                    <div class="image-preview-grid">
                      @for (imageUrl of projectImages(); track $index) {
                        <div class="image-preview-item">
                          <img [src]="imageUrl" [alt]="'Image ' + ($index + 1)" />
                          <button
                            type="button"
                            class="remove-image-btn"
                            (click)="removeExistingImage($index)"
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path
                                d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm3-8H5v1h6V6zm0 3H5v1h6V9z"
                              />
                            </svg>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="label">{{ i18n.t('admin.liveLink') }}</label>
                  <input type="url" formControlName="live_link" class="input" />
                </div>
                <div class="form-group">
                  <label class="label">{{ i18n.t('admin.repoLink') }}</label>
                  <input type="url" formControlName="repo_link" class="input" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="is_featured" />
                    <span>{{
                      i18n.language() === 'es' ? 'Proyecto Destacado' : 'Featured Project'
                    }}</span>
                  </label>
                </div>
                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="is_published" />
                    <span>{{ i18n.language() === 'es' ? 'Publicado' : 'Published' }}</span>
                  </label>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeProjectModal()">
                  {{ i18n.t('admin.cancel') }}
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="projectForm.invalid || isSaving()"
                >
                  @if (isSaving()) {
                    {{ i18n.language() === 'es' ? 'Guardando...' : 'Saving...' }}
                  } @else {
                    {{ i18n.t('admin.save') }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .admin-container {
        min-height: 100vh;
        height: 100vh;
        display: flex;
        background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #0d0d1a 100%);
        color: #e4e4e7;
        overflow: hidden;
        font-family:
          'Segoe UI',
          system-ui,
          -apple-system,
          sans-serif;
      }

      /* Sidebar */
      .admin-sidebar {
        width: 260px;
        height: 100vh;
        background: linear-gradient(180deg, rgba(20, 20, 35, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
        border-right: 1px solid rgba(99, 102, 241, 0.15);
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        position: relative;
      }

      .sidebar-header {
        padding: 24px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo-icon {
        width: 32px;
        height: 32px;
        color: #818cf8;
        filter: drop-shadow(0 0 10px rgba(129, 140, 248, 0.5));
      }

      .logo-text {
        font-size: 20px;
        font-weight: 700;
        background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .sidebar-nav {
        flex: 1;
        padding: 20px 12px;
        overflow-y: auto;
      }

      .nav-section {
        margin-bottom: 24px;
      }

      .nav-label {
        display: block;
        font-size: 10px;
        font-weight: 600;
        color: #52525b;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        padding: 0 12px;
        margin-bottom: 12px;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 16px;
        background: transparent;
        border: none;
        color: #a1a1aa;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-radius: 10px;
        transition: all 0.2s ease;
        margin-bottom: 4px;
        text-align: left;
      }

      .nav-item:hover {
        color: #e4e4e7;
        background: rgba(255, 255, 255, 0.05);
      }

      .nav-item.active {
        color: #fff;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.2) 0%,
          rgba(139, 92, 246, 0.1) 100%
        );
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
      }

      .nav-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        width: 3px;
        height: 24px;
        background: linear-gradient(180deg, #818cf8 0%, #c084fc 100%);
        border-radius: 0 3px 3px 0;
      }

      .nav-item svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      .nav-item.active svg {
        color: #818cf8;
      }

      .sidebar-footer {
        padding: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .user-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.2) 0%,
          rgba(139, 92, 246, 0.1) 100%
        );
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .user-avatar svg {
        width: 18px;
        height: 18px;
        color: #818cf8;
      }

      .user-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .user-email {
        font-size: 12px;
        color: #d4d4d8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-role {
        font-size: 10px;
        color: #71717a;
      }

      .logout-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #f87171;
        cursor: pointer;
        border-radius: 10px;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .logout-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.4);
        transform: scale(1.05);
      }

      .logout-btn svg {
        width: 16px;
        height: 16px;
      }

      /* Mobile Header & Tabs */
      .mobile-header,
      .mobile-tabs {
        display: none;
      }

      /* Main Content */
      .admin-content {
        flex: 1;
        padding: 32px 40px;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .admin-content::-webkit-scrollbar {
        width: 8px;
      }

      .admin-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .admin-content::-webkit-scrollbar-thumb {
        background: linear-gradient(
          180deg,
          rgba(99, 102, 241, 0.3) 0%,
          rgba(139, 92, 246, 0.3) 100%
        );
        border-radius: 4px;
      }

      .admin-content::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
          180deg,
          rgba(99, 102, 241, 0.5) 0%,
          rgba(139, 92, 246, 0.5) 100%
        );
      }

      /* Alert Messages */
      .alert {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 20px;
        border-radius: 12px;
        margin-bottom: 24px;
        font-size: 14px;
        position: relative;
        backdrop-filter: blur(10px);
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .alert svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .alert-error {
        background: linear-gradient(
          135deg,
          rgba(239, 68, 68, 0.15) 0%,
          rgba(239, 68, 68, 0.05) 100%
        );
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #fca5a5;
      }

      .alert-success {
        background: linear-gradient(
          135deg,
          rgba(34, 197, 94, 0.15) 0%,
          rgba(34, 197, 94, 0.05) 100%
        );
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #86efac;
      }

      .alert-close {
        margin-left: auto;
        background: transparent;
        border: none;
        color: inherit;
        font-size: 22px;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s ease;
        opacity: 0.7;
      }

      .alert-close:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
      }

      /* Page Header */
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 28px;
        gap: 20px;
      }

      .page-header-content {
        flex: 1;
      }

      .page-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 8px;
        background: linear-gradient(135deg, #f4f4f5 0%, #d4d4d8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .page-description {
        font-size: 14px;
        color: #71717a;
        margin: 0;
        line-height: 1.5;
      }

      .section {
        background: transparent;
        padding: 0;
      }

      .section-card {
        background: linear-gradient(135deg, rgba(30, 30, 50, 0.6) 0%, rgba(20, 20, 40, 0.8) 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        overflow: hidden;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        margin-bottom: 24px;
      }

      .card-header {
        padding: 20px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(0, 0, 0, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-title {
        font-size: 15px;
        font-weight: 600;
        color: #e4e4e7;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .card-badge {
        font-size: 12px;
        color: #818cf8;
        background: rgba(99, 102, 241, 0.15);
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 500;
      }

      .card-body {
        padding: 24px;
      }

      .form {
        padding: 24px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .section-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 24px;
        color: #f4f4f5;
      }

      .section-header .section-title {
        margin: 0;
      }

      .subsection-title {
        font-size: 13px;
        font-weight: 600;
        color: #818cf8;
        margin: 28px 0 16px;
        text-transform: uppercase;
        letter-spacing: 1px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .subsection-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.3) 0%, transparent 100%);
      }

      /* Social Links System */
      .social-links-container {
        margin-bottom: 20px;
      }

      .empty-social-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px dashed rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        margin-bottom: 16px;
      }

      .empty-social-state svg {
        width: 48px;
        height: 48px;
        color: #52525b;
        margin-bottom: 12px;
      }

      .empty-social-state p {
        color: #71717a;
        font-size: 14px;
        margin: 0;
      }

      .social-links-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }

      .social-link-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: linear-gradient(135deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 40, 0.9) 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .social-link-card:hover {
        border-color: rgba(99, 102, 241, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }

      .social-link-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.15) 0%,
          rgba(139, 92, 246, 0.1) 100%
        );
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 10px;
        flex-shrink: 0;
      }

      .social-link-icon svg {
        width: 20px;
        height: 20px;
        color: #818cf8;
      }

      .social-link-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .social-link-name {
        font-size: 14px;
        font-weight: 600;
        color: #e4e4e7;
      }

      .social-link-url {
        font-size: 12px;
        color: #818cf8;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .social-link-url:hover {
        text-decoration: underline;
      }

      .social-link-actions {
        display: flex;
        gap: 8px;
      }

      .social-action-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #a1a1aa;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .social-action-btn:hover {
        background: rgba(99, 102, 241, 0.15);
        border-color: rgba(99, 102, 241, 0.3);
        color: #818cf8;
      }

      .social-action-btn-danger:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.3);
        color: #f87171;
      }

      .social-action-btn svg {
        width: 14px;
        height: 14px;
      }

      .add-social-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 14px 20px;
        background: transparent;
        border: 2px dashed rgba(99, 102, 241, 0.3);
        color: #818cf8;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .add-social-btn:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.5);
      }

      .add-social-btn svg {
        width: 18px;
        height: 18px;
      }

      /* Social Modal */
      .social-modal {
        max-width: 500px;
      }

      .social-select-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        padding: 8px 0;
      }

      .social-select-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 20px 12px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #a1a1aa;
      }

      .social-select-item:hover {
        background: rgba(99, 102, 241, 0.15);
        border-color: rgba(99, 102, 241, 0.4);
        color: #e4e4e7;
        transform: translateY(-2px);
      }

      .social-select-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .social-select-icon svg {
        width: 28px;
        height: 28px;
      }

      .social-select-item:hover .social-select-icon svg {
        color: #818cf8;
      }

      .social-select-item span {
        font-size: 12px;
        font-weight: 500;
      }

      .social-url-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .selected-social-header {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 12px;
      }

      .selected-social-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(99, 102, 241, 0.15);
        border-radius: 10px;
      }

      .selected-social-icon svg {
        width: 24px;
        height: 24px;
        color: #818cf8;
      }

      .selected-social-name {
        font-size: 16px;
        font-weight: 600;
        color: #e4e4e7;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .label {
        font-size: 13px;
        color: #a1a1aa;
        font-weight: 500;
        letter-spacing: 0.3px;
      }

      .input {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #f4f4f5;
        padding: 12px 16px;
        font-size: 14px;
        border-radius: 10px;
        outline: none;
        transition: all 0.2s ease;
      }

      .input:focus {
        border-color: rgba(99, 102, 241, 0.5);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        background: rgba(0, 0, 0, 0.4);
      }

      .input::placeholder {
        color: #52525b;
      }

      .input[type='file'] {
        padding: 10px;
        cursor: pointer;
      }

      .input[type='file']::-webkit-file-upload-button {
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.2) 0%,
          rgba(139, 92, 246, 0.1) 100%
        );
        color: #c4b5fd;
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 6px;
        padding: 6px 14px;
        margin-right: 12px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .input[type='file']::-webkit-file-upload-button:hover {
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.3) 0%,
          rgba(139, 92, 246, 0.2) 100%
        );
      }

      .textarea {
        resize: vertical;
        min-height: 100px;
        line-height: 1.6;
      }

      select.input {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a1aa' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 36px;
      }

      .input-disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background: rgba(0, 0, 0, 0.2);
      }

      .form-hint {
        font-size: 12px;
        color: #71717a;
        margin-top: 6px;
        line-height: 1.4;
      }

      .checkbox-group {
        flex-direction: row;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        font-size: 14px;
        color: #d4d4d8;
        padding: 8px 0;
      }

      .checkbox-label input[type='checkbox'] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #818cf8;
      }

      .label-small {
        font-size: 12px;
        color: #71717a;
        margin-bottom: 10px;
        display: block;
      }

      .image-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 14px;
        margin-top: 14px;
      }

      .image-preview-item {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
      }

      .image-preview-item:hover {
        border-color: rgba(99, 102, 241, 0.4);
        transform: scale(1.02);
      }

      .image-preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .remove-image-btn {
        position: absolute;
        top: 6px;
        right: 6px;
        background: rgba(239, 68, 68, 0.9);
        border: none;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        transition: all 0.2s ease;
        opacity: 0;
      }

      .image-preview-item:hover .remove-image-btn {
        opacity: 1;
      }

      .remove-image-btn:hover {
        background: rgba(239, 68, 68, 1);
        transform: scale(1.1);
      }

      .remove-image-btn svg {
        width: 14px;
        height: 14px;
      }

      .existing-images {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      /* CV Upload Section */
      .cv-upload-section {
        margin-top: 16px;
      }

      .current-cv {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 10px;
        padding: 14px 18px;
        margin-bottom: 16px;
      }

      .cv-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .cv-icon {
        width: 32px;
        height: 32px;
        color: #818cf8;
      }

      .cv-filename {
        font-size: 14px;
        font-weight: 500;
        color: #f4f4f5;
      }

      .cv-actions {
        display: flex;
        gap: 10px;
      }

      .btn-sm {
        padding: 8px 14px;
        font-size: 12px;
      }

      .btn-danger {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      .btn-danger:hover {
        background: rgba(239, 68, 68, 0.25);
      }

      .cv-upload-area {
        position: relative;
      }

      .cv-upload-area .file-input {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
      }

      .cv-upload-area .upload-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 32px;
        background: rgba(0, 0, 0, 0.2);
        border: 2px dashed rgba(99, 102, 241, 0.4);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #a1a1aa;
      }

      .cv-upload-area .upload-label:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.6);
        color: #c4b5fd;
      }

      .cv-upload-area.has-file .upload-label {
        padding: 20px;
        flex-direction: row;
      }

      .cv-upload-area .upload-icon {
        width: 40px;
        height: 40px;
      }

      .cv-upload-area.has-file .upload-icon {
        width: 24px;
        height: 24px;
      }

      .cv-upload-area .upload-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(99, 102, 241, 0.3);
        border-top-color: #818cf8;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .cv-hint {
        font-size: 12px;
        color: #71717a;
        margin-top: 10px;
        text-align: center;
      }

      .form-actions {
        margin-top: 24px;
        display: flex;
        gap: 14px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        letter-spacing: 0.3px;
      }

      .btn svg {
        width: 16px;
        height: 16px;
      }

      .btn-primary {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: #fff;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
      }

      .btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.05);
        color: #d4d4d8;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .btn-danger {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
      }

      .btn-danger:hover:not(:disabled) {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
      }

      .btn-sm {
        padding: 8px 14px;
        font-size: 12px;
        border-radius: 8px;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      /* Table */
      .table-container {
        overflow-x: auto;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
      }

      .table th,
      .table td {
        padding: 16px 24px;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .table th {
        font-size: 11px;
        font-weight: 600;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 1px;
        background: rgba(0, 0, 0, 0.15);
      }

      .table tbody tr {
        transition: background 0.2s ease;
      }

      .table tbody tr:hover {
        background: rgba(99, 102, 241, 0.05);
      }

      .table tbody tr:last-child td {
        border-bottom: none;
      }

      .skill-label {
        font-weight: 600;
        color: #f4f4f5;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 20px;
        text-transform: capitalize;
        letter-spacing: 0.3px;
      }

      .badge[data-category='languages'] {
        background: linear-gradient(
          135deg,
          rgba(59, 130, 246, 0.2) 0%,
          rgba(59, 130, 246, 0.1) 100%
        );
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.3);
      }

      .badge[data-category='frameworks'] {
        background: linear-gradient(
          135deg,
          rgba(16, 185, 129, 0.2) 0%,
          rgba(16, 185, 129, 0.1) 100%
        );
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      .badge[data-category='databases'] {
        background: linear-gradient(
          135deg,
          rgba(249, 115, 22, 0.2) 0%,
          rgba(249, 115, 22, 0.1) 100%
        );
        color: #fb923c;
        border: 1px solid rgba(249, 115, 22, 0.3);
      }

      .badge[data-category='tools'] {
        background: linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(234, 179, 8, 0.1) 100%);
        color: #fbbf24;
        border: 1px solid rgba(234, 179, 8, 0.3);
      }

      .badge[data-category='other'] {
        background: linear-gradient(
          135deg,
          rgba(168, 85, 247, 0.2) 0%,
          rgba(168, 85, 247, 0.1) 100%
        );
        color: #c084fc;
        border: 1px solid rgba(168, 85, 247, 0.3);
      }

      .badge-success {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
        color: #4ade80;
        border: 1px solid rgba(34, 197, 94, 0.3);
      }

      .badge-muted {
        background: rgba(113, 113, 122, 0.2);
        color: #a1a1aa;
        border: 1px solid rgba(113, 113, 122, 0.3);
      }

      .badge-primary {
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.2) 0%,
          rgba(99, 102, 241, 0.1) 100%
        );
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.3);
      }

      .badge-warning {
        background: linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(234, 179, 8, 0.1) 100%);
        color: #fbbf24;
        border: 1px solid rgba(234, 179, 8, 0.3);
      }

      .proficiency-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 150px;
      }

      .proficiency-fill {
        height: 6px;
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 3px;
        flex: 1;
      }

      .proficiency-text {
        font-size: 12px;
        color: #71717a;
        min-width: 35px;
      }

      .actions {
        display: flex;
        gap: 10px;
      }

      .action-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #a1a1aa;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .action-btn:hover {
        background: rgba(99, 102, 241, 0.15);
        border-color: rgba(99, 102, 241, 0.3);
        color: #818cf8;
        transform: translateY(-2px);
      }

      .action-btn-danger:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.3);
        color: #f87171;
      }

      .action-btn svg {
        width: 16px;
        height: 16px;
      }

      /* Projects Grid */
      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        padding: 20px 24px;
      }

      .project-card {
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.15) 100%);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s ease;
      }

      .project-card:hover {
        border-color: rgba(99, 102, 241, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }

      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }

      .project-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: #f4f4f5;
      }

      .project-badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .project-description {
        font-size: 14px;
        color: #a1a1aa;
        margin: 0 0 16px;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .project-tech {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 20px;
      }

      .tech-tag {
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 500;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.15) 0%,
          rgba(139, 92, 246, 0.1) 100%
        );
        color: #c4b5fd;
        border-radius: 6px;
        border: 1px solid rgba(99, 102, 241, 0.2);
      }

      .project-actions {
        display: flex;
        gap: 10px;
      }

      /* Modal */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal {
        width: 100%;
        max-width: 540px;
        background: linear-gradient(135deg, #1e1e2e 0%, #181825 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow:
          0 24px 80px rgba(0, 0, 0, 0.5),
          0 0 40px rgba(99, 102, 241, 0.1);
        animation: modalSlideIn 0.3s ease;
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .modal::-webkit-scrollbar {
        width: 6px;
      }

      .modal::-webkit-scrollbar-track {
        background: transparent;
      }

      .modal::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.3);
        border-radius: 3px;
      }

      .modal-lg {
        max-width: 720px;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 28px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.2);
      }

      .modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #f4f4f5;
      }

      .modal-close {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #a1a1aa;
        font-size: 24px;
        cursor: pointer;
        border-radius: 10px;
        transition: all 0.2s ease;
      }

      .modal-close:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.3);
        color: #f87171;
      }

      .modal-body {
        padding: 28px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 14px;
        margin-top: 12px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      /* Responsive */
      @media (max-width: 900px) {
        .admin-sidebar {
          display: none;
        }

        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.1) 0%,
            rgba(139, 92, 246, 0.05) 100%
          );
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
        }

        .mobile-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logout-btn-mobile {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .logout-btn-mobile svg {
          width: 16px;
          height: 16px;
        }

        .mobile-tabs {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          overflow-x: auto;
        }

        .mobile-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: 1px solid transparent;
          color: #a1a1aa;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .mobile-tab.active {
          color: #fff;
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.2) 0%,
            rgba(139, 92, 246, 0.1) 100%
          );
          border-color: rgba(99, 102, 241, 0.3);
        }

        .mobile-tab svg {
          width: 16px;
          height: 16px;
        }

        .admin-container {
          flex-direction: column;
        }

        .admin-content {
          padding: 20px 16px;
        }

        .section {
          padding: 20px;
        }

        .form-row {
          grid-template-columns: 1fr;
        }

        .projects-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (min-width: 901px) {
        .mobile-header,
        .mobile-tabs {
          display: none !important;
        }
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  supabase = inject(SupabaseService);
  i18n = inject(I18nService);

  // State
  activeTab = signal<AdminTab>('profile');
  isSaving = signal(false);
  isUploadingCv = signal(false);
  currentCvUrl = signal<string | null>(null);
  showSkillModal = signal(false);
  showProjectModal = signal(false);
  showSocialModal = signal(false);
  editingSkill = signal<Skill | null>(null);
  editingProject = signal<Project | null>(null);
  editingSocialLink = signal<{ type: string; url: string } | null>(null);
  selectedSocialType = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  selectedImages = signal<Array<{ file: File; preview: string; name: string }>>([]);
  projectImages = signal<string[]>([]);

  // Social Links
  socialLinks = signal<Array<{ type: string; url: string }>>([]);
  socialLinkUrl = '';

  readonly socialNetworks = [
    { type: 'github', name: 'GitHub', placeholder: 'https://github.com/username' },
    { type: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
    { type: 'twitter', name: 'Twitter / X', placeholder: 'https://twitter.com/username' },
    { type: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/username' },
    { type: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@channel' },
    { type: 'tiktok', name: 'TikTok', placeholder: 'https://tiktok.com/@username' },
    { type: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/username' },
    { type: 'discord', name: 'Discord', placeholder: 'https://discord.gg/invite' },
    { type: 'twitch', name: 'Twitch', placeholder: 'https://twitch.tv/username' },
    { type: 'spotify', name: 'Spotify', placeholder: 'https://open.spotify.com/user/...' },
    { type: 'dribbble', name: 'Dribbble', placeholder: 'https://dribbble.com/username' },
    { type: 'behance', name: 'Behance', placeholder: 'https://behance.net/username' },
    { type: 'medium', name: 'Medium', placeholder: 'https://medium.com/@username' },
    { type: 'devto', name: 'Dev.to', placeholder: 'https://dev.to/username' },
    {
      type: 'stackoverflow',
      name: 'Stack Overflow',
      placeholder: 'https://stackoverflow.com/users/...',
    },
    { type: 'website', name: 'Sitio Web', placeholder: 'https://yourwebsite.com' },
  ];

  // Data
  profile = signal<ProfileInfo | null>(null);
  skills = signal<Skill[]>([]);
  projects = signal<Project[]>([]);

  // Forms
  profileForm: FormGroup;
  skillForm: FormGroup;
  projectForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      title: [''],
      bio: [''],
      email: ['', Validators.email],
      location: [''],
    });

    this.skillForm = this.fb.group({
      label: ['', Validators.required],
      icon: [''],
      category: ['languages', Validators.required],
      sort_order: [0],
      is_featured: [false],
    });

    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      slug: [''],
      description: [''],
      tech_stack_input: [''],
      live_link: [''],
      repo_link: [''],
      is_featured: [false],
      is_published: [true],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    const [profile, skills, projects] = await Promise.all([
      this.supabase.getProfile(),
      this.supabase.getSkills(),
      this.supabase.getAllProjects(),
    ]);

    this.profile.set(profile);
    this.skills.set(skills);
    this.projects.set(projects);

    // Cargar URL del CV actual
    if (profile?.resume_url) {
      this.currentCvUrl.set(profile.resume_url);
    }

    // Cargar social links dinámicamente
    if (profile?.social_links) {
      const links: Array<{ type: string; url: string }> = [];
      const sl = profile.social_links as Record<string, any>;

      for (const network of this.socialNetworks) {
        const url = sl[network.type];
        const enabled = sl[`${network.type}_enabled`];
        if (url && enabled !== false) {
          links.push({ type: network.type, url });
        }
      }
      this.socialLinks.set(links);
    }

    if (profile) {
      this.profileForm.patchValue({
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        email: profile.email,
        location: profile.location,
      });
    }
  }

  async logout(): Promise<void> {
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }

  // Profile
  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const formValue = this.profileForm.value;

      // Construir social_links desde el sistema dinámico
      const socialLinks: any = {};
      for (const link of this.socialLinks()) {
        socialLinks[link.type] = link.url;
        socialLinks[`${link.type}_enabled`] = true;
      }

      const profileData = {
        name: formValue.name?.trim() || null,
        title: formValue.title?.trim() || null,
        bio: formValue.bio?.trim() || null,
        email: formValue.email?.trim() || null,
        location: formValue.location?.trim() || null,
        social_links: socialLinks,
      };

      // Verificar si existe un perfil, si no, crear uno
      const currentProfile = await this.supabase.getProfile();
      let result;

      if (currentProfile) {
        result = await this.supabase.updateProfile(profileData);
      } else {
        result = await this.supabase.createProfile(profileData as any);
      }

      if (result.error) {
        const errorMsg =
          result.error instanceof Error
            ? result.error.message
            : (result.error as any)?.message ||
              (this.i18n.language() === 'es'
                ? 'Error al guardar el perfil'
                : 'Error saving profile');
        this.errorMessage.set(errorMsg);
        this.isSaving.set(false);
        return;
      }

      // Recargar datos para actualizar la UI
      await this.loadData();

      this.successMessage.set(
        this.i18n.language() === 'es'
          ? 'Perfil actualizado correctamente'
          : 'Profile updated successfully',
      );
      this.isSaving.set(false);

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (error: any) {
      this.errorMessage.set(
        error.message ||
          (this.i18n.language() === 'es'
            ? 'Error inesperado al guardar'
            : 'Unexpected error saving'),
      );
      this.isSaving.set(false);
    }
  }

  // Social Links Methods
  availableSocialNetworks() {
    const existingTypes = this.socialLinks().map((l) => l.type);
    return this.socialNetworks.filter((n) => !existingTypes.includes(n.type));
  }

  openSocialModal(): void {
    this.showSocialModal.set(true);
    this.selectedSocialType.set(null);
    this.editingSocialLink.set(null);
    this.socialLinkUrl = '';
  }

  closeSocialModal(): void {
    this.showSocialModal.set(false);
    this.selectedSocialType.set(null);
    this.editingSocialLink.set(null);
    this.socialLinkUrl = '';
  }

  selectSocialType(type: string): void {
    this.selectedSocialType.set(type);
  }

  backToSocialSelect(): void {
    this.selectedSocialType.set(null);
    this.socialLinkUrl = '';
  }

  editSocialLink(link: { type: string; url: string }): void {
    this.editingSocialLink.set(link);
    this.socialLinkUrl = link.url;
    this.showSocialModal.set(true);
  }

  saveSocialLink(): void {
    const url = this.socialLinkUrl.trim();
    if (!url) return;

    const type = this.selectedSocialType() || this.editingSocialLink()?.type;
    if (!type) return;

    const currentLinks = [...this.socialLinks()];
    const existingIndex = currentLinks.findIndex((l) => l.type === type);

    if (existingIndex >= 0) {
      currentLinks[existingIndex] = { type, url };
    } else {
      currentLinks.push({ type, url });
    }

    this.socialLinks.set(currentLinks);
    this.closeSocialModal();
  }

  removeSocialLink(type: string): void {
    if (
      !confirm(
        this.i18n.language() === 'es'
          ? '¿Estás seguro de eliminar esta red social?'
          : 'Are you sure you want to remove this social network?',
      )
    ) {
      return;
    }
    this.socialLinks.set(this.socialLinks().filter((l) => l.type !== type));
  }

  getSocialName(type: string): string {
    return this.socialNetworks.find((n) => n.type === type)?.name || type;
  }

  getSocialPlaceholder(type: string): string {
    return this.socialNetworks.find((n) => n.type === type)?.placeholder || 'https://...';
  }

  getSocialIcon(type: string): SafeHtml {
    const icons: Record<string, string> = {
      github:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
      linkedin:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
      twitter:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      instagram:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
      youtube:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
      tiktok:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
      facebook:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
      discord:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
      twitch:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>',
      spotify:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
      dribbble:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>',
      behance:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007zM6.545 9.66c.57 0 1.045-.146 1.43-.44.39-.294.57-.75.57-1.37 0-.344-.06-.625-.188-.848-.13-.22-.3-.39-.52-.512-.218-.12-.47-.2-.753-.254-.283-.05-.588-.08-.905-.08H3.33v3.5h3.214zm.255 5.69c.357 0 .69-.033.996-.1.307-.07.574-.18.8-.33.224-.15.4-.353.523-.61.125-.26.187-.58.187-.96 0-.77-.24-1.33-.72-1.67-.478-.34-1.1-.5-1.86-.5H3.33v4.17h3.47zM21.792 18.143c-.53.66-1.28 1.01-2.25 1.05-.574 0-1.09-.087-1.54-.26-.45-.174-.82-.416-1.11-.726-.29-.31-.51-.68-.66-1.11-.15-.43-.23-.9-.24-1.41h7.51c.04-1.01-.06-1.96-.31-2.83-.25-.87-.63-1.63-1.14-2.27-.51-.64-1.14-1.14-1.89-1.5-.75-.36-1.62-.54-2.6-.54-.87 0-1.67.16-2.4.48-.73.32-1.37.76-1.9 1.32-.53.56-.94 1.22-1.24 1.98-.3.76-.45 1.58-.45 2.47 0 .91.15 1.74.46 2.49.3.75.72 1.4 1.25 1.94.53.54 1.16.96 1.89 1.27.73.3 1.52.46 2.36.46 1.19 0 2.23-.29 3.1-.87.87-.58 1.51-1.47 1.92-2.67h-2.2c-.11.31-.4.62-.84.92zm-4.57-6.57c.66 0 1.26.23 1.8.67.54.45.83 1.13.87 2.04h-5.47c.08-.9.39-1.56.93-2 .54-.44 1.17-.67 1.87-.71zM15.58 4h5.33v1.5h-5.33z"/></svg>',
      medium:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>',
      devto:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .65-.08.83-.25.17-.17.26-.45.26-.85v-1.93c0-.42-.09-.72-.25-.9zm13.37-7.42H3.21A2.22 2.22 0 001 4.84v14.32a2.22 2.22 0 002.21 2.21h17.58a2.22 2.22 0 002.21-2.21V4.84a2.22 2.22 0 00-2.21-2.21zm-9.9 10.53c0 1.41-.93 2.84-3 2.84H5.61V7.99h2.25c2.12 0 3 1.41 3 2.84v2.33zm3.64 2.8h-1.76V7.99h1.76v8.17zm5.91-6.4c-.06 0-.11 0-.18 0h-2.05v1.89h2.05v1.51h-2.05v2.14h2.05c.06 0 .12 0 .18-.01.1 0 .17-.05.17-.15v-5.23c0-.1-.07-.15-.17-.15z"/></svg>',
      stackoverflow:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 21h-10v-2h10v2zm6-11.665l-1.621-9.335-1.993.346 1.621 9.335 1.993-.346zm-5.964 6.937l-9.746-.975-.186 2.016 9.755.879.177-1.92zm.538-2.587l-9.276-2.608-.526 1.954 9.306 2.5.496-1.846zm1.204-2.413l-8.297-4.864-1.029 1.743 8.298 4.865 1.028-1.744zm1.866-1.467l-5.339-7.829-1.672 1.14 5.339 7.829 1.672-1.14zm-2.644 4.195v8h-12v-8h-2v10h16v-10h-2z"/></svg>',
      website:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9h-2.764a14.67 14.67 0 0 0-1.792-6.243A8.013 8.013 0 0 1 19.931 11zM12.53 4.027c1.035 1.364 2.427 3.78 2.627 6.973H9.03c.139-2.596.994-5.028 2.451-6.974.172-.01.344-.026.519-.026.179 0 .354.016.53.027zm-3.842.511C7.313 6.65 6.268 8.722 6.028 11H3.264a8.013 8.013 0 0 1 5.424-6.462zM3.264 13h2.764c.24 2.278 1.285 4.35 2.656 6.462A8.013 8.013 0 0 1 3.264 13zm9.266 6.973c-1.457-1.946-2.312-4.378-2.451-6.973h5.327c-.2 3.193-1.592 5.609-2.627 6.973-.176.011-.351.027-.53.027-.175 0-.347-.016-.519-.027zm3.842-.511c1.375-2.112 2.416-4.184 2.656-6.462h2.764a8.013 8.013 0 0 1-5.42 6.462z"/></svg>',
    };
    const iconHtml = icons[type] || icons['website'];
    return this.sanitizer.bypassSecurityTrustHtml(iconHtml);
  }

  // Skills
  openSkillModal(skill?: Skill): void {
    if (skill) {
      this.editingSkill.set(skill);
      this.skillForm.patchValue({
        label: skill.label,
        icon: skill.icon,
        category: skill.category,
        sort_order: skill.sort_order,
        is_featured: skill.is_featured,
      });
    } else {
      this.editingSkill.set(null);
      this.skillForm.reset({
        category: 'languages',
        sort_order: 0,
        is_featured: false,
      });
    }
    this.showSkillModal.set(true);
  }

  closeSkillModal(): void {
    this.showSkillModal.set(false);
    this.editingSkill.set(null);
  }

  editSkill(skill: Skill): void {
    this.openSkillModal(skill);
  }

  async saveSkill(): Promise<void> {
    if (this.skillForm.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const formValue = this.skillForm.value;

      const skillData = {
        label: formValue.label?.trim(),
        icon: formValue.icon?.trim() || null,
        category: formValue.category as SkillCategory,
        sort_order: Number(formValue.sort_order) || 0,
        is_featured: Boolean(formValue.is_featured),
      };

      let result;
      if (this.editingSkill()) {
        result = await this.supabase.updateSkill(this.editingSkill()!.id, skillData);
      } else {
        result = await this.supabase.createSkill(skillData as any);
      }

      if (result.error) {
        const errorMsg =
          result.error instanceof Error
            ? result.error.message
            : (result.error as any)?.message ||
              (this.i18n.language() === 'es'
                ? 'Error al guardar la habilidad'
                : 'Error saving skill');
        this.errorMessage.set(errorMsg);
        this.isSaving.set(false);
        return;
      }

      await this.loadData();
      this.closeSkillModal();
      this.successMessage.set(
        this.editingSkill()
          ? this.i18n.language() === 'es'
            ? 'Habilidad actualizada correctamente'
            : 'Skill updated successfully'
          : this.i18n.language() === 'es'
            ? 'Habilidad creada correctamente'
            : 'Skill created successfully',
      );
      this.isSaving.set(false);

      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (error: any) {
      this.errorMessage.set(
        error.message ||
          (this.i18n.language() === 'es'
            ? 'Error inesperado al guardar'
            : 'Unexpected error saving'),
      );
      this.isSaving.set(false);
    }
  }

  async deleteSkill(id: string): Promise<void> {
    if (
      !confirm(
        this.i18n.language() === 'es'
          ? '¿Estás seguro de que quieres eliminar esta habilidad?'
          : 'Are you sure you want to delete this skill?',
      )
    )
      return;

    await this.supabase.deleteSkill(id);
    await this.loadData();
  }

  // Projects
  openProjectModal(project?: Project): void {
    this.selectedImages.set([]);
    if (project) {
      this.editingProject.set(project);
      this.projectImages.set(project.gallery_urls || []);
      this.projectForm.patchValue({
        title: project.title,
        slug: project.slug,
        description: project.description,
        tech_stack_input: project.tech_stack.join(', '),
        live_link: project.live_link,
        repo_link: project.repo_link,
        is_featured: project.is_featured,
        is_published: project.is_published,
      });
    } else {
      this.editingProject.set(null);
      this.projectImages.set([]);
      this.projectForm.reset({
        is_featured: false,
        is_published: true,
      });
    }
    this.showProjectModal.set(true);
  }

  closeProjectModal(): void {
    // Limpiar URLs de preview para evitar memory leaks
    this.selectedImages().forEach((img) => URL.revokeObjectURL(img.preview));
    this.showProjectModal.set(false);
    this.editingProject.set(null);
    this.selectedImages.set([]);
    this.projectImages.set([]);
  }

  onTitleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const title = input.value;
    const slug = this.generateSlug(title);
    this.projectForm.patchValue({ slug });
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-'); // Múltiples guiones a uno
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files).slice(0, 10); // Máximo 10 imágenes
      const newImages = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }));
      this.selectedImages.update((current) => [...current, ...newImages]);
    }
  }

  removeImage(index: number): void {
    const images = this.selectedImages();
    URL.revokeObjectURL(images[index].preview);
    this.selectedImages.set(images.filter((_, i) => i !== index));
  }

  removeExistingImage(index: number): void {
    const images = this.projectImages();
    this.projectImages.set(images.filter((_, i) => i !== index));
  }

  editProject(project: Project): void {
    this.openProjectModal(project);
  }

  async saveProject(): Promise<void> {
    if (this.projectForm.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const formValue = this.projectForm.value;

      const techStack = formValue.tech_stack_input
        ? formValue.tech_stack_input
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

      // Subir nuevas imágenes
      const galleryUrls: string[] = [...this.projectImages()];
      const selectedImages = this.selectedImages();
      const uploadErrors: string[] = [];

      if (selectedImages.length > 0) {
        const projectSlug =
          formValue.slug?.trim() ||
          formValue.title?.toLowerCase().replace(/\s+/g, '-') ||
          'projects';
        for (const imageData of selectedImages) {
          const uploadResult = await this.supabase.uploadImage(imageData.file, projectSlug);
          if (uploadResult.error) {
            console.error('Error uploading image:', imageData.name, uploadResult.error);
            uploadErrors.push(`${imageData.name}: ${uploadResult.error.message}`);
          } else if (uploadResult && uploadResult.url && typeof uploadResult.url === 'string') {
            galleryUrls.push(uploadResult.url);
          }
        }

        if (uploadErrors.length > 0 && galleryUrls.length === this.projectImages().length) {
          // Todas las imágenes fallaron
          this.errorMessage.set(
            this.i18n.language() === 'es'
              ? `Error al subir imágenes. Verifica que el bucket 'proyectos_fotos' tenga políticas RLS configuradas para INSERT. Errores: ${uploadErrors.join(', ')}`
              : `Error uploading images. Check that bucket 'proyectos_fotos' has RLS policies for INSERT. Errors: ${uploadErrors.join(', ')}`,
          );
          this.isSaving.set(false);
          return;
        }
      }

      const projectData = {
        title: formValue.title?.trim(),
        slug: formValue.slug?.trim() || formValue.title?.toLowerCase().replace(/\s+/g, '-') || null,
        description: formValue.description?.trim() || null,
        tech_stack: techStack,
        image_url: galleryUrls[0] || null, // Primera imagen como imagen principal
        gallery_urls: galleryUrls,
        live_link: formValue.live_link?.trim() || null,
        repo_link: formValue.repo_link?.trim() || null,
        is_featured: Boolean(formValue.is_featured),
        is_published: formValue.is_published !== undefined ? Boolean(formValue.is_published) : true,
      };

      let result;
      if (this.editingProject()) {
        result = await this.supabase.updateProject(this.editingProject()!.id, projectData);
      } else {
        result = await this.supabase.createProject(projectData as any);
      }

      if (result.error) {
        const errorMsg =
          result.error instanceof Error
            ? result.error.message
            : (result.error as any)?.message ||
              (this.i18n.language() === 'es'
                ? 'Error al guardar el proyecto'
                : 'Error saving project');
        this.errorMessage.set(errorMsg);
        this.isSaving.set(false);
        return;
      }

      await this.loadData();
      this.closeProjectModal();
      this.successMessage.set(
        this.editingProject()
          ? this.i18n.language() === 'es'
            ? 'Proyecto actualizado correctamente'
            : 'Project updated successfully'
          : this.i18n.language() === 'es'
            ? 'Proyecto creado correctamente'
            : 'Project created successfully',
      );
      this.isSaving.set(false);

      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (error: any) {
      this.errorMessage.set(
        error.message ||
          (this.i18n.language() === 'es'
            ? 'Error inesperado al guardar'
            : 'Unexpected error saving'),
      );
      this.isSaving.set(false);
    }
  }

  // CV Upload Methods
  async onCvFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar que sea PDF
    if (file.type !== 'application/pdf') {
      this.errorMessage.set(
        this.i18n.language() === 'es'
          ? 'Solo se permiten archivos PDF'
          : 'Only PDF files are allowed',
      );
      return;
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set(
        this.i18n.language() === 'es'
          ? 'El archivo es demasiado grande. Máximo 10MB.'
          : 'File is too large. Maximum 10MB.',
      );
      return;
    }

    this.isUploadingCv.set(true);
    this.errorMessage.set(null);

    try {
      const result = await this.supabase.uploadCV(file);

      if (result.error) {
        this.errorMessage.set(
          this.i18n.language() === 'es'
            ? `Error al subir el CV: ${result.error.message}`
            : `Error uploading CV: ${result.error.message}`,
        );
        return;
      }

      if (result.url) {
        // Actualizar el perfil con la nueva URL del CV
        const updateResult = await this.supabase.updateProfile({
          resume_url: result.url,
        });

        if (updateResult.error) {
          this.errorMessage.set(
            this.i18n.language() === 'es'
              ? 'CV subido pero no se pudo actualizar el perfil'
              : 'CV uploaded but could not update profile',
          );
          return;
        }

        this.currentCvUrl.set(result.url);
        this.successMessage.set(
          this.i18n.language() === 'es' ? '¡CV subido exitosamente!' : 'CV uploaded successfully!',
        );
      }
    } catch (error) {
      this.errorMessage.set(
        this.i18n.language() === 'es'
          ? 'Error inesperado al subir el CV'
          : 'Unexpected error uploading CV',
      );
    } finally {
      this.isUploadingCv.set(false);
      // Limpiar el input
      input.value = '';
    }
  }

  async deleteCv(): Promise<void> {
    if (
      !confirm(
        this.i18n.language() === 'es'
          ? '¿Estás seguro de que quieres eliminar tu CV?'
          : 'Are you sure you want to delete your CV?',
      )
    )
      return;

    try {
      // Eliminar del storage
      const deleteResult = await this.supabase.deleteCV();
      if (deleteResult.error) {
        console.warn('Error deleting CV from storage:', deleteResult.error);
      }

      // Actualizar el perfil para quitar la URL
      const updateResult = await this.supabase.updateProfile({
        resume_url: null,
      });

      if (updateResult.error) {
        this.errorMessage.set(
          this.i18n.language() === 'es'
            ? 'Error al actualizar el perfil'
            : 'Error updating profile',
        );
        return;
      }

      this.currentCvUrl.set(null);
      this.successMessage.set(
        this.i18n.language() === 'es' ? 'CV eliminado exitosamente' : 'CV deleted successfully',
      );
    } catch (error) {
      this.errorMessage.set(
        this.i18n.language() === 'es'
          ? 'Error inesperado al eliminar el CV'
          : 'Unexpected error deleting CV',
      );
    }
  }

  async deleteProject(id: string): Promise<void> {
    if (
      !confirm(
        this.i18n.language() === 'es'
          ? '¿Estás seguro de que quieres eliminar este proyecto?'
          : 'Are you sure you want to delete this project?',
      )
    )
      return;

    await this.supabase.deleteProject(id);
    await this.loadData();
  }
}
