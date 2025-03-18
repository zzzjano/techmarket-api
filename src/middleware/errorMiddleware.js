const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
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
    
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
      });
}

module.exports = { notFound, errorHandler };