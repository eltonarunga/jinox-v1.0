-- Restrict the private asset bucket to file types used by JinoX intake.
update storage.buckets
set public = false,
    file_size_limit = 104857600,
    allowed_mime_types = array[
      'image/jpeg','image/png','image/webp','image/tiff',
      'application/dicom','application/zip','text/csv','application/json',
      'model/stl','application/sla','model/obj','model/ply'
    ]::text[]
where id = 'jinox-clinical-assets';
