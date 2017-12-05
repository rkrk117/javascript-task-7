'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */

function runParallel(jobs, parallelNum, timeout = 1000) {
    var results = [];
    var alreadyFinnished = 0;
    var currentJob = 0;
    var firstJobs = jobs.slice(0, parallelNum);

    function run(job, i, resolve) {
        currentJob++;

        return new Promise(microResolve => {
            job().then(microResolve, microResolve);
            setTimeout(() => microResolve(new Error('Promise timeout')), timeout);
        }).then(function (result) {
            results[i] = result;
            alreadyFinnished++;
            addAndRun(result, resolve);
        });
    }

    function addAndRun(result, resolve) {
        if (alreadyFinnished === jobs.length) {
            resolve(results);
        } else if (currentJob < jobs.length) {
            run(jobs[currentJob], currentJob, resolve);
        }
    }

    return new Promise(resolve => {
        if (firstJobs.length === 0) {
            resolve([]);
        } else {
            firstJobs.forEach((job, index) => {
                run(job, index, resolve);
            });
        }
    });
}
