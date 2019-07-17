var gulp = require('gulp');
var jeditor = require("gulp-json-editor");
const spawn = require('cross-spawn');
const argv = require('yargs').argv;
var map = require('map-stream');

var library = argv.lib;
var version = argv.pv;
var verifyVer = /^(\d{1,2})(\.)(\d{1,2})(\.)(\d{1,2})$/g;

gulp.task('default', function (done) {
  console.log('\x1B[92mGulp is ok!');
  done();
});

gulp.task('verifyLib', function (done) {
  if (library == undefined) {
    done(new Error('\x1B[91mLibreria non inserita\x1B[0m, inserire con "--lib"'));
  } else {
    console.log("Libreria selezionata: \x1B[33m" + library + "\x1B[0m");
    done();
  }
})

gulp.task('verifyVer', function (done) {
  if (version == undefined || !version.match(verifyVer)) {
    done(new Error('\x1B[91mVersione non valida\x1B[0m'));
  } else {
    console.log("Versione: \x1B[33m" + version + "\x1B[0m");
    done();
  }
})

gulp.task('setVersion', function () {
  return gulp.src(`./projects/${library}/package.json`)
    .pipe(jeditor({
      'version': version
    }))
    .pipe(gulp.dest(`./projects/${library}`))
})

gulp.task('compodocLib', () => {
  return spawn('npx', ['compodoc', '-p', `projects/${library}/tsconfig.lib.json`, '-d', `documentation/${library}`], {
    stdio: 'inherit'
  });
});

gulp.task('compodocAll', function () {
  return gulp.src('./projects/*')
    .pipe(map(function (file, done) {
      spawn.sync('npx', ['compodoc', '-p', file.path + '/tsconfig.lib.json', '-d', 'documentation/' + file.path.split("\\").pop()], {
        stdio: 'inherit'
      });
      done();
    }))
    .pipe(gulp.dest("./projects"))
})

gulp.task('buildLib', () => {
  return spawn('ng', ['build', library], {
    stdio: 'inherit'
  });
});

gulp.task('buildAll', function () {
  return gulp.src('./projects/*')
    .pipe(map(function (file, done) {
      spawn.sync('gulp', ['buildLib', '--lib', file.path.split("\\").pop(), '--pv', version], {
        stdio: 'inherit'
      });
      done();
    }))
    .pipe(gulp.dest("./projects"))
})

gulp.task('publishOnNpm', (cb) => {
  return spawn('npm', ['publish', `./dist/${library}`], {
    stdio: 'inherit'
  });
});

gulp.task('publish', gulp.series('verifyLib', 'verifyVer', 'setVersion', 'buildLib', 'publishOnNpm'));

gulp.task('publishAll', function () {
  return gulp.src('./projects/*')
    .pipe(map(function (file, done) {
      spawn.sync('gulp', ['publish', '--lib', file.path.split("\\").pop(), '--pv', version], {
        stdio: 'inherit'
      });
      done();
    }))
    .pipe(gulp.dest("./projects"))
})

/****************************************************************************
 * Tasks for Jenkins
 ****************************************************************************/

gulp.task('buildJenkins', gulp.series('verifyLib', 'verifyVer', 'setVersion', 'buildLib'));

gulp.task('buildAllJenkins', function () {
  return gulp.src('./projects/*')
    .pipe(map(function (file, done) {
      spawn.sync('gulp', ['buildJenkins', '--lib', file.path.split("/").pop(), '--pv', version], {
        stdio: 'inherit'
      });
      done();
    }))
    .pipe(gulp.dest("./projects"))
})

gulp.task('compodocAllJenkins', function () {
  return gulp.src('./projects/*')
    .pipe(map(function (file, done) {
      spawn.sync('npx', ['compodoc', '-p', file.path + '/tsconfig.lib.json', '-d', 'documentation/' + file.path.split("/").pop()], {
        stdio: 'inherit'
      });
      done();
    }))
    .pipe(gulp.dest("./projects"))
})

gulp.task('buildsAndCompodocJenkins', gulp.series('buildAllJenkins', 'compodocAllJenkins'));

gulp.task('publishAllJenkins', function () {
  return gulp.src('./projects/*')
    .pipe(map(function (file, done) {
      spawn.sync('gulp', ['publishOnNpm', '--lib', file.path.split("/").pop(), '--pv', version], {
        stdio: 'inherit'
      });
      done();
    }))
    .pipe(gulp.dest("./projects"))
})

/******************************************************************************* */

gulp.task('del-lock', () => {
  try {
    return spawn('del', ['package-lock.json'], {
      stdio: 'inherit'
    })
  } catch (error) {
    error
  }
});

gulp.task('npm-install', () => {
  if (library != undefined) {
    if (version != undefined) {
      return spawn('npm', ['install', library + '@' + version], {
        stdio: 'inherit'
      })
    } else {
      return spawn('npm', ['install', library], {
        stdio: 'inherit'
      })
    }
  } else {
    return spawn('npm', ['install'], {
      stdio: 'inherit'
    })
  }
});

gulp.task('plk', gulp.series('del-lock', 'npm-install'));
