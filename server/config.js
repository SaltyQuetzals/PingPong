cfg.accountSid = process.env["ACe8aae0e533d2fde3bea7f04f90788cc7"];
cfg.authToken = process.env["d3bcf15aef9017f888118466c6947871"];
cfg.sendingNumber = process.env["+18179837717"];

var requiredConfig = [cfg.accountSid, cfg.authToken, cfg.sendingNumber]
var isConfigured = requiredConfig.every(function(configValue)	{
	return configValue || false;
});

if (!isConfigured)	{
	var errorMessage = 'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_NUMBER must be set';

	throw new Error(errorMessage);
}

module.exports = cfg;
