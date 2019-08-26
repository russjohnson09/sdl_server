/* db-migrate create read-generic-network-signal-data-0173 -e pg-staging */


ALTER TABLE module_config ADD custom_vehicle_data_mapping_url text NOT NULL DEFAULT 'http://localhost:3000/api/1/vehicleDataMap';
ALTER TABLE module_config ADD custom_vehicle_data_mapping_url_version text NOT NULL DEFAULT '0.0.0';



CREATE OR REPLACE VIEW view_module_config AS
SELECT module_config.*
FROM (
         SELECT status, max(id) AS id
         FROM module_config
         GROUP BY status
     ) AS vmc
         INNER JOIN module_config ON vmc.id = module_config.id;

CREATE OR REPLACE VIEW view_module_config_staging AS
SELECT module_config.*
FROM (
         SELECT max(id) AS id
         FROM module_config
     ) mc
         INNER JOIN module_config
                    ON module_config.id = mc.id;

CREATE OR REPLACE VIEW view_module_config_production AS
SELECT module_config.*
FROM (
         SELECT max(id) AS id
         FROM module_config
         WHERE status='PRODUCTION'
     ) mc
         INNER JOIN module_config
                    ON module_config.id = mc.id;
