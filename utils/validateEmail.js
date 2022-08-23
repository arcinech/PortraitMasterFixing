const validateEmail = email => {
  if (!email) return false;
  // check if email is valid RFC 5322
  const patter = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/,
    'g'
  );
  return patter.test(email);
};

module.exports = validateEmail;
