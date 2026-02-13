import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileInfo, Project, Skill, SkillCategory } from '../../core/models/database.types';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { SOCIAL_NETWORKS } from './admin.constants';
import { AdminTab, SelectedImage, SocialLinkItem } from './admin.types';

import { AdminMobileHeaderComponent } from './components/admin-mobile-header/admin-mobile-header.component';
import { AdminProfileFormComponent } from './components/admin-profile-form/admin-profile-form.component';
import { AdminProjectsGridComponent } from './components/admin-projects-grid/admin-projects-grid.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { AdminSkillsTableComponent } from './components/admin-skills-table/admin-skills-table.component';
import { ProjectModalComponent } from './components/project-modal/project-modal.component';
import { SkillModalComponent } from './components/skill-modal/skill-modal.component';
import { SocialLinkModalComponent } from './components/social-link-modal/social-link-modal.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    AdminSidebarComponent,
    AdminMobileHeaderComponent,
    AdminProfileFormComponent,
    AdminSkillsTableComponent,
    AdminProjectsGridComponent,
    SkillModalComponent,
    ProjectModalComponent,
    SocialLinkModalComponent,
  ],
  template: `
    <div class="admin-container">
      <app-admin-sidebar
        [activeTab]="activeTab()"
        (tabChange)="activeTab.set($event)"
        (logoutClick)="logout()"
      />

      <app-admin-mobile-header
        [activeTab]="activeTab()"
        (tabChange)="activeTab.set($event)"
        (logoutClick)="logout()"
      />

      <main class="admin-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="page-header-content">
            <h1 class="page-title">
              @switch (activeTab()) {
                @case ('profile') {
                  {{ i18n.s('Perfil', 'Profile') }}
                }
                @case ('skills') {
                  {{ i18n.s('Habilidades', 'Skills') }}
                }
                @case ('projects') {
                  {{ i18n.s('Proyectos', 'Projects') }}
                }
              }
            </h1>
            <p class="page-description">
              @switch (activeTab()) {
                @case ('profile') {
                  {{
                    i18n.s(
                      'Gestiona tu información personal y redes sociales',
                      'Manage your personal information and social networks'
                    )
                  }}
                }
                @case ('skills') {
                  {{
                    i18n.s(
                      'Administra tus habilidades y tecnologías',
                      'Manage your skills and technologies'
                    )
                  }}
                }
                @case ('projects') {
                  {{
                    i18n.s('Gestiona tu portafolio de proyectos', 'Manage your project portfolio')
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
              {{ i18n.s('Nueva Habilidad', 'New Skill') }}
            </button>
          }
          @if (activeTab() === 'projects') {
            <button class="btn btn-primary" (click)="openProjectModal()">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                />
              </svg>
              {{ i18n.s('Nuevo Proyecto', 'New Project') }}
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
            <app-admin-profile-form
              [profileForm]="profileForm"
              [socialLinks]="socialLinks()"
              [currentCvUrl]="currentCvUrl()"
              [isUploadingCv]="isUploadingCv()"
              [isSaving]="isSaving()"
              (save)="saveProfile()"
              (editSocialLink)="editSocialLink($event)"
              (removeSocialLink)="removeSocialLink($event)"
              (openSocialModal)="openSocialModal()"
              (cvFileSelected)="onCvFileSelected($event)"
              (deleteCv)="deleteCv()"
            />
          }
          @case ('skills') {
            <app-admin-skills-table
              [skills]="skills()"
              (edit)="editSkill($event)"
              (delete)="deleteSkill($event)"
            />
          }
          @case ('projects') {
            <app-admin-projects-grid
              [projects]="projects()"
              (edit)="editProject($event)"
              (delete)="deleteProject($event)"
            />
          }
        }
      </main>

      <app-social-link-modal
        [visible]="showSocialModal()"
        [editingSocialLink]="editingSocialLink()"
        [selectedSocialType]="selectedSocialType()"
        [availableSocialNetworks]="availableSocialNetworks()"
        (save)="saveSocialLink($event)"
        (close)="closeSocialModal()"
        (selectType)="selectSocialType($event)"
        (backToSelect)="backToSocialSelect()"
      />

      <app-skill-modal
        [visible]="showSkillModal()"
        [editingSkill]="editingSkillItem()"
        [skillForm]="skillForm"
        [isSaving]="isSaving()"
        (save)="saveSkill()"
        (close)="closeSkillModal()"
      />

      <app-project-modal
        [visible]="showProjectModal()"
        [editingProject]="editingProjectItem()"
        [projectForm]="projectForm"
        [isSaving]="isSaving()"
        [selectedImages]="selectedImages()"
        [projectImages]="projectImages()"
        (save)="saveProject()"
        (close)="closeProjectModal()"
        (titleChange)="onTitleChange($event)"
        (imagesSelected)="onImagesSelected($event)"
        (removeImage)="removeImage($event)"
        (removeExistingImage)="removeExistingImage($event)"
      />
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

      @media (max-width: 900px) {
        .admin-container {
          flex-direction: column;
        }
        .admin-content {
          padding: 20px 16px;
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
  showSocialModal = signal(false);
  editingSkillItem = signal<Skill | null>(null);
  editingProjectItem = signal<Project | null>(null);
  editingSocialLink = signal<SocialLinkItem | null>(null);
  selectedSocialType = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  selectedImages = signal<SelectedImage[]>([]);
  projectImages = signal<string[]>([]);

  // Social Links
  socialLinks = signal<SocialLinkItem[]>([]);

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

  // ─── Data Loading ───────────────────────────────────────────

  async loadData(): Promise<void> {
    const [profile, skills, projects] = await Promise.all([
      this.supabase.getProfile(),
      this.supabase.getSkills(),
      this.supabase.getAllProjects(),
    ]);

    this.profile.set(profile);
    this.skills.set(skills);
    this.projects.set(projects);

    if (profile?.resume_url) {
      this.currentCvUrl.set(profile.resume_url);
    }

    if (profile?.social_links) {
      const links: SocialLinkItem[] = [];
      const sl = profile.social_links as Record<string, any>;
      for (const network of SOCIAL_NETWORKS) {
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

  // ─── Auth ───────────────────────────────────────────────────

  async logout(): Promise<void> {
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }

  // ─── Profile ────────────────────────────────────────────────

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const formValue = this.profileForm.value;
      const socialLinksObj: any = {};
      for (const link of this.socialLinks()) {
        socialLinksObj[link.type] = link.url;
        socialLinksObj[`${link.type}_enabled`] = true;
      }

      const profileData = {
        name: formValue.name?.trim() || null,
        title: formValue.title?.trim() || null,
        bio: formValue.bio?.trim() || null,
        email: formValue.email?.trim() || null,
        location: formValue.location?.trim() || null,
        social_links: socialLinksObj,
      };

      const currentProfile = await this.supabase.getProfile();
      const result = currentProfile
        ? await this.supabase.updateProfile(profileData)
        : await this.supabase.createProfile(profileData as any);

      if (result.error) {
        this.errorMessage.set(
          result.error instanceof Error
            ? result.error.message
            : (result.error as any)?.message ||
                this.i18n.s('Error al guardar el perfil', 'Error saving profile'),
        );
        this.isSaving.set(false);
        return;
      }

      await this.loadData();
      this.successMessage.set(
        this.i18n.s('Perfil actualizado correctamente', 'Profile updated successfully'),
      );
      this.isSaving.set(false);
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (error: any) {
      this.errorMessage.set(
        error.message || this.i18n.s('Error inesperado al guardar', 'Unexpected error saving'),
      );
      this.isSaving.set(false);
    }
  }

  // ─── Social Links ──────────────────────────────────────────

  availableSocialNetworks() {
    const existingTypes = this.socialLinks().map((l) => l.type);
    return SOCIAL_NETWORKS.filter((n) => !existingTypes.includes(n.type));
  }

  openSocialModal(): void {
    this.showSocialModal.set(true);
    this.selectedSocialType.set(null);
    this.editingSocialLink.set(null);
  }

  closeSocialModal(): void {
    this.showSocialModal.set(false);
    this.selectedSocialType.set(null);
    this.editingSocialLink.set(null);
  }

  selectSocialType(type: string): void {
    this.selectedSocialType.set(type);
  }

  backToSocialSelect(): void {
    this.selectedSocialType.set(null);
  }

  editSocialLink(link: SocialLinkItem): void {
    this.editingSocialLink.set(link);
    this.showSocialModal.set(true);
  }

  saveSocialLink(url: string): void {
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
        this.i18n.s(
          '¿Estás seguro de eliminar esta red social?',
          'Are you sure you want to remove this social network?',
        ),
      )
    )
      return;
    this.socialLinks.set(this.socialLinks().filter((l) => l.type !== type));
  }

  // ─── CV Upload ─────────────────────────────────────────────

  async onCvFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.errorMessage.set(
        this.i18n.s('Solo se permiten archivos PDF', 'Only PDF files are allowed'),
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set(
        this.i18n.s(
          'El archivo es demasiado grande. Máximo 10MB.',
          'File is too large. Maximum 10MB.',
        ),
      );
      return;
    }

    this.isUploadingCv.set(true);
    this.errorMessage.set(null);

    try {
      const result = await this.supabase.uploadCV(file);
      if (result.error) {
        this.errorMessage.set(
          this.i18n.s(
            `Error al subir el CV: ${result.error.message}`,
            `Error uploading CV: ${result.error.message}`,
          ),
        );
        return;
      }

      if (result.url) {
        const updateResult = await this.supabase.updateProfile({ resume_url: result.url });
        if (updateResult.error) {
          this.errorMessage.set(
            this.i18n.s(
              'CV subido pero no se pudo actualizar el perfil',
              'CV uploaded but could not update profile',
            ),
          );
          return;
        }
        this.currentCvUrl.set(result.url);
        this.successMessage.set(
          this.i18n.s('¡CV subido exitosamente!', 'CV uploaded successfully!'),
        );
      }
    } catch {
      this.errorMessage.set(
        this.i18n.s('Error inesperado al subir el CV', 'Unexpected error uploading CV'),
      );
    } finally {
      this.isUploadingCv.set(false);
      input.value = '';
    }
  }

  async deleteCv(): Promise<void> {
    if (
      !confirm(
        this.i18n.s(
          '¿Estás seguro de que quieres eliminar tu CV?',
          'Are you sure you want to delete your CV?',
        ),
      )
    )
      return;

    try {
      const deleteResult = await this.supabase.deleteCV();
      if (deleteResult.error) {
        console.warn('Error deleting CV from storage:', deleteResult.error);
      }

      const updateResult = await this.supabase.updateProfile({ resume_url: null });
      if (updateResult.error) {
        this.errorMessage.set(
          this.i18n.s('Error al actualizar el perfil', 'Error updating profile'),
        );
        return;
      }

      this.currentCvUrl.set(null);
      this.successMessage.set(this.i18n.s('CV eliminado exitosamente', 'CV deleted successfully'));
    } catch {
      this.errorMessage.set(
        this.i18n.s('Error inesperado al eliminar el CV', 'Unexpected error deleting CV'),
      );
    }
  }

  // ─── Skills ────────────────────────────────────────────────

  openSkillModal(skill?: Skill): void {
    if (skill) {
      this.editingSkillItem.set(skill);
      this.skillForm.patchValue({
        label: skill.label,
        icon: skill.icon,
        category: skill.category,
        sort_order: skill.sort_order,
        is_featured: skill.is_featured,
      });
    } else {
      this.editingSkillItem.set(null);
      this.skillForm.reset({ category: 'languages', sort_order: 0, is_featured: false });
    }
    this.showSkillModal.set(true);
  }

  closeSkillModal(): void {
    this.showSkillModal.set(false);
    this.editingSkillItem.set(null);
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

      const result = this.editingSkillItem()
        ? await this.supabase.updateSkill(this.editingSkillItem()!.id, skillData)
        : await this.supabase.createSkill(skillData as any);

      if (result.error) {
        this.errorMessage.set(
          result.error instanceof Error
            ? result.error.message
            : (result.error as any)?.message ||
                this.i18n.s('Error al guardar la habilidad', 'Error saving skill'),
        );
        this.isSaving.set(false);
        return;
      }

      await this.loadData();
      this.closeSkillModal();
      this.successMessage.set(
        this.editingSkillItem()
          ? this.i18n.s('Habilidad actualizada correctamente', 'Skill updated successfully')
          : this.i18n.s('Habilidad creada correctamente', 'Skill created successfully'),
      );
      this.isSaving.set(false);
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (error: any) {
      this.errorMessage.set(
        error.message || this.i18n.s('Error inesperado al guardar', 'Unexpected error saving'),
      );
      this.isSaving.set(false);
    }
  }

  async deleteSkill(id: string): Promise<void> {
    if (
      !confirm(
        this.i18n.s(
          '¿Estás seguro de que quieres eliminar esta habilidad?',
          'Are you sure you want to delete this skill?',
        ),
      )
    )
      return;
    await this.supabase.deleteSkill(id);
    await this.loadData();
  }

  // ─── Projects ──────────────────────────────────────────────

  openProjectModal(project?: Project): void {
    this.selectedImages.set([]);
    if (project) {
      this.editingProjectItem.set(project);
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
      this.editingProjectItem.set(null);
      this.projectImages.set([]);
      this.projectForm.reset({ is_featured: false, is_published: true });
    }
    this.showProjectModal.set(true);
  }

  closeProjectModal(): void {
    this.selectedImages().forEach((img) => URL.revokeObjectURL(img.preview));
    this.showProjectModal.set(false);
    this.editingProjectItem.set(null);
    this.selectedImages.set([]);
    this.projectImages.set([]);
  }

  onTitleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const slug = this.generateSlug(input.value);
    this.projectForm.patchValue({ slug });
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files).slice(0, 10);
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
    this.projectImages.set(this.projectImages().filter((_, i) => i !== index));
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

      const galleryUrls: string[] = [...this.projectImages()];
      const images = this.selectedImages();
      const uploadErrors: string[] = [];

      if (images.length > 0) {
        const projectSlug =
          formValue.slug?.trim() ||
          formValue.title?.toLowerCase().replace(/\s+/g, '-') ||
          'projects';
        for (const imageData of images) {
          const uploadResult = await this.supabase.uploadImage(imageData.file, projectSlug);
          if (uploadResult.error) {
            console.error('Error uploading image:', imageData.name, uploadResult.error);
            uploadErrors.push(`${imageData.name}: ${uploadResult.error.message}`);
          } else if (uploadResult?.url && typeof uploadResult.url === 'string') {
            galleryUrls.push(uploadResult.url);
          }
        }

        if (uploadErrors.length > 0 && galleryUrls.length === this.projectImages().length) {
          this.errorMessage.set(
            this.i18n.s(
              `Error al subir imágenes. Verifica que el bucket 'proyectos_fotos' tenga políticas RLS configuradas para INSERT. Errores: ${uploadErrors.join(', ')}`,
              `Error uploading images. Check that bucket 'proyectos_fotos' has RLS policies for INSERT. Errors: ${uploadErrors.join(', ')}`,
            ),
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
        image_url: galleryUrls[0] || null,
        gallery_urls: galleryUrls,
        live_link: formValue.live_link?.trim() || null,
        repo_link: formValue.repo_link?.trim() || null,
        is_featured: Boolean(formValue.is_featured),
        is_published: formValue.is_published !== undefined ? Boolean(formValue.is_published) : true,
      };

      const result = this.editingProjectItem()
        ? await this.supabase.updateProject(this.editingProjectItem()!.id, projectData)
        : await this.supabase.createProject(projectData as any);

      if (result.error) {
        this.errorMessage.set(
          result.error instanceof Error
            ? result.error.message
            : (result.error as any)?.message ||
                this.i18n.s('Error al guardar el proyecto', 'Error saving project'),
        );
        this.isSaving.set(false);
        return;
      }

      await this.loadData();
      this.closeProjectModal();
      this.successMessage.set(
        this.editingProjectItem()
          ? this.i18n.s('Proyecto actualizado correctamente', 'Project updated successfully')
          : this.i18n.s('Proyecto creado correctamente', 'Project created successfully'),
      );
      this.isSaving.set(false);
      setTimeout(() => this.successMessage.set(null), 3000);
    } catch (error: any) {
      this.errorMessage.set(
        error.message || this.i18n.s('Error inesperado al guardar', 'Unexpected error saving'),
      );
      this.isSaving.set(false);
    }
  }

  async deleteProject(id: string): Promise<void> {
    if (
      !confirm(
        this.i18n.s(
          '¿Estás seguro de que quieres eliminar este proyecto?',
          'Are you sure you want to delete this project?',
        ),
      )
    )
      return;
    await this.supabase.deleteProject(id);
    await this.loadData();
  }
}
