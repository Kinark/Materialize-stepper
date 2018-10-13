var gulp = require('gulp');
var rename = require('gulp-rename');
var pump = require('pump')
var lec = require('gulp-line-ending-corrector');

/////////////////////
////////PATHS////////
/////////////////////

var mainScss = './src/scss/ceres.scss';

var scssInput = './src/scss/**/*.scss';
var scssOutput = './dist/css';

var jsInput = './src/js/**/*.js';
var jsOutput = './dist/js/';

var testOutput = './test';

var jadeInput = './src/jade/*.jade';
var jadeOutput = './doc/';

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
      gulp.dest(testOutput),
      cleanCss(),
      rename("ceres.min.css"),
      gulp.dest(scssOutput),
   ],cb);
});

/////////////////////
/////////JS//////////
/////////////////////
var uglify = require('gulp-uglify');
var concatJS = require('gulp-concat');

gulp.task('js', function (cb) {
   pump([
      gulp.src(jsInput),
      concatJS('ceres.js'),
      gulp.dest(jsOutput),
      gulp.dest(testOutput),
      uglify().on('error', onError),
      rename("ceres.min.js"),
      gulp.dest(jsOutput),
   ],cb);
});

/////////////////////
////////JADE/////////
/////////////////////
// var jade = require('gulp-file-include');

// gulp.task('jade', function (cb) {
//    var YOUR_LOCALS = { }
//    pump([
//       gulp.src('./src/jade/*.jade'),
//       jade({
//          locals: YOUR_LOCALS
//       }),
//       gulp.dest('./doc/')
//    ],cb);
// });

/////////////////////
////////WATCH////////
/////////////////////

gulp.task('watchCSS', function() {
   return gulp
   .watch(scssInput, ['sass']);
});

gulp.task('watchJS', function() {
   return gulp
   .watch(jsInput, ['js']);
});

// gulp.task('watchJade', function() {
//    return gulp
//    .watch(jadeInput, ['jade']);
// });

/////////////////////
///////DEFAULT///////
/////////////////////

// gulp.task('default', ['js', 'sass', 'jade', 'watchCSS', 'watchJS', 'watchJade']);
gulp.task('default', ['js', 'sass', 'jade', 'watchCSS', 'watchJS']);

function onError(err) {
   console.log(err);
   this.emit('end');
}
