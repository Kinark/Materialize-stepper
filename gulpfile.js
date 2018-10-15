var gulp = require('gulp');
var rename = require('gulp-rename');
var pump = require('pump')
var lec = require('gulp-line-ending-corrector');
var header = require('gulp-header');
var version = require('./package.json').version

var licenseHeader = [
   '/**',
   ' * Materialize Stepper - A little plugin that implements a stepper to Materializecss framework.',
   ' * @version v' + version + '',
   ' * @author Igor Marcossi (Kinark) <igormarcossi@gmail.com>.',
   ' * @link https://github.com/Kinark/Materialize-stepper',
   ' * ',
   ' * Licensed under the MIT License (https://github.com/Kinark/Materialize-stepper/blob/master/LICENSE).',
   ' */',
   '\n'
].join('\n')

/////////////////////
////////PATHS////////
/////////////////////

var mainScss = './src/scss/mstepper.scss';

var scssInput = './src/scss/**/*.scss';
var scssOutput = './dist/css';

var jsInput = './src/js/**/*.js';
var jsOutput = './dist/js/';

var docsInput = './src/html_docs/**/*.html';
var docsIndex = './src/html_docs/index.html';
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
      header(licenseHeader),
      rename("mstepper.css"),
      gulp.dest(scssOutput),
      sourcemaps.write(),
      cleanCss(),
      rename("mstepper.min.css"),
      header(licenseHeader),
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
      header(licenseHeader),
      gulp.dest(jsOutput),
      uglify().on('error', onError),
      rename("mstepper.min.js"),
      header(licenseHeader),
      gulp.dest(jsOutput),
   ], cb);
});

/////////////////////
////////HTML/////////
/////////////////////
var fileInclude = require('gulp-file-include');

gulp.task('html', function (cb) {
   pump([
      gulp.src(docsIndex),
      fileInclude({
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
   return gulp.watch(docsInput, ['html']);
});

/////////////////////
///////DEFAULT///////
/////////////////////

gulp.task('default', ['js', 'sass', 'html', 'watchCSS', 'watchJS', 'watchHTML']);

function onError(err) {
   console.log(err);
   this.emit('end');
}
