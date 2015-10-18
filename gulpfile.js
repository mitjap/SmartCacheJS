var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsd = require('gulp-tsd');
var merge = require('merge2');
 
var tsProject = ts.createProject('tsconfig.json');
 
gulp.task('scripts', function() {
    var tsResult = gulp.src('lib/**.ts')
                    .pipe(ts(tsProject));
 
    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done. 
        tsResult.dts.pipe(gulp.dest('release/definitions')),
        tsResult.js.pipe(gulp.dest('release/js'))
    ]);
});

gulp.task('watch', ['scripts'], function() {
    gulp.watch('lib/**.ts', ['scripts']);
});

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});