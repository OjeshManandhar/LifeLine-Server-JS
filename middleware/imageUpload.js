// packages
var multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${req.params.contact}.${file.originalname
        .split('.')
        .pop()}`
    );
  }
});

function imageFilter(req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('Please upload only images.', false);
  }
}

const imageUpload = multer({
  storage,
  fileFilter: imageFilter
});

module.exports = imageUpload;
