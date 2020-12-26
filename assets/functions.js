exports.success = function (data) {
  return {
    status: 'success',
    result: data,
  };
};

exports.error = function (message) {
  return {
    status: 'error',
    message: message,
  };
};

exports.isErr = err => {
  return err instanceof Error;
};

exports.checkAndChange = obj => {
  return this.isErr(obj) ? this.error(obj.message) : this.success(obj);
};
