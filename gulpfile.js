'use strict';

const { task, src, dest, series, watch } = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const plumber = require('gulp-plumber');
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
const minify = require('gulp-csso');
const rename = require('gulp-rename');
const sourcemap = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const { optipng, jpegtran, svgo } = require('gulp-imagemin');
const jsmin = require('gulp-jsmin');
const htmlmin = require('gulp-html-minifier');
const del = require('del');
const server = require('browser-sync');
const webp = require('gulp-webp');

task('html', function () {
  return src('src/*.html')
    .pipe(posthtml(
      [include()]
    ))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(dest('public'));
});

task('css', function () {
  return src('src/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(dest('public/css'));
});

task('js', function () {
  return src('src/js/app.js')
    .pipe(jsmin())
    .pipe(rename('app.min.js'))
    .pipe(dest('public/js'));
});

task('img', function () {
  return src('src/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      optipng({optimizationLevel: 3}),
      jpegtran({progressive: true}),
      svgo()
    ]))
    .pipe(dest('public/img'));
});

task('webp', function () {
  return src('src/img/**/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(dest('public/img'));
});

task('copy', function () {
  return src([
    'src/fonts/**/*.{woff,woff2}'
  ], {
    base: 'src'
  })
    .pipe(dest('public'));
});

task('del', function () {
  return del('public');
});

task('refresh', function (done) {
  server.reload();
  done();
});

task('server', function () {
  server.init({
    server: 'public/'
  });
  watch('src/*.html', series('html', 'refresh'));
  watch('src/sass/**/*.sass', series('css', 'refresh'));
  watch('src/js/app.js', series('js', 'refresh'))
});

task('build', series(
  'del',
  'copy',
  'html',
  'css',
  'js',
  'img',
  'webp'
));

task('start', series('build', 'server'));
