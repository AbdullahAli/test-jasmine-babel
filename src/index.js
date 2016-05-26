import request  from "request-promise";
import Bluebird from "bluebird";
import _        from "lodash";
import async    from "async";
import fs       from "fs";

function getData() {
    return request("https://randomuser.me/api");
}

function userData(callback) {
    return getData().then(data => callback(null, JSON.parse(data).results[0]));
}

function createPeople() {
    return new Bluebird(resolve => {
        async.times(10, (n, next) => {
            userData((err, data) => {
                next(err, data);
            });
        }, (err, data) => {
            resolve(data);
        });
    });
}

function genders(people) {
    let genderGroups = _.groupBy(people, (person) => {
        return person.gender;
    });

    return {
        male: genderGroups.male.length,
        female: genderGroups.female.length,
    };
}

function prepareData() {
    return new Bluebird(resolve => {
        createPeople()
            .then(people => {
                resolve({
                    data    : people,
                    genders : genders(people)
                });
            });
    });
}

function writeFile(data) {
    return new Bluebird(resolve => {
        fs.writeFile("output.txt", JSON.stringify(data), error => {
            if(!error) { resolve(); }
        });
    });
}

function main() {
    prepareData()
        .then(data => writeFile(data));
}

main();