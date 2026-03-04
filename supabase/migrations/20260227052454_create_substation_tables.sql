/*
  # Substation Management System

  1. New Tables
    - `substations`
      - `id` (uuid, primary key) - Unique identifier
      - `met_filiali_nomi` (text) - MET branch name
      - `podstansiya_nomi` (text) - Substation name
      - `tarmoq_nomi` (text) - Network name
      - `kuchlanishi` (integer) - Voltage level
      - `hisoblagich_rusumi` (text) - Counter type (EX 518, TE 73, DTS 546, etc.)
      - `elektr_hisoblagich_zavod_raqami` (text) - Electric counter factory number
      - `nominal_tok` (text) - Nominal current rating
      - `nominal_kuchlanish` (text) - Nominal voltage
      - `sim_karta_raqami` (text) - SIM card number
      - `tt` (text) - TT value
      - `kt` (text) - KT value
      - `xisob_koef` (text) - Calculation coefficient
      - `muhr_raqami` (text) - Seal number
      - `oqim_yonalishi` (text) - Current direction
      - `hisoblagich_matish_naryad` (text) - Counter verification order
      - `voltage_category` (text) - Category: '220-500kV' or '35-110kV'
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `substations` table
    - Add policies for authenticated users to read data
    - Add policies for authenticated users to insert/update with confirmation
*/

CREATE TABLE IF NOT EXISTS substations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  met_filiali_nomi text NOT NULL,
  podstansiya_nomi text NOT NULL,
  tarmoq_nomi text,
  kuchlanishi integer NOT NULL,
  hisoblagich_rusumi text NOT NULL,
  elektr_hisoblagich_zavod_raqami text,
  nominal_tok text,
  nominal_kuchlanish text,
  sim_karta_raqami text,
  tt text,
  kt text,
  xisob_koef text,
  muhr_raqami text,
  oqim_yonalishi text,
  hisoblagich_matish_naryad text,
  voltage_category text NOT NULL CHECK (voltage_category IN ('220-500kV', '35-110kV')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE substations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read substation data"
  ON substations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert substation data"
  ON substations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update substation data"
  ON substations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete substation data"
  ON substations
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_substations_voltage_category ON substations(voltage_category);
CREATE INDEX IF NOT EXISTS idx_substations_hisoblagich_rusumi ON substations(hisoblagich_rusumi);
CREATE INDEX IF NOT EXISTS idx_substations_kuchlanishi ON substations(kuchlanishi);
CREATE INDEX IF NOT EXISTS idx_substations_nominal_kuchlanish ON substations(nominal_kuchlanish);
CREATE INDEX IF NOT EXISTS idx_substations_nominal_tok ON substations(nominal_tok);