"use strict";

import gulp from "gulp";
import del from "del";
import runSequence from "run-sequence";
import shell from "gulp-shell";
import jshint from "gulp-jshint";
import jas from "gulp-jasmine";
import "babel-core/register";

const buildDir = "out/";

gulp.task("default", ["lint", "test"]);
gulp.task("test", test);
gulp.task("lint", lint);
gulp.task("build", build);
gulp.task("clean", clean);
gulp.task("copy-app", copyApp);
gulp.task("copy-docker", copyDocker);
gulp.task("shrinkwrap", shrinkWrap);
gulp.task("bundle", bundle);
gulp.task("watch", watch);

function lint() {
    return gulp.src(["src/lib/*.js", "src/lib/**/*.js", "src/bin/*.js"]).
        pipe(jshint({
            node: true
        })).
        pipe(jshint.reporter("default"));
}

function test() {
    return gulp.src(["src/spec/**/*.js", "src/spec/**/**/*.js"])
        .pipe(jas());
}

function watch() {
    return gulp.src("").pipe(shell([
        "babel --watch src/ --out-dir out/"
    ]));
}

function clean(callback) {
    del([buildDir], callback);
}

function copyApp() {
    return gulp.src(["src/**"]).pipe(gulp.dest(buildDir));
}

function copyDocker() {
    return gulp.src("Dockerfile").pipe(gulp.dest(buildDir));
}

function shrinkWrap() {
    return gulp.src("").pipe(shell([
        "npm shrinkwrap",
        "mv npm-shrinkwrap.json build/npm-shrinkwrap.json",
        "cp package.json build/package.json"
    ]));
}

function bundle() {
    return gulp.src("").pipe(shell([
        "cd build && npm install --production"
    ]));
}

function build(callback) {
    runSequence(
        "clean",
        "lint",
        "test",
        ["copy-app", "copy-docker"],
        "shrinkwrap",
        "bundle",
        callback
    );
}