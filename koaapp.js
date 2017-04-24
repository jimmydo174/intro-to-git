var koa = require('koa');
var mongoose = require('mongoose');
var router = require('koa-router');
var render = require('koa-ejs');
var path = require('path');
var serve = require('koa-static');
var koaBody = require('koa-body');

//set up MongoDB connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');

//Create an example db
var Student = mongoose.model('Student', new mongoose.Schema({
	name: String,
	phone: String
}));

// Create koa app
var app = new koa();

// Rendering html file setup middleware
render(app, {
	root: path.join(__dirname, 'view'),
	layout: false,
	viewExt: 'html',
	cache: false,
	debug: true
});

// Set up koa-body middleware
app.use(koaBody({
	formidable: {uploadDir: './uploads'},
	multipart: true,
	urlencoded: true
}))

// Serve files in public folder(css, js)
app.use(serve(__dirname + '/public'));
var _ = router();

// Using router
app.use(_.routes());

// Check not found routes and rediret to /p/not-found
app.use(async (ctx) => {
	if(ctx.response.status !== 200) {
		ctx.redirect('/p/not-found');
	}
});

// Error handling
app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		ctx.status = err.status || 500;
		ctx.body = err.message;
		ctx.app.emit('error', err, ctx);
	}
});

_.get('/', async (ctx) => {
	await ctx.render('index');

	// This will set status and message to error
	ctx.throw('Error message', 500);
});

_.get('/p/not-found', function(ctx){
	ctx.body = 'sorry u have hit no where';
});

_.get('/new', async (ctx) => {
	await ctx.render('new');
});

_.post('/new', (ctx) => {
	Student.create(ctx.request.body.person, function(student, err){
		if(err) {
			console.log(err);
		} else {
			console.log(student);
		}
	})
	ctx.response.redirect('/');

});

// Define configurable port
var port = process.env.PORT || 3000;

// Listen for connections
app.listen(3000);

// Log port
console.log('Server started at ' + port);
