const app = require('../app');
const helper = require('./helper.js');
const sql = require('./sql.js');
const flow = app.locals.flow;
const async = require('async');


async function getReport(req,res,next) {
	try {
		let reportData = await helper.getAggregateReportByAppId(req.query.id);
		return res.parcel.setStatus(200)
			.setData(reportData)
			.deliver();
	}
	catch (err)
	{
		app.locals.log.error(err);
		return res.parcel
			.setStatus(500)
			.setMessage("Internal server error")
			.deliver();
	}
}

function get (req, res, next) {
	//prioritize id, uuid, approval status, in that order.
	//only one parameter can be acted upon in one request
	let chosenFlow; //to be determined

	if (req.query.id) { //filter by id
		chosenFlow = helper.createAppInfoFlow('idFilter', req.query.id);
	}
	else if (req.query.uuid) { //filter by app uuid
		chosenFlow = helper.createAppInfoFlow('multiFilter', {app_uuid: req.query.uuid});
	}
	else if (req.query.approval_status || req.query.get_blacklist) { //filter by approval status
		chosenFlow = helper.createAppInfoFlow('multiFilter', {approval_status: req.query.approval_status, get_blacklist: (req.query.get_blacklist == "true")});
	}
	else { //get all applications whose information are the latest versions
		chosenFlow = helper.createAppInfoFlow('multiFilter');
	}
	chosenFlow(function (err, apps) {
		if (err) {
			app.locals.log.error(err);
			res.parcel.setStatus(500);
		}else{
			res.parcel
				.setStatus(200)
				.setData({
					applications: apps
				});
		}
		return res.parcel.deliver();
	});
}

//TODO: emailing system for messaging the developer about the approval status change
function actionPost (req, res, next) {
	helper.validateActionPost(req, res);
	if (res.parcel.message) {
		return res.parcel.deliver();
	}

	app.locals.db.runAsTransaction(function (client, callback) {
		async.waterfall([
			// Blacklist/Unblacklist app
			function (callback) {
				if (req.body.blacklist) {
					client.getOne(sql.insertAppBlacklist(req.body), callback);
				} else {
					client.getOne(sql.deleteAppBlacklist(req.body.uuid), callback);
				}
			},
			// Update approval status for app
			function (blacklist, callback) {
				client.getOne(sql.changeAppApprovalStatus(req.body.id, req.body.approval_status, (req.body.denial_message || null)), callback);
			},
			// sync the status to SHAID
			function (result, callback) {
				if(!req.body.version_id){
					// skip notifying SHAID if there is no version ID (legacy support)
					callback(null, null);
					return;
				}
				app.locals.shaid.setApplicationApprovalVendor([{
					"uuid": req.body.uuid,
					"blacklist": req.body.blacklist || false,
					"version_id": req.body.version_id,
					"approval_status": req.body.approval_status,
					"notes": req.body.denial_message || null
				}], callback);
			}
		], callback);
	}, function (err, response) {
		if (err) {
			app.locals.log.error(err);
			return res.parcel.setStatus(500).deliver();
		} else {
			return res.parcel.setStatus(200).deliver();
		}
	});
}

function hybridPost (req, res, next) {
	helper.validateHybridPost(req, res);
	if (res.parcel.message) {
		return res.parcel.deliver();
	}

	app.locals.db.runAsTransaction(function (client, callback) {
		async.waterfall([
			function (callback) {
				client.getOne(sql.getApp.base['uuidFilter'](req.body.uuid), callback);
			},
			function (result, callback) {
				if (!result) {
					return callback("Unknown app");
				}
				client.getOne(sql.deleteHybridPreference(req.body.uuid), callback);
			},
			function(result, callback) {
				client.getOne(sql.insertHybridPreference(req.body), callback);
			}
		], callback);
	}, function (err, response) {
		if (err) {
			app.locals.log.error(err);
			return res.parcel.setStatus(500).deliver();
		} else {
			return res.parcel.setStatus(200).deliver();
		}
	});
}

function autoPost (req, res, next) {
	helper.validateAutoPost(req, res);
	if (res.parcel.message) {
		return res.parcel.deliver();
	}

	app.locals.db.sqlCommand(sql.getApp.base['uuidFilter'](req.body.uuid), function(err, results) {
		if (err) {
			return res.parcel.setStatus(500).deliver();
		}
		if (!results.length) {
			return res.parcel.setStatus(400).deliver();
		}

		let chosenCommand;
		if (req.body.is_auto_approved_enabled) {
			chosenCommand = app.locals.db.sqlCommand.bind(null, sql.insertAppAutoApproval(req.body));
		} else {
			chosenCommand = app.locals.db.sqlCommand.bind(null, sql.deleteAutoApproval(req.body.uuid));
		}

		chosenCommand(function (err, results) {
			if (err) {
				return res.parcel.setStatus(500).deliver();
			}
			return res.parcel.setStatus(200).deliver();
		});
	});
}

