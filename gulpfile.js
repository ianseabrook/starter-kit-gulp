'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Lint JavaScript
gulp.task('eslint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe(reload({stream: true, once: true}))
    // eslint() attaches the lint output to the eslint property
    // of the file object so it can be used by other modules.
    .pipe($.eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe($.eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failOnError last.
    .pipe($.eslint.failOnError());
    // .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Compile Babel and Concatenate JavaScript
gulp.task("concatScripts", function() {
    return gulp.src('app/scripts/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat('app.js'))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('app/scripts/'));
});

// Minify JavaScript
gulp.task("minifyScripts", ["concatScripts"], function() {
  return gulp.src("app/scripts/app.js")
    .pipe($.uglify())
    .pipe($.rename('app.min.js'))
    .pipe(gulp.dest('app/scripts'));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', function() {
  return gulp.src("app/styles/*.scss")
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        precision: 10,
        onError: console.error.bind(console, 'Sass error:')
      }))
      .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest('app/styles/css'));
});

// Watch files for changes & reload
gulp.task('watchFiles', function() {
  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['concatScripts']);
  gulp.watch(['app/images/**/*'], reload);
})

// Clean output directory
gulp.task('clean', function() {
  del(['dist', 'css/application.css*', 'js/app*.js*']);
});

// Optimize images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});

// Copy all files at the root level (app)
gulp.task('copy', function () {
  return gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy web fonts to dist
gulp.task('fonts', function () {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

//NEEDS DESCRIPTION
gulp.task("build", ['minifyScripts', 'styles'], function() {
  return gulp.src(["app/styles/css/application.css", "app/scripts/app.min.js", 'index.html',
                   "app/images/**", "app/fonts/**"], { base: './'})
            .pipe(gulp.dest('dist'));
});

// Serve output from dev build
gulp.task('serve', ['watchFiles'], function() {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'IJS',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app']
  });
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist'
  });
});

// Build production files, the default task
gulp.task('default', ['clean'], function() {
  gulp.start('build');
});
