var gulp = require('gulp');
var rename = require('gulp-rename');
var pump = require('pump')
var lec = require('gulp-line-ending-corrector');

/////////////////////
////////PATHS////////
/////////////////////

var mainScss = './src/scss/mstepper.scss';

var scssInput = './src/scss/**/*.scss';
var scssOutput = './dist/css';

var jsInput = './src/js/**/*.js';
var jsOutput = './dist/js/';

var docsInput = './src/html_docs/index.html';
var docsOutput = './docs/';

/////////////////////
/////////CSS/////////
/////////////////////
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleanCss = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', function (cb) {
   pump([
      gulp.src(mainScss),
      lec(),
      sourcemaps.init(),
      sass().on('error', onError),
      autoprefixer(),
      gulp.dest(scssOutput),
      sourcemaps.write(),
      cleanCss(),
      rename("mstepper.min.css"),
      gulp.dest(scssOutput),
   ], cb);
});

/////////////////////
/////////JS//////////
/////////////////////
var uglify = require('gulp-uglify');
var concatJS = require('gulp-concat');

gulp.task('js', function (cb) {
   pump([
      gulp.src(jsInput),
      concatJS('mstepper.js'),
      gulp.dest(jsOutput),
      gulp.dest(testOutput),
      uglify().on('error', onError),
      rename("mstepper.min.js"),
      gulp.dest(jsOutput),
   ], cb);
});

/////////////////////
////////HTML/////////
/////////////////////
var fileInclude = require('gulp-file-include');

gulp.task('html', function (cb) {
   pump([
      gulp.src(docsInput),
      fileinclude({
         prefix: '@@',
         basepath: '@file'
      }),
      gulp.dest(docsOutput)
   ], cb);
});

/////////////////////
////////WATCH////////
/////////////////////

gulp.task('watchCSS', function () {
   return gulp.watch(scssInput, ['sass']);
});

gulp.task('watchJS', function () {
   return gulp.watch(jsInput, ['js']);
});

gulp.task('watchHTML', function () {
   return gulp.watch(jadeInput, ['html']);
});

/////////////////////
///////DEFAULT///////
/////////////////////

gulp.task('default', ['js', 'sass', 'jade', 'watchCSS', 'watchJS', 'watchHTML']);

function onError(err) {
   console.log(err);
   this.emit('end');
}
