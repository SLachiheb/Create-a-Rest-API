let connection, config;

module.exports = (_connection, _config) => {
  connection = _connection;
  config = _config;
  return Members;
};

let Members = class {
  static getByID(id) {
    return new Promise(next => {
      connection
        .query('SELECT * FROM members WHERE id=?', [id])
        .then(result => {
          if (result[0] != undefined) next(result[0]);
          else next(new Error(config.errors.wrongID));
        })
        .catch(error => next(error));
    });
  }

  static getAll(max) {
    return new Promise(next => {
      if (max != undefined && max > 0) {
        connection
          .query('SELECT * from members LIMIT 0, ?', [+max])
          .then(result => next(result))
          .catch(error => next(error));
      } else if (max != undefined) {
        next(new Error(config.errors.wrongMaxValue));
      } else {
        connection
          .query('SELECT * from members')
          .then(result => next(result))
          .catch(error => next(error));
      }
    });
  }

  static add(name) {
    return new Promise(next => {
      if (name != undefined && name.trim() != '') {
        name = name.trim();
        connection
          .query('SELECT * FROM members WHERE name = ?', [name])
          .then(result => {
            if (result[0] != undefined) {
              next(new Error(config.errors.nameAlreadyTaken));
            } else {
              return connection.query('INSERT INTO members(name) VALUES(?)', [
                name,
              ]);
            }
          })
          .then(() => {
            return connection.query('SELECT * FROM members WHERE name = ?', [
              name,
            ]);
          })
          .then(result => {
            next({
              id: result[0].id,
              name: result[0].name,
            });
          })
          .catch(error => next(error));
      } else {
        next(new Error(config.errors.noNameValue));
      }
    });
  }

  static update(id, name) {
    return new Promise(next => {
      if (name != undefined && name.trim() != '') {
        name = name.trim();
        connection
          .query('SELECT * FROM members WHERE id=?', [id])
          .then(result => {
            if (result[0] != undefined) {
              // A voir
              return connection.query(
                'SELECT * FROM members WHERE name = ? AND id != ?',
                [name, id]
              );
            } else {
              next(new Error(config.errors.wrongID));
            }
          })
          .then(result => {
            if (result[0] != undefined) {
              next(new Error(config.errors.sameName));
            } else {
              return connection.query(
                'UPDATE members SET name = ? WHERE id = ?',
                [name, id]
              );
            }
          })
          .then(() => next(true))
          .catch(error => next(error));
      } else {
        next(new Error(config.errors.noNameValue));
      }
    });
  }

  static delete(id) {
    return new Promise(next => {
      connection
        .query('SELECT * FROM members WHERE id=?', [id])
        .then(result => {
          if (result[0] != undefined) {
            return connection.query('DELETE FROM members WHERE id = ?', [id]);
          } else {
            next(new Error(config.errors.wrongID));
          }
        })
        .then(() => next(true))
        .catch(error => next(error));
    });
  }
};
