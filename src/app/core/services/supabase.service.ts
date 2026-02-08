import { computed, Injectable, signal } from '@angular/core';
import {
  AuthChangeEvent,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import {
  Experience,
  ExperienceInsert,
  ExperienceUpdate,
  ProfileInfo,
  ProfileInfoInsert,
  ProfileInfoUpdate,
  Project,
  ProjectInsert,
  ProjectUpdate,
  Skill,
  SkillInsert,
  SkillUpdate,
} from '../models/database.types';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private _isConfigured = false;

  // Signals para estado de autenticación
  private _currentUser = signal<User | null>(null);
  private _session = signal<Session | null>(null);
  private _isLoading = signal<boolean>(true);

  // Computed signals públicos
  currentUser = computed(() => this._currentUser());
  session = computed(() => this._session());
  isAuthenticated = computed(() => !!this._session());
  isLoading = computed(() => this._isLoading());

  constructor() {
    // Verificar si Supabase está configurado
    if (
      environment.supabase.url &&
      environment.supabase.url !== 'YOUR_SUPABASE_URL' &&
      environment.supabase.anonKey &&
      environment.supabase.anonKey !== 'YOUR_SUPABASE_ANON_KEY'
    ) {
      this._isConfigured = true;
      this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);

      // Escuchar cambios de autenticación
      this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        this._session.set(session);
        this._currentUser.set(session?.user ?? null);
        this._isLoading.set(false);
      });

      // Verificar sesión inicial
      this.loadSession();
    } else {
      console.warn('Supabase no está configurado. Configura tus credenciales en environment.ts');
      this._isLoading.set(false);
    }
  }

  get isConfigured(): boolean {
    return this._isConfigured;
  }

  private async loadSession(): Promise<void> {
    if (!this.supabase) return;
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      this._session.set(session);
      this._currentUser.set(session?.user ?? null);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  // ============================================
  // AUTENTICACIÓN
  // ============================================

  async signIn(email: string, password: string): Promise<{ error: Error | null }> {
    if (!this.supabase) {
      return { error: new Error('Supabase no está configurado') };
    }
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }

  async signOut(): Promise<void> {
    if (!this.supabase) return;
    await this.supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    if (!this.supabase) {
      return { error: new Error('Supabase no está configurado') };
    }
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    return { error };
  }

  // ============================================
  // PROFILE INFO - CRUD
  // ============================================

  async getProfile(): Promise<ProfileInfo | null> {
    if (!this.supabase) {
      return null;
    }

    // Usar maybeSingle() en lugar de single() para manejar cuando no hay registros
    const { data, error } = await this.supabase.from('profile_info').select('*').maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  async updateProfile(
    profile: ProfileInfoUpdate,
  ): Promise<{ data: ProfileInfo | null; error: Error | null }> {
    if (!this.supabase) {
      return { data: null, error: new Error('Supabase no está configurado') };
    }

    // Primero verificar si existe un perfil
    const existingProfile = await this.getProfile();

    if (!existingProfile) {
      // Si no existe, crear uno nuevo
      return await this.createProfile(profile as ProfileInfoInsert);
    }

    // Si existe, actualizar usando el ID
    const { data, error } = await this.supabase
      .from('profile_info')
      .update(profile)
      .eq('id', existingProfile.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error as any };
    }

    return { data, error: null };
  }

  async createProfile(
    profile: ProfileInfoInsert,
  ): Promise<{ data: ProfileInfo | null; error: Error | null }> {
    if (!this.supabase) {
      return { data: null, error: new Error('Supabase no está configurado') };
    }
    const { data, error } = await this.supabase
      .from('profile_info')
      .insert(profile)
      .select()
      .single();

    return { data, error };
  }

  // ============================================
  // SKILLS - CRUD
  // ============================================

  async getSkills(): Promise<Skill[]> {
    if (!this.supabase) {
      return [];
    }
    const { data, error } = await this.supabase
      .from('skills')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
    return data || [];
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    if (!this.supabase) {
      return [];
    }
    const { data, error } = await this.supabase
      .from('skills')
      .select('*')
      .eq('category', category)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching skills by category:', error);
      return [];
    }
    return data || [];
  }

  async getFeaturedSkills(): Promise<Skill[]> {
    if (!this.supabase) {
      return [];
    }
    const { data, error } = await this.supabase
      .from('skills')
      .select('*')
      .eq('is_featured', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching featured skills:', error);
      return [];
    }
    return data || [];
  }

  async createSkill(skill: SkillInsert): Promise<{ data: Skill | null; error: Error | null }> {
    if (!this.supabase) {
      return { data: null, error: new Error('Supabase no está configurado') };
    }
    const { data, error } = await this.supabase.from('skills').insert(skill).select().single();

    return { data, error };
  }

  async updateSkill(
    id: string,
    skill: SkillUpdate,
  ): Promise<{ data: Skill | null; error: Error | null }> {
    if (!this.supabase) {
      return { data: null, error: new Error('Supabase no está configurado') };
    }
    const { data, error } = await this.supabase
      .from('skills')
      .update(skill)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async deleteSkill(id: string): Promise<{ error: Error | null }> {
    if (!this.supabase) {
      return { error: new Error('Supabase no está configurado') };
    }
    const { error } = await this.supabase.from('skills').delete().eq('id', id);

    return { error };
  }

  // ============================================
  // PROJECTS - CRUD
  // ============================================

  async getProjects(): Promise<Project[]> {
    if (!this.supabase) {
      return [];
    }
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    return data || [];
  }

  async getAllProjects(): Promise<Project[]> {
    if (!this.supabase) {
      return [];
    }
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching all projects:', error);
      return [];
    }
    return data || [];
  }

  async getFeaturedProjects(): Promise<Project[]> {
    if (!this.supabase) {
      return [];
    }
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('is_featured', true)
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching featured projects:', error);
      return [];
    }
    return data || [];
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    if (!this.supabase) {
      return null;
    }
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }
    return data;
  }

  async createProject(
    project: ProjectInsert,
  ): Promise<{ data: Project | null; error: Error | null }> {
    if (!this.supabase) {
      return { data: null, error: new Error('Supabase no está configurado') };
    }
    const { data, error } = await this.supabase.from('projects').insert(project).select().single();

    return { data, error };
  }

  async updateProject(
    id: string,
    project: ProjectUpdate,
  ): Promise<{ data: Project | null; error: Error | null }> {
    if (!this.supabase) {
      return { data: null, error: new Error('Supabase no está configurado') };
    }
    const { data, error } = await this.supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async deleteProject(id: string): Promise<{ error: Error | null }> {
    if (!this.supabase) {
      return { error: new Error('Supabase no está configurado') };
    }
    const { error } = await this.supabase.from('projects').delete().eq('id', id);

    return { error };
  }

  // ============================================
  // EXPERIENCES - CRUD
  // ============================================

  async getExperiences(): Promise<Experience[]> {
    if (!this.supabase) {
      return [];
    }
    const { data, error } = await this.supabase
      .from('experiences')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching experiences:', error);
      return [];
    }
    return data || [];
  }

  async createExperience(
    experience: ExperienceInsert,
  ): Promise<{ data: Experience | null; error: Error | null }> {
    if (!this.supabase) {
      return { data: null, error: new Error('Supabase no está configurado') };
    }
    const { data, error } = await this.supabase
      .from('experiences')
      .insert(experience)
      .select()
      .single();

    return { data, error };
  }

  async updateExperience(
    id: string,
    experience: ExperienceUpdate,
  ): Promise<{ data: Experience | null; error: Error | null }> {
    if (!this.supabase) {
      return { data: null, error: new Error('Supabase no está configurado') };
    }
    const { data, error } = await this.supabase
      .from('experiences')
      .update(experience)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  async deleteExperience(id: string): Promise<{ error: Error | null }> {
    if (!this.supabase) {
      return { error: new Error('Supabase no está configurado') };
    }
    const { error } = await this.supabase.from('experiences').delete().eq('id', id);

    return { error };
  }

  // ============================================
  // STORAGE - IMÁGENES
  // ============================================

  private readonly STORAGE_BUCKET = 'proyectos_fotos';

  async uploadImage(
    file: File,
    path: string,
  ): Promise<{ url: string | null; error: Error | null }> {
    if (!this.supabase) {
      return { url: null, error: new Error('Supabase no está configurado') };
    }

    // Limpiar el path de caracteres especiales
    const cleanPath = path
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${cleanPath}/${fileName}`;

    console.log('Uploading image to:', this.STORAGE_BUCKET, filePath);

    const { data, error } = await this.supabase.storage
      .from(this.STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error };
    }

    console.log('Upload success:', data);

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.STORAGE_BUCKET).getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);

    return { url: publicUrl, error: null };
  }

  async deleteImage(path: string): Promise<{ error: Error | null }> {
    if (!this.supabase) {
      return { error: new Error('Supabase no está configurado') };
    }
    const { error } = await this.supabase.storage.from(this.STORAGE_BUCKET).remove([path]);

    return { error };
  }

  getImageUrl(path: string): string {
    if (!this.supabase) {
      return '';
    }
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.STORAGE_BUCKET).getPublicUrl(path);
    return publicUrl;
  }
}
