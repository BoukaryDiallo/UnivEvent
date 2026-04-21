SELECT setval(
    pg_get_serial_sequence('filieres', 'id_filiere'),
    2
);

SELECT setval(
  'departements_id_departement_seq',
  (SELECT MAX(id_departement) FROM departements)
);

SELECT setval(
  'filieres_id_filiere_seq',
  (SELECT MAX(id_filiere) FROM filieres)
);

ALTER TABLE elections
DROP CONSTRAINT elections_id_circonscription_foreign;

SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'elections';