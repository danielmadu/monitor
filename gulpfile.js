var jshint = require('gulp-jshint');
var gulp = require('gulp');

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint());
});

gulp.task('default',['lint']);
