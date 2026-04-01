// ─── Design Tab Types ────────────────────────────────────────────────────────

export type PhotoOption = 'couple' | 'venue-ai' | 'none';

export type WizardStep = 'estilo' | 'foto' | 'site' | 'papelaria';

export interface DesignToolkit {
  id: string;
  name: string;
  mood: string;
  accent: string;
  bg: string;
  bgDark: string;
  text: string;
  swatches: string[];
  fontFamily: string;
  monoStyle: 'classic' | 'botanical' | 'terracota' | 'midnight' | 'lavanda';
}

export interface DesignState {
  selectedToolkit: string;
  photoOption: PhotoOption;
  wizardStep: WizardStep;
  screen: DesignScreen;
}

export type DesignScreen =
  | 'home'
  | 'wizard'
  | 'preview-site'
  | 'preview-std';

export const TOOLKITS: DesignToolkit[] = [
  {
    id: 'dourado',
    name: 'Dourado Clássico',
    mood: 'Elegante · Atemporal',
    accent: '#A98950',
    bg: '#FAF6EF',
    bgDark: '#F0E8DA',
    text: '#3D322A',
    swatches: ['#A98950', '#F0E8DA', '#3D322A', '#C4A76C'],
    fontFamily: 'Josefin Sans',
    monoStyle: 'classic',
  },
  {
    id: 'botanico',
    name: 'Verde Botânico',
    mood: 'Natural · Jardim',
    accent: '#6B7C5E',
    bg: '#F5F2EC',
    bgDark: '#E8E3D9',
    text: '#443E34',
    swatches: ['#6B7C5E', '#E8E3D9', '#443E34', '#8FA67A'],
    fontFamily: 'Cormorant Garamond',
    monoStyle: 'botanical',
  },
  {
    id: 'terracota',
    name: 'Terracota Poético',
    mood: 'Caloroso · Poesia',
    accent: '#B5704F',
    bg: '#FDF8F4',
    bgDark: '#F0E4D8',
    text: '#5A3C28',
    swatches: ['#B5704F', '#F0E4D8', '#5A3C28', '#D4956E'],
    fontFamily: 'Playfair Display',
    monoStyle: 'terracota',
  },
  {
    id: 'midnight',
    name: 'Midnight Moderno',
    mood: 'Sofisticado · Noite',
    accent: '#C2A97E',
    bg: '#1C1A17',
    bgDark: '#2A2722',
    text: '#E8DCC8',
    swatches: ['#C2A97E', '#2A2722', '#E8DCC8', '#8B7D64'],
    fontFamily: 'Josefin Sans',
    monoStyle: 'midnight',
  },
  {
    id: 'lavanda',
    name: 'Lavanda Romântico',
    mood: 'Delicado · Romance',
    accent: '#8B7BA5',
    bg: '#FAF8FC',
    bgDark: '#EDE8F2',
    text: '#4A3D5C',
    swatches: ['#8B7BA5', '#EDE8F2', '#4A3D5C', '#B8A9CC'],
    fontFamily: 'EB Garamond',
    monoStyle: 'lavanda',
  },
];
