// ============================================
// TIPOS DE BASE DE DATOS - SUPABASE
// ============================================

export interface ProfileInfo {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  email: string | null;
  location: string | null;
  avatar_url: string | null;
  resume_url: string | null;
  social_links: SocialLinks;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  github?: string;
  github_enabled?: boolean;
  linkedin?: string;
  linkedin_enabled?: boolean;
  twitter?: string;
  twitter_enabled?: boolean;
  instagram?: string;
  instagram_enabled?: boolean;
  youtube?: string;
  youtube_enabled?: boolean;
  website?: string;
  website_enabled?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface Skill {
  id: string;
  label: string;
  icon: string | null;
  category: SkillCategory;
  proficiency: number;
  years_experience: number | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SkillCategory = 'languages' | 'frameworks' | 'databases' | 'tools' | 'other';

export interface Project {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  long_description: string | null;
  tech_stack: string[];
  image_url: string | null;
  gallery_urls: string[];
  live_link: string | null;
  repo_link: string | null;
  is_featured: boolean;
  is_published: boolean;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string | null;
  responsibilities: string[];
  tech_used: string[];
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  company_logo_url: string | null;
  company_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Tipos para operaciones CRUD
export type ProfileInfoInsert = Omit<ProfileInfo, 'id' | 'created_at' | 'updated_at'>;
export type ProfileInfoUpdate = Partial<ProfileInfoInsert>;

export type SkillInsert = Omit<Skill, 'id' | 'created_at' | 'updated_at'>;
export type SkillUpdate = Partial<SkillInsert>;

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdate = Partial<ProjectInsert>;

export type ExperienceInsert = Omit<Experience, 'id' | 'created_at' | 'updated_at'>;
export type ExperienceUpdate = Partial<ExperienceInsert>;

// Tipo para archivos del explorador
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  icon?: string;
  route?: string;
  extension?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

// Tipo para pestañas abiertas
export interface EditorTab {
  id: string;
  name: string;
  route: string;
  icon?: string;
  extension?: string;
  isActive: boolean;
  isDirty?: boolean;
}
