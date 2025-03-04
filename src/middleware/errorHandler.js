const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle database specific errors
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(400).json({ 
          message: 'Duplicate entry. This record already exists.' 
        });
      case 'ER_NO_SUCH_TABLE':
        return res.status(500).json({ 
          message: 'Database table not found. Please contact an administrator.' 
        });
      case 'ECONNREFUSED':
        return res.status(500).json({ 
          message: 'Database connection failed.' 
        });
      case 'ER_ACCESS_DENIED_ERROR':
        return res.status(500).json({ 
          message: 'Database access denied.' 
        });
    }
  }

  // Default error
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = errorHandler;