function administratorPost (req, res, next) {
	helper.validateAdministratorPost(req, res);
	if (res.parcel.message) {
		return res.parcel.deliver();
	}

	app.locals.db.sqlCommand(sql.getApp.base['uuidFilter'](req.body.uuid), function(err, results) {
		if (err) {
			return res.parcel.setStatus(500).deliver();
		}
		if (!results.length) {
			return res.parcel.setStatus(400).deliver();
		}

		let chosenCommand;
		if (req.body.is_administrator_app) {
			chosenCommand = app.locals.db.sqlCommand.bind(null, sql.insertAppAdministrator(req.body));
		} else {
			chosenCommand = app.locals.db.sqlCommand.bind(null, sql.deleteAppAdministrator(req.body.uuid));
		}

		chosenCommand(function (err, results) {
			if (err) {
				return res.parcel.setStatus(500).deliver();
			}
			return res.parcel.setStatus(200).deliver();
		});
	});
}

function passthroughPost (req, res, next) {
	helper.validatePassthroughPost(req, res);
	if (res.parcel.message) {
		return res.parcel.deliver();
	}

	app.locals.db.sqlCommand(sql.getApp.base['uuidFilter'](req.body.uuid), function(err, results) {
		if (err) {
			return res.parcel.setStatus(500).deliver();
		}
		if (!results.length) {
			return res.parcel.setStatus(400).deliver();
		}

		let chosenCommand;
		if (req.body.allow_unknown_rpc_passthrough) {
			chosenCommand = app.locals.db.sqlCommand.bind(null, sql.insertPassthrough(req.body));
		} else {
			chosenCommand = app.locals.db.sqlCommand.bind(null, sql.deletePassthrough(req.body.uuid));
		}

		chosenCommand(function (err, results) {
			if (err) {
				return res.parcel.setStatus(500).deliver();
			}
			return res.parcel.setStatus(200).deliver();
		});
	});
}

function putServicePermission (req, res, next) {
	helper.validateServicePermissionPut(req, res);
	if (res.parcel.message) {
		return res.parcel.deliver();
	}

	app.locals.db.sqlCommand(sql.getApp.base['idFilter'](req.body.id), function(err, results) {
		if (err) {
			return res.parcel.setStatus(500).deliver();
		}
		if (!results.length) {
			return res.parcel.setStatus(400).deliver();
		}

		if (results[0].approval_status == "ACCEPTED") {
			return res.parcel
				.setStatus(400)
				.setMessage("You may not modify the app service permissions of a production application.")
				.deliver();
		}

		let chosenCommand;
		if (req.body.is_selected) {
			chosenCommand = app.locals.db.sqlCommand.bind(null, sql.insertAppServicePermission(req.body));
		} else {
			chosenCommand = app.locals.db.sqlCommand.bind(null, sql.deleteAppServicePermission(req.body));
		}

		chosenCommand(function (err, results) {
			if (err) {
				return res.parcel.setStatus(500).deliver();
			}
			return res.parcel.setStatus(200).deliver();
		});
	});
}

//expects a POST from SHAID
function webhook (req, res, next) {
    helper.validateWebHook(req, res);
    if (res.parcel.message) {
        return res.parcel.deliver();
    }

	async.waterfall([
		(callback)=>{
			if(req.body.entity == "application"){
				const query = {
		            "uuid": req.body.uuid,
					"include_deleted": true,
					"include_blacklisted": true
		        };

				switch(req.body.action){
					case "UPSERT":
						const queryAndStoreFlow = queryAndStoreApplicationsFlow(query, true);
				        queryAndStoreFlow(callback);
						break;
					case "DELETE":
						app.locals.db.sqlCommand(sql.purgeAppInfo(query), callback);
						break;
					case "BLACKLIST":
						app.locals.db.sqlCommand(sql.insertAppBlacklist(query), callback);
						break;
					default:
						callback(null, null);
				}
			}else{
				callback(null, null);
			}
		}
	], (err, result)=>{
		if (err) {
			req.app.locals.log.error(err);
		}
		res.parcel.setStatus(200);
		res.parcel.deliver();
	});
}

//queries SHAID to get applications and stores them into the database
function queryAndStoreApplicationsFlow (queryObj, notifyOEM = true) {
    return flow([
    	app.locals.shaid.getApplications.bind(null, queryObj),
    	helper.storeApps.bind(null, false, notifyOEM)
    ], {method: 'waterfall', eventLoop: true});
}

module.exports = {
	get: get,
	getReport: getReport,
	actionPost: actionPost,
	putServicePermission: putServicePermission,
	autoPost: autoPost,
	administratorPost: administratorPost,
	passthroughPost: passthroughPost,
	hybridPost: hybridPost,
	webhook: webhook,
	queryAndStoreApplicationsFlow: queryAndStoreApplicationsFlow
};
