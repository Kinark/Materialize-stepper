const fs = require("fs");
const path = require("path");

const { JSDOM } = require('jsdom');
const chai = require("chai");
const expect = chai.expect;

var testHTMLFilePath = path.resolve(process.cwd(), "html", "test-page-1.html");
const testHTML = fs.readFileSync(testHTMLFilePath, {encoding: "utf8"});

const { window } = global.window = new JSDOM(testHTML);
const $ = global.jQuery = global.$ = require('jquery')(window);

//Initialize materialize-stepper
require('../materialize-stepper');


describe("Stepper API", () => {

    it("has a 'isValid' method", () => {
        fExists("isValid");
    }),

    it("has a 'getActiveStep' method", () => {
        fExists('getActiveStep');
    }),

    it("has a 'activateStep' method", () => {
        fExists('activateStep');   
    }),

    it("has a 'deactivateStep' method", () => {
        fExists('activateStep');
    }),

    it("has a 'showError' method", () => {
        fExists('showError');
    }),

    it("has a 'activateFeedback' method", () => {
        fExists('activateFeedback');
    }),

    it("has a 'destroyFeedback' method", () => {
        fExists('destroyFeedback');
    }),

    it("has a 'resetStepper' method", () => {
        fExists('resetStepper');
    }),

    it("has a 'submitStepper' method", () => {
        fExists('submitStepper');
    }),

    it("has a 'nextStep' method", () => {
        fExists('nextStep');
    }),

    it("has a 'prevStep' method", () => {
        fExists('prevStep');
    }),

    it("has a 'openStep' method", () => {
        fExists('openStep');
    }),

    it("has a 'closeAction' method", () => {
        fExists('closeAction')
    }),

    it("has a 'openAction' method", () => {
        fExists('openAction');
    }),

    it("has a 'activateStepper' method", () => {
        fExists('activateStepper');
    }),

    it("has a 'getStep' method", () => {
        fExists('getStep');
    }),

    it("has a 'validatePreviousSteps' method", () => {
        fExists('validatePreviousSteps');
    }),

    it("has a 'validateStep' method", () => {
        fExists('validateStep');
    }),

    it("has a 'validateStepInput' method", () => {
        fExists('validateStepInput');
    })





})


function fExists(functionName)
{
    expect($.fn[functionName]).to.not.equal(undefined);
    expect($.fn[functionName]).to.not.equal(null);
    expect(typeof $.fn[functionName]).to.equal("function");
}