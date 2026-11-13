export type Discipline = 'Boxeo' | 'MMA'

export type CompetitiveLevel = 'Amateur' | 'Profesional'
export type CompetitiveStatus = 'Activo' | 'Inactivo' | 'Retirado'
export type Sex = 'Masculino' | 'Femenino'
export type Stance = 'Ortodoxa' | 'Zurda' | 'Switch'
export type FightStyle =
  | 'Striker'
  | 'Grappler'
  | 'Mixto'
  | 'Estilista'
  | 'Contragolpeador'
  | 'Fajador'

export type WinMethods = {
  ko: number
  tko: number
  submission: number | null // solo MMA; en boxeo no existe
  decision: number
  firstRoundKos: number
}

export type FighterRecord = {
  wins: number
  losses: number
  draws: number
  methods: WinMethods
}

export type Achievement = {
  title: string
  year: number
  organization: string
  level: CompetitiveLevel
  description: string | null
}

export type Fighter = {
  // Los cinco datos que pidió el profe, más el id
  id: number
  name: string
  nickname: string
  discipline: Discipline
  weightKg: number
  city: string

  // Perfil completo
  competitiveLevel: CompetitiveLevel
  competitiveStatus: CompetitiveStatus
  availableToFight: boolean
  residenceCountry: string
  age: number
  sex: Sex
  nationality: string
  heightCm: number
  reachCm: number
  stance: Stance
  weightClass: string
  gym: string
  languages: string[]
  debutDate: string
  lastFightDate: string
  fightStyle: FightStyle
  martialArts: string[] | null // solo MMA
  bio: string
  record: FighterRecord
  achievements: Achievement[]
}