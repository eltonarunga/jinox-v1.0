-- Remove only the exact unverified sample rows previously seeded by the prototype.
-- Preserve any other records and any real screening records.
delete from public.dataset_snapshots
where record_count = 52340
  and counties_covered = 22
  and modalities = array['imaging','clinical','environmental','genomic']::text[];

delete from public.model_versions
where version = 'jinox-mm-0.3'
  and auc = 0.850
  and min_subgroup_auc = 0.790
  and sensitivity = 0.840
  and specificity = 0.880;

delete from public.counties
where (name = 'Nakuru' and fluoride_ppm = 4.80 and screened_count = 1240 and referral_rate = '18%')
   or (name = 'Baringo' and fluoride_ppm = 6.10 and screened_count = 860 and referral_rate = '24%')
   or (name = 'Kajiado' and fluoride_ppm = 5.20 and screened_count = 710 and referral_rate = '21%')
   or (name = 'Kericho' and fluoride_ppm = 2.10 and screened_count = 540 and referral_rate = '9%')
   or (name = 'Nairobi' and fluoride_ppm = 0.80 and screened_count = 1980 and referral_rate = '3%')
   or (name = 'Turkana' and fluoride_ppm = 3.60 and screened_count = 410 and referral_rate = '14%')
   or (name = 'Kisumu' and fluoride_ppm = 1.10 and screened_count = 670 and referral_rate = '4%')
   or (name = 'Machakos' and fluoride_ppm = 2.60 and screened_count = 590 and referral_rate = '11%');
