// Initialize modules
const { src, dest, watch, series } = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const babel = require('gulp-babel')
const terser = require('gulp-terser')
const imagemin = require('gulp-imagemin')
const imagewebp = require('gulp-webp')
const browsersync = require('browser-sync').create()


// Use dart-sass for the new Sass syntax
//sass.compiler = require('dart-sass')


//Sass Task
function scssTask() {
    return src('app/scss/style.scss', { sourcemaps: true })
        .pipe(sass())
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(dest('dist/css', { sourcemaps: '.' }))
}

// JavaScript Task
function jsTask() {
    return src('app/js/script.js', { sourcemaps: true })
        .pipe(babel({ presets: ['@babel/preset-env'] })
        .pipe(terser()))
        .pipe(dest('dist/js', { sourcemaps: '.' }))
}

// Image Task
function imageTask() {
    return src('images/*.{jpg,jpeg,png,svg}')
        .pipe(imagemin([
            imagemin.mozjpeg({ quality: 80, progressive: true }),
             imagemin.optipng({ optimizationLevel: 2 }),
              imagemin.svgo({ plugins: [
                { removeViewBox: true }, 
                { cleanupIDs: false }
                ]})
            ]))
        .pipe(imagewebp())
        .pipe(dest('dist/img'))
}


// Browsersync
function browserSyncServe(cb) {
    browsersync.init({
        server: {
            baseDir: '.',
        },
        notify: {
            styles: {
                top: 'auto',
                bottom: '0'
            }
        }
    })
    cb()
}

function browserSyncReload(cb) {
    browsersync.reload()
    cb()
}


// Watch Task
function watchTask() {
    watch('*.html', browserSyncReload)
    watch(['app/scss/**/*.scss', 'app/**/*.js', 'images/*.{jpg,jpeg,png,svg}'], series(scssTask, jsTask, imageTask, browserSyncReload))
}

// Default Gulp Task
exports.default = series(scssTask, jsTask, imageTask, browserSyncServe, watchTask)