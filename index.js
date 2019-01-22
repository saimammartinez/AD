const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');

const ActiveDirectory = require('activedirectory');
const config = { url: 'ldap://saimasolutions.local',
               baseDN: 'dc=saimasolutions,dc=local',
               username: 'usuario ad',
               password: 'pass' }
const ad = new ActiveDirectory(config);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }))
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret'
}));


app.use((req, res, next) => {
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});

/*
app.use(Express.static('public'));

app.get('/', (req, res) => {
    res.send('index');
});
*/

// Authenticate using our plain-object database of doom!

function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticando %s:%s', name, pass);
    var user = name;

    ad.authenticate(user, pass, function(err, auth) {
        if (err) {
          console.log('ERROR: '+JSON.stringify(err));
          return fn(err);
        }
        
        if (auth) {
          console.log('Authenticado!');
          return fn(null, user)
        }
        else {
          console.log('Authenticacion fallida!');
          fn(new Error('Password incorrecta'));
        }
      });
}

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Aceso denegado!';
        res.redirect('/login');
    }
}

app.get('/', function (req, res) {
    res.redirect('/login');
});

app.get('/restricted', restrict, function (req, res) {
    res.send('Has entrado en el area restringida, ahora clica en  <a href="/logout">logout</a>');
});

app.get('/logout', function (req, res) {
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login', function (req, res) {
    authenticate(req.body.username, req.body.password, function (err, user) {
        console.log(user);
        if (user) {
            // Regenerate session when signing in
            // to prevent fixation
            req.session.regenerate(function () {
                // Store the user's primary key
                // in the session store to be retrieved,
                // or in this case the entire user object
                req.session.user = user;
                req.session.success = 'Authenticado como ' + user
                    + ' clica en <a href="/logout">logout</a>. '
                    + ' Ahora puedes acceder a  <a href="/restricted">/restricted</a>.';
                res.redirect('back');
            });
        } else {
            req.session.error = 'Authenticacion fallida, comprueba '
                + ' username and password.'
               // + ' (use "tj" and "foobar")';
            res.redirect('/login');
        }
    });
});



app.listen(3000, () => {
    console.log('Server on port 3000')
});

