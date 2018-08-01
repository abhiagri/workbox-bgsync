let gulp = require('gulp');
let babel = require('gulp-babel');
let uglify = require('gulp-uglify');
let minifyCss = require("gulp-minify-css");

gulp.task('minify-css', function () {
  gulp.src('src/**/*.css')
  .pipe(minifyCss())
  .pipe(gulp.dest('dist'));
});

gulp.task('minify-js', () => {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015', 'react', 'stage-0']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['minify-css', 'minify-js']);