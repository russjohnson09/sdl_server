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


--TODO update this.
create table vehicle_data
(
    id serial not null
        constraint vehicle_data_pk
            primary key,
    parent_id INTEGER,
    vehicle_data_group_id INTEGER,
    name TEXT,
    key TEXT,
    type TEXT,
    "array" BOOLEAN,
    since VARCHAR(255),
    until VARCHAR(255),
--     enumeration BOOLEAN,
    removed VARCHAR(255),
    deprecated VARCHAR(255),
    minvalue VARCHAR(255),
    maxvalue VARCHAR(255),
    minsize INTEGER,
    maxsize INTEGER,
    minlength INTEGER,
    maxlength INTEGER
);


create table vehicle_data_enums
(
    id varchar(255) not null
        constraint vehicle_data_enums_pk
            primary key
);


create table if not exists vehicle_data_group
(
    id serial not null
        constraint vehicle_data_group_pk
            primary key,
    schema_version text default '0.0.0'::text not null,
    created_ts timestamp default now(),
    updated_ts timestamp default now(),
    is_deleted boolean default false,
    status text
);
