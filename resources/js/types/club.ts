export interface Club {
  id: number
  nom: string
  type: 'sportif' | 'culturel' | 'scientifique' | 'humanitaire' | 'autre'
  description: string | null
  statut: 'en_attente' | 'actif' | 'suspendu' | 'dissous'
  responsable_id: number
  membres_count?: number
  created_at: string
}

export interface Adhesion {
  id: number
  user_id: number
  club_id: number
  statut: 'en_attente' | 'approuvee' | 'rejetee' | 'quittee'
  role_dans_club: 'membre' | 'vice_president' | 'tresorier' | 'secretaire'
  created_at: string
  updated_at: string
}
