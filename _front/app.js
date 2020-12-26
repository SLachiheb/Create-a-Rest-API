// Modules
const express = require('express');
const twig = require('twig');
const morgan = require('morgan')('dev');
const axios = require('axios');
const bodyParser = require('body-parser');
const { text } = require('body-parser');

// Variables globales
const app = express();
const port = 8082;
const fetch = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
});

// Middlewares
app.use(morgan);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Home page
app.get('/', (req, res) => {
  res.redirect('/members');
});

// Page collecting all members
app.get('/members', (req, res) => {
  apiCall(
    req.query.max ? '/members?max=' + req.query.max : '/members',
    'get',
    {},
    res,
    result => {
      res.render('members.twig', {
        members: result,
      });
    }
  );
});

// Page collecting a member
app.get('/members/:id', (req, res) => {
  apiCall('/members/' + req.params.id, 'get', {}, res, result => {
    res.render('member.twig', {
      member: result,
    });
  });
});

// Page managing the modification of a member
app.get('/edit/:id', (req, res) => {
  apiCall('/members/' + req.params.id, 'get', {}, res, result => {
    res.render('edit.twig', {
      member: result,
    });
  });
});

// Method for modifying a member
app.post('/edit/:id', (req, res) => {
  apiCall(
    '/members/' + req.params.id,
    'put',
    {
      name: req.body.name,
    },
    res,
    () => {
      res.redirect('/members');
    }
  );
});

// Page managing the addition of a member
app.get('/insert', (req, res) => {
  res.render('insert.twig');
});

// Method for adding a member
app.post('/insert', (req, res) => {
  apiCall('/members', 'post', { name: req.body.name }, res, result => {
    res.redirect('/members');
  });
});

//Methode supprime un membre
app.post('/delete', (req, res) => {
  apiCall('/members/' + req.body.id, 'delete', {}, res, () => {
    res.redirect('/members');
  });
});

// launch application
app.listen(port, () => console.log('Started on port ' + port));

// Fonctions
const renderError = function (res, message) {
  res.render('error.twig', {
    errorMsg: message,
  });
};

const apiCall = function (url, method, data, res, next) {
  fetch({
    method: method,
    url: url,
    data: data,
  })
    .then(response => {
      if (response.data.status == 'success') {
        next(response.data.result);
      } else {
        renderError(res, response.data.message);
      }
    })
    .catch(err => renderError(res, err.message));
};

// http://localhost:8081/api/v1/api-docs/#/
