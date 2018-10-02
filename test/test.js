const fs = require("fs");
const path = require("path");

const chai = require("chai");
const expect = chai.expect;

var filepath = path.resolve(process.cwd(), "html", "test-page-1.html");
console.log(filepath);
const testHTML = fs.readFileSync(filepath, {encoding: "utf8"});
console.log(testHTML);
const { JSDOM } = require('jsdom');
const jsdom = new JSDOM(testHTML);
const { window } = global.window = jsdom;
const $ = global.jQuery = global.$ = require('jquery')(window);

const app = require('../materialize-stepper');


describe("Stepper API", () => {

    it("has a 'isValid' method", () => {
        console.log($.fn.isValid);
        expect($.fn.isValid).to.not.equal(undefined);
    })


})