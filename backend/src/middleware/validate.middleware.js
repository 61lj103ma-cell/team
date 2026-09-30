const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
        errors: error.errors,
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid input payload',
    });
  }
};

module.exports = validate;
