export interface Substation {
  id: string;
  met_filiali_nomi: string;
  podstansiya_nomi: string;
  tarmoq_nomi: string | null;
  kuchlanishi: number;
  hisoblagich_rusumi: string;
  elektr_hisoblagich_zavod_raqami: string | null;
  nominal_tok: string | null;
  nominal_kuchlanish: string | null;
  sim_karta_raqami: string | null;
  tt: string | null;
  kt: string | null;
  xisob_koef: string | null;
  muhr_raqami: string | null;
  oqim_yonalishi: string | null;
  hisoblagich_matish_naryad: string | null;
  voltage_category: '220-500kV' | '35-110kV';
  created_at: string;
  updated_at: string;
}
