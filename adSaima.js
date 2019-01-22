const ActiveDirectory = require('activedirectory');
const config = { url: 'ldap://saimasolutions.local',
               baseDN: 'dc=saimasolutions,dc=local',
               username: 'operador@saimasolutions.local',
               password: 'Saima2012' }
const ad = new ActiveDirectory(config);

var username = '';
var password = '';
 
ad.authenticate(username, password, function(err, auth) {
  if (err) {
    console.log('ERROR: '+JSON.stringify(err));
    return;
  }
  
  if (auth) {
    console.log('Authenticated!');
  }
  else {
    console.log('Authentication failed!');
  }
});