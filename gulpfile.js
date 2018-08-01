let gulp = require('gulp');
let babel = require('gulp-babel');
let uglify = require('gulp-uglify');

gulp.task('default', () => {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015', 'react', 'stage-0']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});