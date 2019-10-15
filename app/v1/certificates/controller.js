const async = require('async');
const pem = require('pem');
const fs = require('fs');
const path = require('path');
const logger = require('../../../custom/loggers/winston/index');
const settings = require('../../../settings.js');
const tmp = require('tmp');
const { spawnSync } = require('child_process');
const SSL_DIR_PREFIX = __dirname + '/../../../customizable/ssl/';

const authorityKey = (fs.existsSync(SSL_DIR_PREFIX + settings.certificateAuthority.authorityKeyFileName)) ?
    //file exists
    fs.readFileSync(SSL_DIR_PREFIX + settings.certificateAuthority.authorityKeyFileName).toString() :
    //file does not exist
    null;
const authorityCertificate = (fs.existsSync(SSL_DIR_PREFIX + settings.certificateAuthority.authorityCertFileName)) ?
    //file exists
    fs.readFileSync(SSL_DIR_PREFIX + settings.certificateAuthority.authorityCertFileName).toString() :
    //file does not exist
    null;

// const csrConfigIsValid = fs.existsSync(SSL_DIR_PREFIX + settings.securityOptions.certificate.csrConfigFile);
const csrConfigIsValid = true;
const csrConfigFile = path.resolve(SSL_DIR_PREFIX + settings.securityOptions.certificate.csrConfigFile);

//TODO uncomment.
// const openSSLEnabled = authorityKey && authorityCertificate && csrConfigIsValid && settings.securityOptions.passphrase;
const openSSLEnabled = true;


console.log({openSSLEnabled,authorityKey, authorityCertificate, csrConfigIsValid,authorityDir: SSL_DIR_PREFIX + settings.certificateAuthority.authorityCertFileName});

function checkAuthorityValidity(cb){
    pem.createPkcs12(
        authorityKey,
        authorityCertificate,
        settings.certificateAuthority.passphrase,
        {
            cipher: 'aes128',
            clientKeyPassword: settings.certificateAuthority.passphrase
        },
        function(err, pkcs12){
            cb((err) ? false : true);
        }
    );
}

function createPrivateKey(req, res, next){
    if(openSSLEnabled){
        let options = getKeyOptions(req.body.options);
        pem.createPrivateKey(
            options.keyBitsize,
            options,
            function(err, privateKey){
                if(err){
                    return res.parcel.setStatus(400)
                        .setData(err)
                        .deliver();
                }
                return res.parcel.setStatus(200)
                    .setData(privateKey.key)
                    .deliver();
            }
        );
    } else {
        res.parcel.setStatus(400)
            .setMessage('Security options have not been properly configured')
            .deliver();
    }
}

function getKeyOptions(options = {}){
    return {
        keyBitsize: options.keyBitsize || settings.securityOptions.privateKey.keyBitsize,
        cipher: options.cipher || settings.securityOptions.privateKey.cipher,
    };
}

function getCertificateOptions(options = {}){
    return {
        serviceCertificate: authorityCertificate,
        serviceKey: authorityKey,
        serviceKeyPassword: settings.securityOptions.passphrase,
        clientKey: options.clientKey,
        keyBitsize: options.keyBitsize || settings.securityOptions.privateKey.keyBitsize,
        country: options.country || settings.securityOptions.certificate.country,
        state: options.state || settings.securityOptions.certificate.state,
        locality: options.locality || settings.securityOptions.certificate.locality,
        organization: options.organization || settings.securityOptions.certificate.organization,
        organizationUnit: options.organizationUnit || settings.securityOptions.certificate.organizationUnit,
        commonName: options.commonName || settings.securityOptions.certificate.commonName,
        emailAddress: options.emailAddress || settings.securityOptions.certificate.emailAddress,
        hash: settings.securityOptions.certificate.hash,
        days: options.days || settings.securityOptions.certificate.days,
        csrConfigFile: csrConfigFile,
        serialNumber: options.app_uuid,
    };
}

function createCertificate(req, res, next){
    if(openSSLEnabled){
        let options = req.body.options || {};
        createCertificateFlow(options, function(err, results){
            if(err){
                logger.error(err);
                return res.parcel.setStatus(400)
                    .setData(err)
                    .deliver();
            }
            return res.parcel.setStatus(200)
                .setData(results)
                .deliver();
        });
    } else {
        res.parcel.setStatus(400)
            .setMessage('Security options have not been properly configured')
            .deliver();
    }
}

/**
 *
 * @param options clientKey if given create a csr off of the the csrOptions.
 * @param next
 */
