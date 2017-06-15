Date format: d/m/y

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
