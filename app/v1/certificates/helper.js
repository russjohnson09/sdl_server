const certUtil = require('../helpers/certificates.js');

/**
 *
 * @param certificate Certificate to check expiration on.
 * @param cb returns (err, isExpired)
 */
function isCertificateExpired(certificate, cb) {
    certUtil.parseCertificate(certificate)
        .then(certInfo => {
            const expirationDate = certInfo.validity.end;
            console.log(`expirateionDate`,expirationDate,new Date(expirationDate));
            const now = Date.now();
            //expirationDate is less than now then it is expired
            cb(null, expirationDate < now);
        })
        .catch(err => {
            return cb(err);
        });
}

module.exports = {
    isCertificateExpired: isCertificateExpired,
};
