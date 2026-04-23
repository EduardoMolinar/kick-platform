export interface Team {
  readonly id: string;
  readonly name: string;
  readonly shortName?: string;
  readonly crestUrl?: string;
}

export interface Competition {
  readonly id: string;
  readonly name: string;
  readonly code: 'UCL' | 'PL' | 'LIGA' | 'INT';
}
