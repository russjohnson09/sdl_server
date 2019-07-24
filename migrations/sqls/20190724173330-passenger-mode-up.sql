/* db-migrate create passenger-mode -e pg-staging */

alter table module_config add lock_screen_dismissal_enabled boolean default false not null;
DROP VIEW view_module_config;
DROP VIEW view_module_config_staging;
DROP VIEW view_module_config_production;

INSERT INTO message_group (message_category, status)
VALUES ('LockScreenDismissalWarning', 'PRODUCTION');


INSERT INTO message_text (language_id,text_body,
                          message_group_id)
VALUES ('en-us',
        'Swipe down to dismiss, acknowledging that you are not the driver',
        (select max(id) from message_group where message_category = 'LockScreenDismissalWarning'));
