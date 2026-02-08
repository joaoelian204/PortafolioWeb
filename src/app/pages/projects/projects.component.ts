import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Project } from '../../core/models/database.types';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  template: `
    <div class="code-editor">
      @if (projects().length > 0) {
        <div class="line-numbers">
          @for (line of lineNumbers(); track line) {
            <span class="line-number">{{ line }}</span>
          }
        </div>
      }
      <div class="code-content">
        @if (projects().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
            </div>
            <h3 class="empty-title">
              {{ i18n.language() === 'es' ? 'Próximamente...' : 'Coming soon...' }}
            </h3>
            <p class="empty-message">
              <span class="comment"
                >//
                {{
                  i18n.language() === 'es'
                    ? 'Contenido en construcción'
                    : 'Content under construction'
                }}</span
              >
            </p>
          </div>
        } @else {
          <div class="projects-container">
            @for (project of projects(); track project.id) {
              <div class="project-card" [class.featured-card]="project.is_featured">
                <!-- Header con título y badges -->
                <div class="project-header-bar">
                  <div class="header-left">
                    <span class="file-icon">📄</span>
                    <h3 class="project-title">{{ project.title }}</h3>
                  </div>
                  @if (project.is_featured) {
                    <span class="badge featured"
                      >⭐ {{ i18n.language() === 'es' ? 'Destacado' : 'Featured' }}</span
                    >
                  }
                </div>

                <!-- Galería de imágenes mejorada -->
                @if (project.gallery_urls && project.gallery_urls.length > 0) {
                  <div class="project-gallery">
                    <div class="gallery-main">
                      @for (imageUrl of project.gallery_urls; track $index) {
                        <div
                          class="gallery-slide"
                          [class.active]="$index === getCurrentSlide(project.id)"
                        >
                          <img
                            [src]="imageUrl"
                            [alt]="project.title + ' - Image ' + ($index + 1)"
                            loading="lazy"
                            (error)="onImageError($event)"
                            (click)="openLightbox(project.gallery_urls, $index)"
                          />
                        </div>
                      }
                      <!-- Overlay con controles -->
                      <div class="gallery-overlay">
                        @if (project.gallery_urls.length > 1) {
                          <button
                            class="nav-btn prev"
                            (click)="previousSlide(project.id, project.gallery_urls!.length)"
                            aria-label="Previous image"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                            >
                              <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                          </button>
                          <button
                            class="nav-btn next"
                            (click)="nextSlide(project.id, project.gallery_urls!.length)"
                            aria-label="Next image"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </button>
                        }
                        <div class="image-counter">
                          {{ getCurrentSlide(project.id) + 1 }} / {{ project.gallery_urls.length }}
                        </div>
                      </div>
                    </div>
                    <!-- Miniaturas -->
                    @if (project.gallery_urls.length > 1) {
                      <div class="gallery-thumbnails">
                        @for (imageUrl of project.gallery_urls; track $index) {
                          <button
                            class="thumbnail"
                            [class.active]="$index === getCurrentSlide(project.id)"
                            (click)="
                              goToSlide(project.id, $index);
                              onManualSlideChange(project.id, project.gallery_urls.length)
                            "
                          >
                            <img
                              [src]="imageUrl"
                              [alt]="'Thumbnail ' + ($index + 1)"
                              loading="lazy"
                              (error)="onImageError($event)"
                            />
                          </button>
                        }
                      </div>
                    }
                  </div>
                } @else if (project.image_url) {
                  <div class="project-gallery">
                    <div class="gallery-main single">
                      <img
                        [src]="project.image_url"
                        [alt]="project.title"
                        loading="lazy"
                        (error)="onImageError($event)"
                      />
                    </div>
                  </div>
                } @else {
                  <!-- Placeholder cuando no hay imagen -->
                  <div class="project-gallery">
                    <div class="gallery-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>{{ i18n.language() === 'es' ? 'Sin imagen' : 'No image' }}</span>
                    </div>
                  </div>
                }

                <!-- Contenido del proyecto -->
                <div class="project-content">
                  <div class="description-container">
                    <p
                      class="project-description"
                      [class.expanded]="isDescriptionExpanded(project.id)"
                    >
                      {{ project.description }}
                    </p>
                    @if (project.description && project.description.length > 80) {
                      <button class="see-more-btn" (click)="toggleDescription(project.id)">
                        {{
                          isDescriptionExpanded(project.id)
                            ? i18n.language() === 'es'
                              ? 'Ver menos'
                              : 'See less'
                            : i18n.language() === 'es'
                              ? 'Ver más'
                              : 'See more'
                        }}
                      </button>
                    }
                  </div>

                  <!-- Tech Stack con mejor diseño -->
                  <div class="tech-section">
                    <span class="tech-label">
                      <svg viewBox="0 0 16 16" fill="currentColor" class="tech-icon">
                        <path
                          d="M14 1H3L2 2v12l1 1h11l1-1V2l-1-1zM8 13H3.5L8 8.5V13zm0-5.207L3.207 3H8v4.793zM12.5 13H9V8.5l4.5 4.5H12.5zM13 7.793V3H9.207L13 6.793V7.793z"
                        />
                      </svg>
                      {{ i18n.language() === 'es' ? 'Tecnologías' : 'Technologies' }}
                    </span>
                    <div class="project-tech">
                      @for (tech of project.tech_stack; track tech) {
                        <span class="tech-tag">{{ tech }}</span>
                      }
                    </div>
                  </div>

                  <!-- Links mejorados -->
                  <div class="project-actions">
                    @if (project.live_link) {
                      <a
                        [href]="project.live_link"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="action-btn primary"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        {{ i18n.t('projects.liveDemo') }}
                      </a>
                    }
                    @if (project.repo_link) {
                      <a
                        [href]="project.repo_link"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="action-btn secondary"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path
                            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
                          />
                        </svg>
                        {{ i18n.t('projects.repository') }}
                      </a>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Lightbox Modal -->
    @if (lightboxOpen()) {
      <div class="lightbox-overlay" (click)="closeLightbox()">
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <button class="lightbox-close" (click)="closeLightbox()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="lightbox-image-container">
            <img
              [src]="lightboxImages()[lightboxCurrentIndex()]"
              [alt]="'Image ' + (lightboxCurrentIndex() + 1)"
            />
          </div>

          @if (lightboxImages().length > 1) {
            <button class="lightbox-nav prev" (click)="lightboxPrev()" aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button class="lightbox-nav next" (click)="lightboxNext()" aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <div class="lightbox-counter">
              {{ lightboxCurrentIndex() + 1 }} / {{ lightboxImages().length }}
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .code-editor {
        display: flex;
        height: 100%;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.6;
      }

      .line-numbers {
        padding: 16px 0;
        background-color: var(--vscode-editorLineNumber-background, transparent);
        color: var(--vscode-editorLineNumber-foreground, #858585);
        text-align: right;
        user-select: none;
        min-width: 50px;
        padding-right: 16px;
        border-right: 1px solid var(--vscode-editorIndentGuide-background, #404040);
      }

      .line-number {
        display: block;
        padding: 0 8px;
      }

      .code-content {
        flex: 1;
        padding: 16px 24px;
        overflow-x: auto;
      }

      .code {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .property {
        color: #9cdcfe;
      }
      .string {
        color: #ce9178;
      }
      .number {
        color: #b5cea8;
      }
      .keyword {
        color: #569cd6;
      }
      .punctuation {
        color: #d4d4d4;
      }
      .comment {
        color: #6a9955;
      }
      .code-inline {
        color: #dcdcaa;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 3px;
      }
      .link {
        color: #4ec9b0;
        text-decoration: underline;
        cursor: pointer;
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        padding: 40px 20px;
      }

      .empty-icon {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
        color: var(--vscode-textLink-foreground, #3794ff);
      }

      .empty-icon svg {
        width: 100%;
        height: 100%;
      }

      .empty-title {
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 12px;
      }

      .empty-message {
        color: var(--vscode-descriptionForeground, #858585);
        font-size: 14px;
        line-height: 1.6;
        max-width: 500px;
      }

      /* Projects Container */
      .projects-container {
        padding: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        justify-content: center;
      }

      @media (max-width: 500px) {
        .projects-container {
          padding: 12px;
          gap: 12px;
        }
      }

      .project-card {
        background-color: var(--vscode-sideBar-background, #252526);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 6px;
        overflow: hidden;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        width: 320px;
        max-width: 100%;
        flex-shrink: 0;
      }

      .project-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        border-color: var(--vscode-focusBorder, #007fd4);
      }

      .project-card.featured-card {
        border-color: rgba(204, 167, 0, 0.3);
      }

      /* Header Bar */
      .project-header-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        background-color: var(--vscode-editor-background, #1e1e1e);
        border-bottom: 1px solid var(--vscode-panel-border, #3c3c3c);
        gap: 6px;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        flex: 1;
      }

      .file-icon {
        font-size: 12px;
        flex-shrink: 0;
      }

      .project-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--vscode-editor-foreground, #d4d4d4);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 6px;
        font-size: 9px;
        font-weight: 600;
        border-radius: 6px;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .badge.featured {
        background-color: rgba(204, 167, 0, 0.2);
        color: #e5c300;
      }

      /* Gallery Styles */
      .project-gallery {
        position: relative;
        background-color: var(--vscode-editor-background, #1e1e1e);
      }

      .gallery-main {
        position: relative;
        width: 100%;
        height: 160px;
        overflow: hidden;
      }

      .gallery-main.single img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: transform 0.2s ease;
        cursor: pointer;
      }

      .project-card:hover .gallery-main.single img {
        transform: scale(1.02);
      }

      .gallery-slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .gallery-slide.active {
        opacity: 1;
        z-index: 1;
      }

      .gallery-slide img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        cursor: pointer;
      }

      .gallery-overlay {
        position: absolute;
        inset: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 6px;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }

      .project-card:hover .gallery-overlay {
        opacity: 1;
      }

      .nav-btn {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.6);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        pointer-events: auto;
      }

      .nav-btn:hover {
        background-color: rgba(0, 0, 0, 0.8);
      }

      .nav-btn svg {
        width: 12px;
        height: 12px;
      }

      .image-counter {
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 9px;
        font-weight: 500;
        pointer-events: auto;
      }

      /* Thumbnails */
      .gallery-thumbnails {
        display: flex;
        gap: 4px;
        padding: 4px 6px;
        background-color: var(--vscode-sideBar-background, #252526);
        overflow-x: auto;
        scrollbar-width: none;
      }

      .gallery-thumbnails::-webkit-scrollbar {
        display: none;
      }

      .thumbnail {
        width: 28px;
        height: 20px;
        border-radius: 2px;
        overflow: hidden;
        border: 1px solid transparent;
        cursor: pointer;
        padding: 0;
        background: none;
        flex-shrink: 0;
        opacity: 0.5;
        transition: all 0.2s ease;
      }

      .thumbnail:hover {
        opacity: 0.8;
      }

      .thumbnail.active {
        border-color: var(--vscode-focusBorder, #007fd4);
        opacity: 1;
      }

      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* Placeholder */
      .gallery-placeholder {
        height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--vscode-descriptionForeground, #858585);
      }

      .gallery-placeholder svg {
        width: 24px;
        height: 24px;
        opacity: 0.3;
      }

      .gallery-placeholder span {
        font-size: 10px;
        opacity: 0.5;
      }

      /* Content */
      .project-content {
        padding: 10px;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .description-container {
        margin-bottom: 8px;
      }

      .project-description {
        color: var(--vscode-descriptionForeground, #a0a0a0);
        font-size: 11px;
        line-height: 1.5;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .project-description.expanded {
        display: block;
        -webkit-line-clamp: unset;
        overflow: visible;
      }

      .see-more-btn {
        background: none;
        border: none;
        color: var(--vscode-textLink-foreground, #3794ff);
        font-size: 10px;
        padding: 2px 0;
        cursor: pointer;
        text-decoration: none;
        margin-top: 2px;
      }

      .see-more-btn:hover {
        text-decoration: underline;
      }

      /* Tech Section */
      .tech-section {
        margin-bottom: 8px;
      }

      .tech-label {
        display: none;
      }

      .tech-icon {
        width: 10px;
        height: 10px;
      }

      .project-tech {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .tech-tag {
        padding: 2px 6px;
        font-size: 9px;
        font-weight: 500;
        background-color: var(--vscode-badge-background, #4d4d4d);
        color: var(--vscode-badge-foreground, #ffffff);
        border-radius: 3px;
      }

      /* Action Buttons */
      .project-actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: auto;
      }

      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        font-size: 10px;
        font-weight: 500;
        border-radius: 3px;
        text-decoration: none;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }

      .action-btn svg {
        width: 10px;
        height: 10px;
      }

      .action-btn.primary {
        background-color: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #ffffff);
      }

      .action-btn.primary:hover {
        background-color: var(--vscode-button-hoverBackground, #1177bb);
      }

      .action-btn.secondary {
        background-color: transparent;
        color: var(--vscode-editor-foreground, #d4d4d4);
        border-color: var(--vscode-panel-border, #4c4c4c);
      }

      .action-btn.secondary:hover {
        background-color: var(--vscode-toolbar-hoverBackground, rgba(90, 93, 94, 0.31));
      }

      /* Lightbox Styles */
      .lightbox-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        cursor: pointer;
      }

      .lightbox-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        cursor: default;
      }

      .lightbox-image-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .lightbox-image-container img {
        max-width: 90vw;
        max-height: 85vh;
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
      }

      .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        background: transparent;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 8px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      .lightbox-close:hover {
        opacity: 1;
      }

      .lightbox-close svg {
        width: 24px;
        height: 24px;
      }

      .lightbox-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.5);
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 16px 12px;
        border-radius: 4px;
        opacity: 0.8;
        transition: all 0.2s;
      }

      .lightbox-nav:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.7);
      }

      .lightbox-nav svg {
        width: 24px;
        height: 24px;
      }

      .lightbox-nav.prev {
        left: -60px;
      }

      .lightbox-nav.next {
        right: -60px;
      }

      .lightbox-counter {
        position: absolute;
        bottom: -35px;
        left: 50%;
        transform: translateX(-50%);
        color: #fff;
        font-size: 14px;
        opacity: 0.8;
      }

      @media (max-width: 768px) {
        .lightbox-nav.prev {
          left: 10px;
        }

        .lightbox-nav.next {
          right: 10px;
        }

        .lightbox-close {
          top: -50px;
          right: 10px;
        }
      }
    `,
  ],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  supabase = inject(SupabaseService);
  i18n = inject(I18nService);

  projects = signal<Project[]>([]);
  lineNumbers = signal<number[]>([]);
  currentSlides = signal<Map<string, number>>(new Map());
  expandedDescriptions = signal<Set<string>>(new Set());

  // Lightbox state
  lightboxOpen = signal<boolean>(false);
  lightboxImages = signal<string[]>([]);
  lightboxCurrentIndex = signal<number>(0);

  // Autoplay state
  private autoplayIntervals = new Map<string, ReturnType<typeof setInterval>>();
  private readonly AUTOPLAY_DELAY = 4000; // 4 segundos

  today = new Date().toISOString().split('T')[0];

  constructor() {
    // Regenerar números de línea cuando cambie el idioma
    effect(() => {
      this.i18n.language();
      this.updateLineNumbers();
    });
  }

  isDescriptionExpanded(projectId: string): boolean {
    return this.expandedDescriptions().has(projectId);
  }

  toggleDescription(projectId: string): void {
    this.expandedDescriptions.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  }

  getCurrentSlide(projectId: string): number {
    return this.currentSlides().get(projectId) || 0;
  }

  nextSlide(projectId: string, totalSlides: number): void {
    const current = this.getCurrentSlide(projectId);
    const next = (current + 1) % totalSlides;
    this.currentSlides.update((map) => {
      const newMap = new Map(map);
      newMap.set(projectId, next);
      return newMap;
    });
  }

  previousSlide(projectId: string, totalSlides: number): void {
    const current = this.getCurrentSlide(projectId);
    const prev = (current - 1 + totalSlides) % totalSlides;
    this.currentSlides.update((map) => {
      const newMap = new Map(map);
      newMap.set(projectId, prev);
      return newMap;
    });
    // Reiniciar autoplay al interactuar manualmente
    this.resetAutoplay(projectId, totalSlides);
  }

  goToSlide(projectId: string, index: number): void {
    this.currentSlides.update((map) => {
      const newMap = new Map(map);
      newMap.set(projectId, index);
      return newMap;
    });
  }

  // Llamar cuando el usuario hace click en prev button o thumbnail
  onManualSlideChange(projectId: string, totalSlides: number): void {
    this.resetAutoplay(projectId, totalSlides);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Usar un placeholder cuando la imagen falla
    img.src =
      'data:image/svg+xml,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect fill="#1e1e1e" width="400" height="300"/>
        <rect fill="#252526" x="150" y="100" width="100" height="100" rx="8"/>
        <text x="200" y="160" fill="#858585" font-family="sans-serif" font-size="14" text-anchor="middle">Image</text>
        <text x="200" y="180" fill="#858585" font-family="sans-serif" font-size="12" text-anchor="middle">not available</text>
      </svg>
    `);
    img.style.objectFit = 'contain';
  }

  // Lightbox methods
  openLightbox(images: string[], index: number): void {
    this.lightboxImages.set(images);
    this.lightboxCurrentIndex.set(index);
    this.lightboxOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
    document.body.style.overflow = '';
  }

  lightboxPrev(): void {
    const total = this.lightboxImages().length;
    const current = this.lightboxCurrentIndex();
    this.lightboxCurrentIndex.set((current - 1 + total) % total);
  }

  lightboxNext(): void {
    const total = this.lightboxImages().length;
    const current = this.lightboxCurrentIndex();
    this.lightboxCurrentIndex.set((current + 1) % total);
  }

  featuredCount(): number {
    return this.projects().filter((p) => p.is_featured).length;
  }

  uniqueTechCount(): number {
    const allTech = this.projects().flatMap((p) => p.tech_stack);
    return new Set(allTech).size;
  }

  async ngOnInit(): Promise<void> {
    const projects = await this.supabase.getProjects();
    this.projects.set(projects);
    this.updateLineNumbers();
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAllAutoplay();
  }

  private startAutoplay(): void {
    this.projects().forEach((project) => {
      if (project.gallery_urls && project.gallery_urls.length > 1) {
        this.startProjectAutoplay(project.id, project.gallery_urls.length);
      }
    });
  }

  private startProjectAutoplay(projectId: string, totalSlides: number): void {
    // Limpiar intervalo existente si hay uno
    this.stopProjectAutoplay(projectId);

    const interval = setInterval(() => {
      // No avanzar si el lightbox está abierto
      if (!this.lightboxOpen()) {
        this.nextSlide(projectId, totalSlides);
      }
    }, this.AUTOPLAY_DELAY);

    this.autoplayIntervals.set(projectId, interval);
  }

  private stopProjectAutoplay(projectId: string): void {
    const interval = this.autoplayIntervals.get(projectId);
    if (interval) {
      clearInterval(interval);
      this.autoplayIntervals.delete(projectId);
    }
  }

  private stopAllAutoplay(): void {
    this.autoplayIntervals.forEach((interval) => clearInterval(interval));
    this.autoplayIntervals.clear();
  }

  // Reiniciar autoplay cuando el usuario interactúa manualmente
  private resetAutoplay(projectId: string, totalSlides: number): void {
    this.startProjectAutoplay(projectId, totalSlides);
  }

  private updateLineNumbers(): void {
    // Generate line numbers - ajustar según si hay proyectos o no
    if (this.projects().length === 0) {
      this.lineNumbers.set(Array.from({ length: 20 }, (_, i) => i + 1));
    } else {
      // Calcular líneas basado en el número de proyectos (cada proyecto ocupa ~15 líneas en el JSON)
      const baseLines = 20;
      const projectLines = this.projects().length * 15;
      this.lineNumbers.set(Array.from({ length: baseLines + projectLines }, (_, i) => i + 1));
    }
  }
}