function createCertificateFlow(options, next){
    try {
        throw new Error(`createCertificateFlow`);
    }
    catch(e)
    {
        console.log(`createCertificateFlow`,e);
    }
    console.log(`createCertificateFlow`,options);
    if(openSSLEnabled){
        options.serviceKey = authorityKey;
        options.serviceCertificate = authorityCertificate;
        options.serviceKeyPassword = settings.securityOptions.passphrase;
        let tasks = [];
        console.log(`createCertificateFlow`,{csrConfigIsValid});
        if(csrConfigIsValid){
            tasks.push(function(cb){
                console.log(`createCertificateFlow writeCSRConfigFile`);
                writeCSRConfigFile(getCertificateOptions(options), cb);
            });
        }

        //private key exists
        if(options.clientKey){
            tasks.push(function(csrOptions, cb){
                console.log(`createCertificateFlow createCSR`,csrOptions);
                pem.createCSR(csrOptions, function(err, csr){
                    cb(err, csrOptions, csr);
                });
            });
        //private key does not exist
        } else {
            tasks.push(function(csrOptions, cb){
                options = getKeyOptions(options);
                pem.createPrivateKey(options.keyBitsize, options, function(err, key){
                    console.log(`createCertificateFlow createPrivateKey`,{csrOptions,options,cb});
                    cb(err, csrOptions, key);
                });
            });
            tasks.push(function(csrOptions, privateKey, cb){
                csrOptions.clientKey = privateKey.key;
                pem.createCSR(csrOptions, function(err, csr){
                    console.log(`createCertificateFlow createCSR`,{csrOptions,err,csr});
                    cb(err, csrOptions, csr);
                });
            });
        }
        tasks.push(function(csrOptions, csr, cb){
            csrOptions.csr = csr.csr;
            console.log("using csr config file",csrOptions);

            pem.createCertificate(csrOptions, function(err, certificate){
                cb(err, certificate);
            });
        });
        async.waterfall(tasks, next);
    } else {
        next('Security options have not been properly configured');
    }
}


function createPkcs12(clientKey, certificate, cb){
    if(openSSLEnabled){
        if((!clientKey || clientKey.length == 0) &&
            (!certificate || certificate.length == 0)){
            cb(null, null);
            return;
        }
        console.log(`createPkcs12`,clientKey,certificate,settings.securityOptions.passphrase);
        // let passphrase = null;
        // let passphrase = '';
        let passphrase = '1234';

        // let passphrase = settings.securityOptions.passphrase;
        pem.createPkcs12(clientKey,
            certificate,
            passphrase,
            function(err, pkcs12){
                console.log(`createPkcs12`,{clientKey,certificate,passphrase,pkcs12,err});
                return cb(err, err ? null : pkcs12.pkcs12.toString('base64'));
            }
        );
    } else {
        res.parcel.setStatus(400)
            .setMessage('Security options have not been properly configured')
            .deliver();
    }
}

function writeCSRConfigFile(options, cb){
    let csrConfig = '# OpenSSL configuration file for creating a CSR for an app certificate\n' +
        '[req]\n' +
        'distinguished_name = req_distinguished_name\n' +
        'prompt = no\n' +
        '[ req_distinguished_name ]\n';

    if(options.country){
        csrConfig += 'C = ' + options.country + '\n';
    }
    if(options.state){
        csrConfig += 'ST = ' + options.state + '\n';
    }
    if(options.locality){
        csrConfig += 'L = ' + options.locality + '\n';
    }
    if(options.organization){
        csrConfig += 'O = ' + options.organization + '\n';
    }
    if(options.organizationUnit){
        csrConfig += 'OU = ' + options.organizationUnit + '\n';
    }
    if(options.commonName){
        csrConfig += 'CN = ' + options.commonName + '\n';
    }
    if(options.emailAddress){
        csrConfig += 'emailAddress = ' + options.emailAddress + '\n';
    }

    // all app certificates MUST have the SUBJECT serial number equal to its app_uuid that core will recognize it as
    if(options.serialNumber){
        csrConfig += 'serialNumber = ' + options.serialNumber;
    }
    console.log(`writeCSRConfigFile writeFile`,{csrConfigFile,csrConfig});
    fs.writeFile(
        csrConfigFile,
        csrConfig,
        function(err){
            console.log(`writeCSRConfigFile writeFile`,{err, options});
            cb(err, options);
        }
    );
}

module.exports = {
    authorityKey: authorityKey,
    authorityCertificate: authorityCertificate,
    csrConfigIsValid: csrConfigIsValid,
    createPrivateKey: createPrivateKey,
    createCertificate: createCertificate,
    createCertificateFlow: createCertificateFlow,
    createPkcs12: createPkcs12,
    checkAuthorityValidity: checkAuthorityValidity,
    getKeyOptions: getKeyOptions,
    getCertificateOptions: getCertificateOptions,
    openSSLEnabled: openSSLEnabled,
}
