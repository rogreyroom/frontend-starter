import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import cleanCSS from 'gulp-clean-css';
import imagemin from 'gulp-imagemin';
import del from 'del';
import bSync from 'browser-sync';

const bsCreate = bSync.create();

const paths = {
  public: {
    del: 'public/**',
    design: 'public/assets/css/design.min.css',
  },
  styles: {
    src: 'src/assets/scss/**/*.{scss,sass}',
    dest: 'public/assets/css/',
  },
  scripts: {
    src: 'src/assets/js/**/*.js',
    dest: 'public/assets/js/',
  },
  images: {
    src: 'src/assets/image/**/*.{jpg,jpeg,png,svg,ico}',
    dest: 'public/assets/images/',
  },
  fonts: {
    src: 'src/assets/fonts/**/*.{woff,woff2,ttf}',
    dest: 'public/assets/fonts/',
  },
  html: {
    src: 'src/*.html',
    dest: 'public/',
  },
};

export const clean = () => del([paths.public.del, !paths.public.del / info.md]);
export const buildClean = () => del([paths.public.design]);

function bs() {
  return bsCreate.init({
    server: {
      baseDir: './public/',
    },
  });
}

export function styles() {
  return (
    gulp
      .src(paths.styles.src)
      .pipe(sass())
      .pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false}))
      .pipe(cleanCSS())
      // pass in options to the stream
      .pipe(
        rename({
          basename: 'style',
          suffix: '.min',
        }),
      )
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(
        rename({
          basename: 'design',
          suffix: '.min',
        }),
      )
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(bsCreate.stream())
  );
}

export function scripts() {
  return gulp
    .src(paths.scripts.src, {sourcemaps: true})
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest(paths.scripts.dest));
}

export function images() {
  return gulp
    .src(paths.images.src, {since: gulp.lastRun(images)})
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.images.dest));
}

export function fonts() {
  return gulp
    .src(paths.fonts.src, {since: gulp.lastRun(fonts)})
    .pipe(gulp.dest(paths.fonts.dest));
}

export function html() {
  return gulp
    .src(paths.html.src, {since: gulp.lastRun(html)})
    .pipe(gulp.dest(paths.html.dest));
}

function watch() {
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.html.src, html).on('change', bsCreate.reload);
}

const build = gulp.series(
  clean,
  gulp.parallel(gulp.series(styles, buildClean), scripts, images, fonts, html),
);

export default build;

export const dev = gulp.series(build, gulp.parallel(watch, bs));
