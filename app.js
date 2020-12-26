const mysql = require('promise-mysql');
const { checkAndChange } = require('./assets/functions.js');
const morgan = require('morgan');
const config = require('./assets/config.json');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./assets/swagger.json');

mysql
  .createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
  })
  .then(connection => {
    console.log('connected');
    const express = require('express');

    let MembersRouter = express.Router();
    let Members = require('./assets/classes/Members-class')(connection, config);

    const app = express();

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(
      config.rootAPI + 'api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );

    MembersRouter.route('/:id')
      // Recupère un membre avec son ID
      .get(async (req, res) => {
        let member = await Members.getByID(req.params.id);
        res.json(checkAndChange(member));
      })
      // Modifie un membre avec un ID
      .put(async (req, res) => {
        let updateMember = await Members.update(req.params.id, req.body.name);
        res.json(checkAndChange(updateMember));
      })
      // Supprime une membre avec un ID
      .delete(async (req, res) => {
        let deleteMember = await Members.delete(req.params.id);
        res.json(checkAndChange(deleteMember));
      });

    MembersRouter.route('/')
      // Recupère tous les membres
      .get(async (req, res) => {
        let allMembers = await Members.getAll(req.query.max);
        res.json(checkAndChange(allMembers));
      })
      // Ajout un membre
      .post(async (req, res) => {
        let addMember = await Members.add(req.body.name);
        res.json(checkAndChange(addMember));
      });

    app.use(`${config.rootAPI}members`, MembersRouter);

    // Ecoute le port
    app.listen(config.port, () =>
      console.log(`Started on port ${config.port}`)
    );
  })
  .catch(err => {
    console.error('error connecting: ' + err.stack);
  });

// https://app.gitbook.com/@sarah-lachiheb/s/api-rest/
