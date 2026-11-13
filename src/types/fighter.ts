export type Discipline= 'Boxeo' | 'MMA'

export type Fighter ={
    id: number
    name: string
    nickname: string
    discipline: Discipline
    weightKg: number
    city: string
}