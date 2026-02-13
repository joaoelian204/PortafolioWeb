export type AdminTab = 'profile' | 'skills' | 'projects';

export interface SocialNetwork {
  type: string;
  name: string;
  placeholder: string;
}

export interface SocialLinkItem {
  type: string;
  url: string;
}

export interface SelectedImage {
  file: File;
  preview: string;
  name: string;
}
