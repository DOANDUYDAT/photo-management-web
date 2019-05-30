var express = require('express');
var router = express.Router();
const path = require('path');
const multer = require('multer');
const mongoose =require('mongoose');
const Image = require('../models/image');
const fs = require('fs');
//uploads folder
router.use(express.static(path.join(__dirname, '../public/uploads')));


// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	res.render('index');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}
// trả về thông tin album ảnh
router.get('/album', ensureAuthenticated, (req, res) => {
	Image.find().sort({ uploadDate: -1 }).exec(function(err, files){
		if (err) throw err;
		// console.log(files);
		res.json(files);
	});
	
});
// cấu hình và cài đặt 
// upload nhiều ảnh lên
// Set The Storage Engine
const storage = multer.diskStorage({
	destination: './public/uploads',
	filename: function(req, file, cb) {
			cb(null,file.fieldname+ new Date().toISOString().replace(/:/g, '-')+ file.originalname);    
	}
});

// Init Upload
const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 *5 },
	fileFilter: function(req, file, cb){
			checkFileType(file, cb);    
	}
}).array('photos', 4);

// Check File Type
function checkFileType(file, cb){
	// Allowed ext
	const filetypes = /jpeg|jpg|png|gif/;
	// Check ext
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	const mimetype = filetypes.test(file.mimetype);

	if(mimetype && extname){
		return cb(null,true);
	} else {
		return cb(new Error('Images Only!'));
	}
}

router.post('/upload', (req, res) => {
	  upload(req, res, (err) => {
		if(err){
		  res.render('index', {
			msg: err
		  });
		} else {
			
		  if(req.files[0] == undefined){
			res.render('index', {
			  msg: 'Error: No File Selected!'
			});
		  } else {
			  req.files.forEach(file => {
				  let newImage = new Image({
					  name: file.originalname,
					  filename: file.filename,
					  uploadDate: Date.now()
				  });
				  //save image into database
				  newImage.save(function(err){
					  if (err) throw err;
					  console.log(req.files);
				  })
			  })
			  res.render('index', {
				  msg: 'File Uploaded!',
				//   file: req.file.filename
			});
		  }
		}
	  });
});
// link đến các ảnh
router.get('/image/:file', (req, res, next) => {
	const file = req.params.file;
	console.log(file);
	res.sendFile(path.join(__dirname, '../public/uploads/') + file);
});




router.post('/delete', (req, res, next) => {
	
	let photos = req.body.photos;
	console.log(typeof photos);
	if ( typeof photos == 'undefined'){
		// không làm gì
	}
	else if(typeof photos == 'string') {
		Image.deleteOne({ filename: photos}, function(err, image) {
					if (err) throw err;
					console.log(image);
				});
				
				fs.unlink('public/uploads/' + photos, function (err) {
					if (err) throw err;
					console.log('File deleted!');
				});
	} 
	else {
		req.body.photos.forEach(image => {
			Image.deleteOne({ filename: image }, function(err, image) {
				if (err) throw err;
				console.log(image);
			});
			
			fs.unlink('public/uploads/' + image, function (err) {
				if (err) throw err;
				console.log('File deleted!');
			});
		});
	}
	
	
	
	res.redirect('/');
});


module.exports = router;