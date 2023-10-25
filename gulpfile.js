const gulp = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('gulp-buffer');
const stripComments = require('gulp-strip-comments');
//const uglify = require("gulp-uglify");

const ttf2woff = require('gulp-ttf2woff');
const ttf2eot = require('gulp-ttf2eot');

const uglify = require('gulp-terser');

gulp.task('server', function () {
  browserSync({
    server: {
      baseDir: 'dist',
    },

    startPath: '/',
    port: 3000,
    open: 'external',
    notify: false,
    // Устанавливаем широковещательный режим для работы на всех устройствах в сети.
    host: '192.168.1.56',
  });

  gulp.watch('src/*.html').on('change', browserSync.reload);
});

gulp.task('styles', function () {
  return gulp
    .src('src/sass/**/*.+(scss|sass)')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({ suffix: '.min', prefix: '' }))
    .pipe(autoprefixer())
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(browserSync.stream());
});

gulp.task('watch', function () {
  gulp.watch('src/sass/**/*.+(scss|sass|css)', gulp.parallel('styles'));
  gulp.watch('src/*.html').on('change', gulp.parallel('html'));
  gulp.watch('src/js/**/*.js').on('change', gulp.parallel('scripts'));
  gulp.watch('src/js/**/*.js').on('change', gulp.parallel('buildJS'));
  gulp.watch('src/js/libs/*.js').on('change', gulp.parallel('exportJsLibs'));
  //gulp.watch('src/fonts/**/*').on('all', gulp.parallel('fonts'));
  gulp.watch('src/fonts/**/*').on('all', gulp.parallel('convertFonts'));
  gulp.watch('src/icons/**/*').on('all', gulp.parallel('icons'));
  gulp.watch('src/img/**/*').on('all', gulp.parallel('images'));
  gulp.watch('src/svg/**/*.svg').on('change', gulp.parallel('svgSprite'));
});

gulp.task('html', function () {
  return (
    gulp
      .src('src/*.html')
      //.pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('dist/'))
  );
});

gulp.task('scripts', function () {
  return gulp.src(['src/js/**/*.js']).pipe(browserSync.stream());
});

//gulp.task('fonts', function () {
 // return gulp.src('src/fonts/**/*').pipe(gulp.dest('dist/assets/fonts')).pipe(browserSync.stream());
//});

gulp.task('icons', function () {
  return gulp.src('src/icons/**/*').pipe(gulp.dest('dist/assets/icons')).pipe(browserSync.stream());
});

gulp.task('images', function () {
  return gulp.src('src/img/**/*').pipe(imagemin()).pipe(gulp.dest('dist/assets/img')).pipe(browserSync.stream());
});

gulp.task('buildJS', () => {
  return browserify({
    entries: 'src/js/script.js',
    debug: true,
    transform: [['babelify', { presets: ['@babel/preset-env'] }]],
  })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(stripComments()) // Remove comments
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/assets/js'));
});

gulp.task('exportJsLibs', function () {
  return gulp.src('src/js/libs/*.js').pipe(concat('libs.min.js')).pipe(gulp.dest('dist/assets/js')).pipe(browserSync.stream());
});

gulp.task('svgSprite', function () {
  return gulp
    .src('src/svg/**/*.svg')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../svg-sprite.svg',
          },
        },
      })
    )
    .pipe(gulp.dest('dist/assets/sprites/'));
});


// Задача для конвертации в WOFF
gulp.task('ttf2woff', function() {
  return gulp.src('src/fonts/**/*')
    .pipe(ttf2woff())
    .pipe(gulp.dest('./dist/assets/fonts/')) // Куда сохранить WOFF-шрифты
    .pipe(browserSync.stream()); 
});

// Задача для конвертации в EOT
gulp.task('ttf2eot', function() {
  return gulp.src('src/fonts/**/*')
    .pipe(ttf2eot())
    .pipe(gulp.dest('./dist/assets/fonts/')) // Куда сохранить EOT-шрифты
    .pipe(browserSync.stream()); 
});


// Задача для выполнения обеих конвертаций
gulp.task('convertFonts', gulp.parallel('ttf2woff', 'ttf2eot'));


gulp.task(
  'default',
  gulp.parallel(
    'watch',
    'server',
    'styles',
    'scripts',
    //'fonts',
    'icons',
    'html',
    'images',
    'buildJS',
    'exportJsLibs',
    'svgSprite',
    'convertFonts'
  )
);
