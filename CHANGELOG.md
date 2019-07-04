Date format: d/m/y

### 3.1.0 (04/07/19)
#### Features
* Added updateStepper method (as suggested at [#78](https://github.com/Kinark/Materialize-stepper/issues/78));

#### Fixes
* Fixed autoFormCreation: false not working (fixes [#73](https://github.com/Kinark/Materialize-stepper/issues/73));

### 3.0.1 (09/03/19)
#### Fixes
* Replaced literal classes by the global constant references (fixes [#67](https://github.com/Kinark/Materialize-stepper/issues/67));
* Fixed conflict with `.active` classes (fixes #65);
* Removed useless and unused `linearStepsNavigation` option;
* Code optimizations.

### 3.0 (12/12/18)
#### Features
* Added `stepopen` and `stepclose` custom events;
* Added `stepTitleNavigation` option as suggested in [#62](https://github.com/Kinark/Materialize-stepper/issues/62);
* Added a default `validationFunction`.

#### Fixes
* Fixed [#54](https://github.com/Kinark/Materialize-stepper/issues/54) where you couldn't add a step to the end of the stepper;
* Fixed [#58](https://github.com/Kinark/Materialize-stepper/issues/58) where specified `false` options were ignored;
* Fixed [#60](https://github.com/Kinark/Materialize-stepper/issues/60) where `stepchange` event was not being fired when clicking on step-titles.
* Refactored getUnknownHeight method to fix some bugs and optimize stuff;
* Fixed animations issues;
* Full migration to yarn.

#### Docs
* Added demos to API docs;
* Updated sidebar with all sections.

### 3.0.0-beta.1.1.1 (28/11/18)
* Added textarea when inputs need to be queried (fixes some issues);
* Fix the listeners unbinding of steps that are being removed;
* Readded autoFocus option.

### 3.0.0-beta.1.1 (26/11/18)
* Validation function is now called before the feedback function;
* Fixed inverted check of validation function's return;
* Fixes #51, where the stepper would lose it's selected status of radio buttons when calculating height;
* Added `resetStepper()` method.

### 3.0.0-beta.1.0.1 (13/11/18)
* Fixed the incorrect utilization of forEach in some cases (like in HTMLCollections, for example);
* Fixed binding of added/removed steps through activate/deactivateStep functions;
* Fixed the tabbing issue on horizontal steppers (https://github.com/Kinark/Materialize-stepper/issues/49);
* Fixed the submitting, now it calls the formValidation (if any) before submitting the form;
* Fixed some other code issues.

### 3.0.0-beta.1 (05/11/18)
In this version a master refactoring was made. Total modularization of CSS (with SASS), refacoring of all the javascript,
* Total modularization and partial refactoring of CSS:
  * Everything in SASS;
  * Everything modularized;
  * Now all the transitions are CSS powered!
  * The horizontal transition is triggered by just adding/removing the class `active` on the step;
  * Now the steps use padding-bottom instead of margin-bottom to make the height calculation easier;
* Refactoring of the JS code:
  * No longer requires jQuery or any other dependency;
  * Now it requires you to create an instance with `new`;
  * Removal of the integration with jQuery Validate, since there's A LOT of plugins and you may want to use some other one. To validate the steps, just define a `validationFunction` in the options and return a boolean (more in the [docs](https://kinark.github.io/Materialize-stepper/));
  * Removal of parallel stepper due to the adding of the validation function;
  * Some methods/options such as `resetStepper` and `autoFocusInput` are still missing;
  * Custom events and `showError` function were removed;
  * Added more events and removed some other ones. Check the [docs](https://kinark.github.io/Materialize-stepper/) for more information;
  * prevStep() now destroyes feedback preloader;
* Adding of gulp to make the development easier;
* Moved docs to the gh-pages, instead of the readme.

### 2.1.5 (only on github for now) (01/12/17)
* Bug fixes.
* Added parallel stepper.

### 2.1.4 (14/06/17)
* Added NPM package.

### 2.1.3 (28/03/17)
* Fixed step-title margins;
* Added small CSS callback for browsers that don't support calc() on CSS.

### 2.1.2 (24/03/17)
* Fixed 2 seconds animation bug on deactivateStep. Sorry!
* Fixed animations with last step dinamically added (on verticals) again... Sorry, again ;-;

### 2.1.1 (23/03/17)
* Fixed last steps dinamically added issue;
* Fixed dinamically added steps on horizontal stepper (a little buggy animation on last step dinamically added on horizontal steppers);
* Added autoFocusInput, autoFormCreation and showFeedbackLoader options.

### v2.1 (18/03/17)
* Fixed horizontal stepper paddings and margins for materialize 0.98 cards;
* Responsive horizontal stepper on width 993px!;
* Callback to activateStep(), deactivateStep(), prevStep() and nextStep() functions;
* Small code improvements;
* Now you're able to have multiple nextstep buttons with multiple feedbacks;
* Now "Submit" button also activate feedback functions (and you can submit your stepper/form with submitStepper() function afterwards);
* prevStep() won't work if the active step is feedbacking;
* stepsNavigation option for linear steppers.

### v2.0.3 (09/01/17)
* Fixed callback error on openStep() function;

### v2.0.2 (11/12/16)
* Callback for openStep() function;
* New form spawn system;
* New submitStepper() function.

### v2.0.1 (02/12/16)
* jQuery Validation Plugin is now optional.

### v2.0 (17/11/16)

* Custom custom events added!;
* Fixed validation for the last step submit button;
* Fixed custom events order... again...;
* resetStepper() function added;
* getActiveStep() function added;
* Fixed the possibility of double feedback-screens appear;
* Easing added on animations;
* Step labels added;
* Fixed wrapping buttons on button-actions;
* Removed stepper max-width;
* New feedbacking class on feedbacking steps;
* Browsers prefixes added;
* ADDED HORIZONTAL STEPPERS!

### v1.2.3 (12/10/16) - yeah, two updates, I'm noob...

* Fixed functions not working with hidden steps (dynamically added ones);
* Done steps has blue background-color.

### v1.2.2 (12/10/16)

* Fixed non-linear steps on multiple steppers pages;
* Small margin on rows added.

### v1.2.1 (11/10/16)

* Multiple steps in one page!!!!!

### v1.2 (10/10/16)

* Now the step numbers are shown with the css property counter;
* Fixed custom events order;
* Fixed nextStep always triggering feedback function;
* PrevStep function removes wrong class from previous active step;
* New function showError;
* New functions activateStep and deactivateStep;
* You won't need to use updateSteps anymore!

### v1.1.1 (09/10/16)

* Fixed some issues with custom events and validation;
* Fixed feedback functions (they disappeared!);
* Fixed openStep working with dynamically added steps;
* Fixed small jump in animation that was causing scroll jump;
* Fixed simple css bugs.

### v1.1 (08/10/16)

* Fixed openStep() numbers (was counting from 0(like, 0=1));
* Fixed index only visible steps;
* Add updateSteps() function;
* The .wrong class given to the step is more accurated (more like onkeyup);
* Allow to trigger next and prev step when user clicks on the next/prev step itself on linear stepper;
* Added custom events;
* Decrease label error font size;
* Fixed (again) labels;
* Fixed (again) inputs margins/paddings;
* Fixed radio/checkbox error labels (added messages).

### v1.0.3 (forgot the date)
* Fixed radio/checkbox inputs jQuery Validation issues: there's no more error message for those.

### v1.0.2 (forgot the date)
* Fixed overflow issues, causing hidden select inputs (and maybe other troubles).

### v1.0.1 (forgot the date)
* Fixed inputs margin problems.

### v1.0
* Released!
