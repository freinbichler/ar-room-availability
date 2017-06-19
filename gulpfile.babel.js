import gulp from 'gulp';
import gulploadplugins from 'gulp-load-plugins';
import runSequence from 'run-sequence';
import yargs from 'yargs';
import browserSync from 'browser-sync';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import path from 'path';
import del from 'del';
import handlebars from 'gulp-compile-handlebars';

const $ = gulploadplugins({
  lazy: true,
});

const argv = yargs.argv;

function handleError(error) {
  $.util.log(error.message);
  $.util.log(error.codeFrame);
  this.emit('end');
}

// SASS Styles
gulp.task('styles', () => gulp.src([
  'src/vendor/**/*.css',
  'src/sass/*.scss',
])
    .pipe($.changed('.tmp/styles', { extension: '.css' }))
    .pipe($.if(!argv.production, $.sourcemaps.init()))
    .pipe($.sassVariables({
      $production: (argv.production == true),
    }))
    .pipe($.sass({
      precision: 10,
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({ browsers: ['> 1%', 'last 2 versions'] }))
    .pipe(gulp.dest('.tmp'))
    // Concatenate and minify styles if production mode (via gulp styles --production)
    .pipe($.if('*.css' && argv.production, $.minifyCss()))
    .pipe($.if(!argv.production, $.sourcemaps.write()))
    .pipe(gulp.dest('public/css'))
    .pipe(browserSync.stream())
    .pipe($.size({ title: 'styles' })));

// Scripts - app.js is the main entry point, you have to import all required files and modules
gulp.task('scripts', () => browserify({
  entries: 'src/js/app.js',
  debug: true,
})
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
      .on('error', handleError)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe($.if(!argv.production, $.sourcemaps.init({ loadMaps: true })))
    .pipe($.if(argv.production, $.uglify()))
      .on('error', handleError)
    .pipe($.if(!argv.production, $.sourcemaps.write()))
    .pipe(gulp.dest('./public/js')));

gulp.task('vendor', () => gulp.src('src/js/vendor/*').pipe(gulp.dest('public/js/vendor')));

gulp.task('static', () => gulp.src('src/**/*.{html,php,jpg,jpeg,png,gif,svg,ico,eot,ttf,woff,woff2,obj}').pipe(gulp.dest('public')));

gulp.task('templates', () => gulp.src([
  'src/**/*.hbs',
  '!src/partials/*.hbs',
])
    .pipe(handlebars({}, {
      batch: 'src/partials',
    }))
    .pipe($.rename((path) => {
      path.extname = '.html';
    }))
    .pipe(gulp.dest('public')));

// Browser-Sync
gulp.task('serve', ['styles', 'scripts', 'templates', 'static', 'vendor'], () => {
  browserSync({
    notify: false,
    server: ['.tmp', 'public'],
    https: true,
  });

  gulp.watch(['src/sass/**/*.{scss,css}'], ['styles']);
  gulp.watch(['src/js/**/*.{js,es6}'], ['scripts', browserSync.reload]);
  gulp.watch(['src/**/*.hbs'], ['templates', browserSync.reload]);
  gulp.watch(['src/js/vendor/*'], ['vendor', browserSync.reload]);
  gulp.watch(['src/**/*.{html,php,jpg,jpeg,png,gif,svg,ico,eot,ttf,woff,woff2,obj}'], ['static', browserSync.reload]).on('change', (event) => {
    if (event.type === 'deleted') {
      const filePathFromSrc = path.relative(path.resolve('src'), event.path);
      const destFilePath = path.resolve('public', filePathFromSrc);
      console.log(`deleting ${destFilePath}...`);
      del.sync(destFilePath);
    }
  });
});

gulp.task('build', ['styles', 'scripts', 'templates', 'static']);
