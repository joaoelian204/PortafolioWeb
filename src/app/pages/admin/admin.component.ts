import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileInfo, Project, Skill, SkillCategory } from '../../core/models/database.types';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';

type AdminTab = 'profile' | 'skills' | 'projects';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="admin-container">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-left">
          <h1 class="header-title">
            <svg viewBox="0 0 16 16" fill="currentColor" class="admin-icon">
              <path
                d="M14.5 2H9l-1 1v4l1 1h5.5l.5-.5v-5l-.5-.5zM14 7H9V3h5v4zM6 9H1l-1 1v4l1 1h5l1-1v-4l-1-1zm0 5H1v-4h5v4zm8-1h-5l-1-1V8l1-1h5l1 1v4l-1 1zm0-5H9v4h5V8zM6 2H1L0 3v4l1 1h5l1-1V3L6 2zm0 5H1V3h5v4z"
              />
            </svg>
            {{ i18n.t('admin.title') }}
          </h1>
        </div>
        <div class="header-right">
          <span class="user-email">{{ supabase.currentUser()?.email }}</span>
          <button class="logout-btn" (click)="logout()">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M11.5 9.5l1.5-1.5-1.5-1.5-.71.71.65.64H8v1h3.44l-.65.64.71.71zM13 3H9v1h4v8H9v1h4.5l.5-.5v-9l-.5-.5z"
              />
              <path d="M1 3.5l.5-.5H7v1H2v8h5v1H1.5l-.5-.5v-9z" />
            </svg>
            {{ i18n.language() === 'es' ? 'Cerrar Sesión' : 'Logout' }}
          </button>
        </div>
      </header>

      <!-- Tabs -->
      <nav class="admin-tabs">
        <button
          class="tab"
          [class.active]="activeTab() === 'profile'"
          (click)="activeTab.set('profile')"
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 10c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"
            />
          </svg>
          {{ i18n.t('admin.profile') }}
        </button>
        <button
          class="tab"
          [class.active]="activeTab() === 'skills'"
          (click)="activeTab.set('skills')"
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M2.5 1l-.5.5v13l.5.5h11l.5-.5v-13l-.5-.5h-11zM3 14V2h10v12H3zm2-9h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z"
            />
          </svg>
          {{ i18n.t('admin.skills') }}
        </button>
        <button
          class="tab"
          [class.active]="activeTab() === 'projects'"
          (click)="activeTab.set('projects')"
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10l-.5-.5zm-.5 10H2V6h12v7zm0-8H2V3h4.29l.85.85.36.15H14v1z"
            />
          </svg>
          {{ i18n.t('admin.projects') }}
        </button>
      </nav>

      <!-- Content -->
      <main class="admin-content">
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
              <h2 class="section-title">{{ i18n.t('admin.profile') }}</h2>
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="label">{{ i18n.t('admin.name') }}</label>
                    <input type="text" formControlName="name" class="input" />
                  </div>
                  <div class="form-group">
                    <label class="label">{{ i18n.language() === 'es' ? 'Título' : 'Title' }}</label>
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

                <!-- GitHub -->
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="github_enabled" />
                    <span>{{ i18n.t('admin.github') }}</span>
                  </label>
                  <input
                    type="url"
                    formControlName="github"
                    class="input"
                    [class.input-disabled]="!profileForm.get('github_enabled')?.value"
                    [placeholder]="
                      i18n.language() === 'es' ? 'https://github.com/...' : 'https://github.com/...'
                    "
                    [readonly]="!profileForm.get('github_enabled')?.value"
                  />
                </div>

                <!-- LinkedIn -->
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="linkedin_enabled" />
                    <span>{{ i18n.t('admin.linkedin') }}</span>
                  </label>
                  <input
                    type="url"
                    formControlName="linkedin"
                    class="input"
                    [class.input-disabled]="!profileForm.get('linkedin_enabled')?.value"
                    [placeholder]="
                      i18n.language() === 'es'
                        ? 'https://linkedin.com/in/...'
                        : 'https://linkedin.com/in/...'
                    "
                    [readonly]="!profileForm.get('linkedin_enabled')?.value"
                  />
                </div>

                <!-- Twitter -->
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="twitter_enabled" />
                    <span>{{ i18n.language() === 'es' ? 'Twitter' : 'Twitter' }}</span>
                  </label>
                  <input
                    type="url"
                    formControlName="twitter"
                    class="input"
                    [class.input-disabled]="!profileForm.get('twitter_enabled')?.value"
                    [placeholder]="
                      i18n.language() === 'es'
                        ? 'https://twitter.com/...'
                        : 'https://twitter.com/...'
                    "
                    [readonly]="!profileForm.get('twitter_enabled')?.value"
                  />
                </div>

                <!-- Instagram -->
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="instagram_enabled" />
                    <span>Instagram</span>
                  </label>
                  <input
                    type="url"
                    formControlName="instagram"
                    class="input"
                    [class.input-disabled]="!profileForm.get('instagram_enabled')?.value"
                    [placeholder]="
                      i18n.language() === 'es'
                        ? 'https://instagram.com/...'
                        : 'https://instagram.com/...'
                    "
                    [readonly]="!profileForm.get('instagram_enabled')?.value"
                  />
                </div>

                <!-- YouTube -->
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="youtube_enabled" />
                    <span>YouTube</span>
                  </label>
                  <input
                    type="url"
                    formControlName="youtube"
                    class="input"
                    [class.input-disabled]="!profileForm.get('youtube_enabled')?.value"
                    [placeholder]="
                      i18n.language() === 'es'
                        ? 'https://youtube.com/...'
                        : 'https://youtube.com/...'
                    "
                    [readonly]="!profileForm.get('youtube_enabled')?.value"
                  />
                </div>

                <!-- Website -->
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="website_enabled" />
                    <span>{{ i18n.language() === 'es' ? 'Sitio Web' : 'Website' }}</span>
                  </label>
                  <input
                    type="url"
                    formControlName="website"
                    class="input"
                    [class.input-disabled]="!profileForm.get('website_enabled')?.value"
                    [placeholder]="i18n.language() === 'es' ? 'https://...' : 'https://...'"
                    [readonly]="!profileForm.get('website_enabled')?.value"
                  />
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
                        <a [href]="currentCvUrl()" target="_blank" class="btn btn-sm btn-secondary">
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
                        <span>{{ i18n.language() === 'es' ? 'Subiendo...' : 'Uploading...' }}</span>
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
            </section>
          }

          @case ('skills') {
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">{{ i18n.t('admin.skills') }}</h2>
                <button class="btn btn-primary" (click)="openSkillModal()">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path
                      d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                    />
                  </svg>
                  {{ i18n.t('admin.add') }} {{ i18n.t('admin.skills') }}
                </button>
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
            </section>
          }

          @case ('projects') {
            <section class="section">
              <div class="section-header">
                <h2 class="section-title">{{ i18n.t('admin.projects') }}</h2>
                <button class="btn btn-primary" (click)="openProjectModal()">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path
                      d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                    />
                  </svg>
                  {{ i18n.t('admin.add') }} {{ i18n.t('admin.projects') }}
                </button>
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
            </section>
          }
        }
      </main>

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
        flex-direction: column;
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
        color: #e4e4e7;
        overflow: hidden;
        font-family:
          'Segoe UI',
          system-ui,
          -apple-system,
          sans-serif;
      }

      .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 32px;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.1) 0%,
          rgba(139, 92, 246, 0.05) 100%
        );
        border-bottom: 1px solid rgba(99, 102, 241, 0.2);
        backdrop-filter: blur(10px);
        flex-shrink: 0;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 22px;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .admin-icon {
        width: 28px;
        height: 28px;
        color: #818cf8;
        filter: drop-shadow(0 0 8px rgba(129, 140, 248, 0.5));
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .user-email {
        font-size: 13px;
        color: #a1a1aa;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .logout-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(
          135deg,
          rgba(239, 68, 68, 0.1) 0%,
          rgba(239, 68, 68, 0.05) 100%
        );
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #fca5a5;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .logout-btn:hover {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
        border-color: rgba(239, 68, 68, 0.5);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
      }

      .logout-btn svg {
        width: 16px;
        height: 16px;
      }

      .admin-tabs {
        display: flex;
        gap: 8px;
        padding: 16px 32px;
        background: rgba(0, 0, 0, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        flex-shrink: 0;
      }

      .tab {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 24px;
        background: transparent;
        border: 1px solid transparent;
        color: #a1a1aa;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-radius: 12px;
        transition: all 0.25s ease;
      }

      .tab:hover {
        color: #e4e4e7;
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
      }

      .tab.active {
        color: #fff;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.2) 0%,
          rgba(139, 92, 246, 0.1) 100%
        );
        border-color: rgba(99, 102, 241, 0.4);
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
      }

      .tab.active svg {
        color: #818cf8;
      }

      .tab svg {
        width: 18px;
        height: 18px;
        transition: color 0.25s ease;
      }

      .admin-content {
        flex: 1;
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
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

      .section {
        background: linear-gradient(135deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 40, 0.9) 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 28px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
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
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .table {
        width: 100%;
        border-collapse: collapse;
      }

      .table th,
      .table td {
        padding: 16px;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .table th {
        font-size: 11px;
        font-weight: 600;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 1px;
        background: rgba(0, 0, 0, 0.2);
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
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
      }

      .project-card {
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 24px;
        transition: all 0.3s ease;
      }

      .project-card:hover {
        border-color: rgba(99, 102, 241, 0.3);
        transform: translateY(-4px);
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.3),
          0 0 30px rgba(99, 102, 241, 0.1);
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

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
        }

        .admin-header {
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
          padding: 16px 20px;
        }

        .header-right {
          width: 100%;
          justify-content: space-between;
        }

        .admin-tabs {
          padding: 12px 16px;
          overflow-x: auto;
        }

        .tab {
          padding: 10px 16px;
          font-size: 13px;
          white-space: nowrap;
        }

        .admin-content {
          padding: 20px 16px;
        }

        .section {
          padding: 20px;
        }

        .projects-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  supabase = inject(SupabaseService);
  i18n = inject(I18nService);

  // State
  activeTab = signal<AdminTab>('profile');
  isSaving = signal(false);
  isUploadingCv = signal(false);
  currentCvUrl = signal<string | null>(null);
  showSkillModal = signal(false);
  showProjectModal = signal(false);
  editingSkill = signal<Skill | null>(null);
  editingProject = signal<Project | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  selectedImages = signal<Array<{ file: File; preview: string; name: string }>>([]);
  projectImages = signal<string[]>([]);

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
      github: [''],
      github_enabled: [true],
      linkedin: [''],
      linkedin_enabled: [true],
      twitter: [''],
      twitter_enabled: [true],
      instagram: [''],
      instagram_enabled: [false],
      youtube: [''],
      youtube_enabled: [false],
      website: [''],
      website_enabled: [true],
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

    if (profile) {
      this.profileForm.patchValue({
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        email: profile.email,
        location: profile.location,
        github: profile.social_links?.github || '',
        github_enabled: (profile.social_links?.['github_enabled'] as boolean | undefined) !== false,
        linkedin: profile.social_links?.linkedin || '',
        linkedin_enabled:
          (profile.social_links?.['linkedin_enabled'] as boolean | undefined) !== false,
        twitter: profile.social_links?.twitter || '',
        twitter_enabled:
          (profile.social_links?.['twitter_enabled'] as boolean | undefined) !== false,
        instagram: profile.social_links?.instagram || '',
        instagram_enabled:
          (profile.social_links?.['instagram_enabled'] as boolean | undefined) === true,
        youtube: profile.social_links?.youtube || '',
        youtube_enabled:
          (profile.social_links?.['youtube_enabled'] as boolean | undefined) === true,
        website: profile.social_links?.website || '',
        website_enabled:
          (profile.social_links?.['website_enabled'] as boolean | undefined) !== false,
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

      const socialLinks: any = {};
      if (formValue.github_enabled && formValue.github?.trim()) {
        socialLinks.github = formValue.github.trim();
        socialLinks.github_enabled = true;
      } else {
        socialLinks.github_enabled = false;
      }
      if (formValue.linkedin_enabled && formValue.linkedin?.trim()) {
        socialLinks.linkedin = formValue.linkedin.trim();
        socialLinks.linkedin_enabled = true;
      } else {
        socialLinks.linkedin_enabled = false;
      }
      if (formValue.twitter_enabled && formValue.twitter?.trim()) {
        socialLinks.twitter = formValue.twitter.trim();
        socialLinks.twitter_enabled = true;
      } else {
        socialLinks.twitter_enabled = false;
      }
      if (formValue.instagram_enabled && formValue.instagram?.trim()) {
        socialLinks.instagram = formValue.instagram.trim();
        socialLinks.instagram_enabled = true;
      } else {
        socialLinks.instagram_enabled = false;
      }
      if (formValue.youtube_enabled && formValue.youtube?.trim()) {
        socialLinks.youtube = formValue.youtube.trim();
        socialLinks.youtube_enabled = true;
      } else {
        socialLinks.youtube_enabled = false;
      }
      if (formValue.website_enabled && formValue.website?.trim()) {
        socialLinks.website = formValue.website.trim();
        socialLinks.website_enabled = true;
      } else {
        socialLinks.website_enabled = false;
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

      // Actualizar el formulario con los datos guardados
      const updatedProfile = await this.supabase.getProfile();
      if (updatedProfile) {
        this.profileForm.patchValue({
          name: updatedProfile.name || '',
          title: updatedProfile.title || '',
          bio: updatedProfile.bio || '',
          email: updatedProfile.email || '',
          location: updatedProfile.location || '',
          github: updatedProfile.social_links?.github || '',
          github_enabled:
            (updatedProfile.social_links?.['github_enabled'] as boolean | undefined) !== false,
          linkedin: updatedProfile.social_links?.linkedin || '',
          linkedin_enabled:
            (updatedProfile.social_links?.['linkedin_enabled'] as boolean | undefined) !== false,
          twitter: updatedProfile.social_links?.twitter || '',
          twitter_enabled:
            (updatedProfile.social_links?.['twitter_enabled'] as boolean | undefined) !== false,
          instagram: updatedProfile.social_links?.instagram || '',
          instagram_enabled:
            (updatedProfile.social_links?.['instagram_enabled'] as boolean | undefined) === true,
          youtube: updatedProfile.social_links?.youtube || '',
          youtube_enabled:
            (updatedProfile.social_links?.['youtube_enabled'] as boolean | undefined) === true,
          website: updatedProfile.social_links?.website || '',
          website_enabled:
            (updatedProfile.social_links?.['website_enabled'] as boolean | undefined) !== false,
        });
      }

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
