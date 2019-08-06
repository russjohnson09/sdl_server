//Copyright (c) 2018, Livio, Inc.
const app = require('../app');
const helper = require('./helper.js');
const encryption = require('../../../customizable/encryption');
const GET = require('lodash.get');

/**
 * Called whenever core requests the policy table.
 * Extra reporting can be recorded when isProduction = true
 * @param isProduction
 * @returns {Function}
 */
function postFromCore (isProduction) {
	return function (req, res, next) {
		// attempt decryption of the policy table if it's defined
		if(req.body.policy_table){
			req.body.policy_table = encryption.decryptPolicyTable(req.body.policy_table);
		}

        helper.validateCorePost(req, res);
		if (res.errorMsg) {
			return res.status(400).send({ error: res.errorMsg });
		}
		const useLongUuids = GET(req, "body.policy_table.module_config.full_app_id_supported", false) ? true : false;
        helper.generatePolicyTable(isProduction, useLongUuids, req.body.policy_table.app_policies, true, handlePolicyTableFlow.bind(null, res, true));


        //Update reporting as a separate process. We do not need to wait on reporting to complete before responding with the policy table update request.
        let policyTable = req.body.policy_table || {};
        app.locals.reportingService.updateReporting(policyTable, undefined, useLongUuids)
	}
}

function getPreview (req, res, next) {
    const isProduction = !req.query.environment || req.query.environment.toLowerCase() !== 'staging';
    helper.generatePolicyTable(isProduction, false, {}, true, handlePolicyTableFlow.bind(null, res, false));
}

function postAppPolicy (req, res, next) {
    const isProduction = !req.query.environment || req.query.environment.toLowerCase() !== 'staging';
	const useLongUuids = GET(req, "body.policy_table.module_config.full_app_id_supported", false) ? true : false;
    helper.validateAppPolicyOnlyPost(req, res);
    if (res.errorMsg) {
        return res.status(400).send({ error: res.errorMsg });
    }
    helper.generatePolicyTable(isProduction, useLongUuids, req.body.policy_table.app_policies, false, handlePolicyTableFlow.bind(null, res, false));
}

function handlePolicyTableFlow (res, encrypt = false, err, pieces) {
    if (err) {
        app.locals.log.error(err);
        return res.parcel.setStatus(500).deliver();
    }
    res.parcel
        .setStatus(200)
        .setData(createPolicyTableResponse(pieces, encrypt));
    return res.parcel.deliver();
}

function createPolicyTableResponse (pieces, encrypt = false) {
	const policy_table = [
        {
            policy_table: {
                module_config: pieces.moduleConfig,
                functional_groupings: pieces.functionalGroups,
                consumer_friendly_messages: pieces.consumerFriendlyMessages,
                app_policies: pieces.appPolicies
            }
        }
    ];

	return (encrypt ? encryption.encryptPolicyTable(policy_table) : policy_table);
}

module.exports = {
    postFromCoreStaging: postFromCore(false),
    postFromCoreProduction: postFromCore(true),
    getPreview: getPreview,
    postAppPolicy: postAppPolicy
};
