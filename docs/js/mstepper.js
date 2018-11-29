/**
 * Materialize Stepper - A little plugin that implements a stepper to Materializecss framework.
 * @version v3.0.0-beta.1.1.1
 * @author Igor Marcossi (Kinark) <igormarcossi@gmail.com>.
 * @link https://github.com/Kinark/Materialize-stepper
 * 
 * Licensed under the MIT License (https://github.com/Kinark/Materialize-stepper/blob/master/LICENSE).
 */

"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** Class representing an MStepper */
var MStepper =
/*#__PURE__*/
function () {
  /**
   * Constructor for Materialize Stepper.
   * @param {HTMLElement} elem - Element in which stepper will be initialized.
   * @param {object} [options] - Stepper options.
   * @param {number} [options.firstActive=0] - Default active step.
   * @param {boolean} [options.linearStepsNavigation=true] - Allow navigation by clicking on the next and previous steps on linear steppers.
   * @param {boolean} [options.autoFocusInput=false] - Auto focus on first input of each step.
   * @param {boolean} [options.showFeedbackPreloader=true] - Set if a loading screen will appear while feedbacks functions are running.
   * @param {boolean} [options.autoFormCreation=true] - Auto generation of a form around the stepper.
   * @param {function} [options.validationFunction=null] - Function to be called everytime a nextstep occurs. It receives 2 arguments, in this sequece: stepperForm, activeStep.
   * @param {string} [options.feedbackPreloader] - Preloader used when step is waiting for feedback function. If not defined, Materializecss spinner-blue-only will be used.
   */
  function MStepper(elem) {
    var _this = this;

    var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, MStepper);

    _defineProperty(this, "_init", function () {
      var _formWrapperManager = _this._formWrapperManager,
          getSteps = _this.getSteps,
          options = _this.options,
          stepper = _this.stepper,
          classes = _this.classes,
          _methodsBindingManager = _this._methodsBindingManager,
          _openAction = _this._openAction; // Calls the _formWrapperManager

      _this.form = _formWrapperManager(); // Opens the first step (or other specified in the constructor)

      _openAction(getSteps().steps[options.firstActive], undefined, undefined, true); // Gathers the steps and send them to the methodsBinder


      _methodsBindingManager(stepper.querySelectorAll(".".concat(classes.STEP)));
    });

    _defineProperty(this, "_methodsBindingManager", function (steps) {
      var unbind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var classes = _this.classes,
          _formSubmitHandler = _this._formSubmitHandler,
          _nextStepProxy = _this._nextStepProxy,
          _prevStepProxy = _this._prevStepProxy,
          _stepTitleClickHandler = _this._stepTitleClickHandler,
          form = _this.form,
          options = _this.options;
      var addMultipleEventListeners = MStepper.addMultipleEventListeners,
          removeMultipleEventListeners = MStepper.removeMultipleEventListeners,
          nodesIterator = MStepper.nodesIterator,
          tabbingDisabler = MStepper.tabbingDisabler;
      var bindOrUnbind = unbind ? removeMultipleEventListeners : addMultipleEventListeners; // Sets the binding function

      var bindEvents = function bindEvents(step) {
        var nextBtns = step.getElementsByClassName(classes.NEXTSTEPBTN);
        var prevBtns = step.getElementsByClassName(classes.PREVSTEPBTN);
        var stepsTitle = step.getElementsByClassName(classes.STEPTITLE);
        var inputs = step.querySelectorAll('input, select, textarea, button');
        var submitButtons = step.querySelectorAll('button[type="submit"]');
        bindOrUnbind(nextBtns, 'click', _nextStepProxy, false);
        bindOrUnbind(prevBtns, 'click', _prevStepProxy, false);
        bindOrUnbind(stepsTitle, 'click', _stepTitleClickHandler); // Prevents the tabbing issue (https://github.com/Kinark/Materialize-stepper/issues/49)

        if (inputs.length) bindOrUnbind(inputs[inputs.length - 1], 'keydown', tabbingDisabler); // Binds to the submit button an internal handler to manage validation

        if (submitButtons && form && options.validationFunction) bindOrUnbind(submitButtons, 'keydown', _formSubmitHandler);
        return step;
      }; // Calls the binder function in the right way (if it's a unique step or multiple ones)


      if (steps instanceof Element) bindEvents(steps);else nodesIterator(steps, function (step) {
        return bindEvents(step);
      });
    });

    _defineProperty(this, "_formSubmitHandler", function (e) {
      if (!_this._validationFunctionCaller()) e.preventDefault();
    });

    _defineProperty(this, "resetStepper", function () {
      if (_this.form) {
        _this.form.reset();

        _this.openStep(_this.options.firstActive);
      }
    });

    _defineProperty(this, "_openAction", function (step, cb) {
      var closeActiveStep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var skipAutoFocus = arguments.length > 3 ? arguments[3] : undefined;
      var _slideDown = _this._slideDown,
          classes = _this.classes,
          getSteps = _this.getSteps,
          _closeAction = _this._closeAction,
          stepper = _this.stepper,
          options = _this.options; // Gets the active step element

      var activeStep = getSteps().active.step; // If the active step is the same as the one that has been asked to be opened, returns the step

      if (activeStep && activeStep.isSameNode(step)) return step; // Gets the step content div inside the step

      var stepContent = step.getElementsByClassName(classes.STEPCONTENT)[0];
      step.classList.remove(classes.DONESTEP); // Checks if the step is currently horizontal or vertical

      if (window.innerWidth < 993 || !stepper.classList.contains(classes.HORIZONTALSTEPPER)) {
        // The stepper is running in vertical mode
        // Calls the slideDown private method if the stepper is vertical
        _slideDown(stepContent, classes.ACTIVESTEP, step, cb); // Beginning of disabled autoFocusInput function due to issues with scroll


        if (!skipAutoFocus) {
          _slideDown(stepContent, classes.ACTIVESTEP, step, function () {
            // Gets the inputs from the nextStep to focus on the first one (temporarily disabled)
            var nextStepInputs = stepContent.querySelector('input, select, textarea'); // Focus on the first input of the next step (temporarily disabled)

            if (options.autoFocusInput && nextStepInputs) nextStepInputs.focus();
            if (cb && typeof cb === 'function') cb();
          });
        } // Enf of disabled autoFocusInput function due to issues with scroll

      } else {
        // The stepper is running in horizontal mode
        // Adds the class 'active' from the step, since all the animation is made by the CSS
        step.classList.add('active');
      } // If it was requested to close the active step as well, does it (default=true)


      if (activeStep && closeActiveStep) _closeAction(activeStep);
      return step;
    });

    _defineProperty(this, "_closeAction", function (step, cb) {
      var _slideUp = _this._slideUp,
          classes = _this.classes,
          stepper = _this.stepper,
          _smartListenerUnbind = _this._smartListenerUnbind,
          _smartListenerBind = _this._smartListenerBind; // Gets the step content div inside the step

      var stepContent = step.getElementsByClassName(classes.STEPCONTENT)[0]; // Checks if the step is currently horizontal or vertical

      if (window.innerWidth < 993 || !stepper.classList.contains(classes.HORIZONTALSTEPPER)) {
        // The stepper is running in vertical mode
        // Calls the slideUp private method on the step
        _slideUp(stepContent, classes.ACTIVESTEP, step, cb);
      } else {
        // The stepper is running in horizontal mode
        // If there's a callback, handles it
        if (cb) {
          // Defines a function to be called after the transition's end
          var waitForTransitionToCb = function waitForTransitionToCb(e) {
            // If the transition is not 'left', returns
            if (e.propertyName !== 'left') return; // Unbinds the listener from the element

            _smartListenerUnbind(stepContent, 'transitionend', waitForTransitionToCb); // Calls the callback


            cb();
          }; // Binds the callback caller function to the event 'transitionend'


          _smartListenerBind(stepContent, 'transitionend', waitForTransitionToCb);
        } // Removes the class 'active' from the step, since all the animation is made by the CSS


        step.classList.remove('active');
      }

      return step;
    });

    _defineProperty(this, "_nextStepProxy", function (e) {
      return _this.nextStep(undefined, undefined, e);
    });

    _defineProperty(this, "_prevStepProxy", function (e) {
      return _this.prevStep(undefined, e);
    });

    _defineProperty(this, "_stepTitleClickHandler", function (e) {
      var getSteps = _this.getSteps,
          classes = _this.classes,
          nextStep = _this.nextStep,
          prevStep = _this.prevStep,
          stepper = _this.stepper,
          _openAction = _this._openAction;

      var _getSteps = getSteps(),
          steps = _getSteps.steps,
          active = _getSteps.active;

      var clickedStep = e.target.closest(".".concat(classes.STEP)); // Checks if the stepper is linear or not

      if (stepper.classList.contains(classes.LINEAR)) {
        // Linear stepper detected
        // Get the index of the active step
        var clickedStepIndex = Array.prototype.indexOf.call(steps, clickedStep); // If the step clicked is the next one, calls nextStep(), if it's the previous one, calls prevStep(), otherwise do nothing

        if (clickedStepIndex == active.index + 1) nextStep();else if (clickedStepIndex == active.index - 1) prevStep();
      } else {
        // Non-linear stepper detected
        // Opens the step clicked
        _openAction(clickedStep);
      }
    });

    _defineProperty(this, "nextStep", function (cb, skipFeedback, e) {
      if (e && e.preventDefault) e.preventDefault();
      var options = _this.options,
          getSteps = _this.getSteps,
          activateFeedback = _this.activateFeedback,
          form = _this.form,
          wrongStep = _this.wrongStep,
          classes = _this.classes,
          _openAction = _this._openAction,
          stepper = _this.stepper,
          events = _this.events,
          destroyFeedback = _this.destroyFeedback,
          _validationFunctionCaller = _this._validationFunctionCaller;
      var showFeedbackPreloader = options.showFeedbackPreloader,
          validationFunction = options.validationFunction;

      var _getSteps2 = getSteps(),
          active = _getSteps2.active;

      var nextStep = getSteps().steps[active.index + 1]; // Gets the feedback function (if any) from the button

      var feedbackFunction = e && e.target ? e.target.dataset.feedback : null; // Checks if there's a validation function defined

      if (validationFunction && !_validationFunctionCaller()) {
        // There's a validation function and no feedback function
        // The validation function was already called in the if statement and it retuerned false, so returns the calling of the wrongStep method
        return wrongStep();
      } // Checks if there's a feedback function


      if (feedbackFunction && !skipFeedback) {
        // There's a feedback function and it wasn't requested to skip it
        // If showFeedbackPreloader is true (default=true), activates it
        if (showFeedbackPreloader && !active.step.dataset.nopreloader) activateFeedback(); // Calls the feedbackFunction

        window[feedbackFunction](destroyFeedback, form, active.step.querySelector(".".concat(classes.STEPCONTENT))); // Returns to prevent the nextStep method from being called

        return;
      } // Adds the class 'done' to the current step


      active.step.classList.add(classes.DONESTEP); // Opens the next one

      _openAction(nextStep, cb); // Dispatches the events


      stepper.dispatchEvent(events.STEPCHANGE);
      stepper.dispatchEvent(events.NEXTSTEP);
    });

    _defineProperty(this, "prevStep", function (cb, e) {
      if (e && e.preventDefault) e.preventDefault();
      var getSteps = _this.getSteps,
          _openAction = _this._openAction,
          stepper = _this.stepper,
          events = _this.events,
          destroyFeedback = _this.destroyFeedback;
      var activeStep = getSteps().active;
      var prevStep = getSteps().steps[activeStep.index + -1]; // Destroyes the feedback preloader, if any

      destroyFeedback(); // Opens the previous step

      _openAction(prevStep, cb); // Dispatches the events


      stepper.dispatchEvent(events.STEPCHANGE);
      stepper.dispatchEvent(events.PREVSTEP);
    });

    _defineProperty(this, "openStep", function (index, cb) {
      var getSteps = _this.getSteps,
          _openAction = _this._openAction,
          stepper = _this.stepper,
          events = _this.events,
          destroyFeedback = _this.destroyFeedback;
      var stepToOpen = getSteps().steps[index]; // Destroyes the feedback preloader, if any

      destroyFeedback(); // Opens the requested step

      _openAction(stepToOpen, cb); // Dispatches the events


      stepper.dispatchEvent(events.STEPCHANGE);
    });

    _defineProperty(this, "wrongStep", function () {
      var getSteps = _this.getSteps,
          classes = _this.classes,
          stepper = _this.stepper,
          events = _this.events; // Add the WRONGSTEP class to the step

      getSteps().active.step.classList.add(classes.WRONGSTEP); // Gets all the inputs from the active step

      var inputs = getSteps().active.step.querySelectorAll('input, select, textarea'); // Defines a function to be binded to any change in any input

      var removeWrongOnInput = function removeWrongOnInput() {
        // If there's a change, removes the WRONGSTEP class
        getSteps().active.step.classList.remove(classes.WRONGSTEP); // Unbinds the listener from the element

        MStepper.removeMultipleEventListeners(inputs, 'input', removeWrongOnInput);
      }; // Binds the removeWrongOnInput function to the inputs, listening to the event 'input'


      MStepper.addMultipleEventListeners(inputs, 'input', removeWrongOnInput); // Dispatches the event

      stepper.dispatchEvent(events.STEPERROR);
    });

    _defineProperty(this, "activateFeedback", function () {
      var getSteps = _this.getSteps,
          classes = _this.classes,
          options = _this.options,
          stepper = _this.stepper,
          events = _this.events;
      var activeStep = getSteps().active.step; // Adds the FEEDBACKINGSTEP class to the step

      activeStep.classList.add(classes.FEEDBACKINGSTEP); // Gets the step content div inside the step

      var content = activeStep.getElementsByClassName(classes.STEPCONTENT)[0]; // Inserts the predefined prealoder in the step content div

      content.insertAdjacentHTML('afterBegin', "<div class=\"".concat(classes.PRELOADERWRAPPER, "\">").concat(options.feedbackPreloader, "</div>")); // Dispatches the event

      stepper.dispatchEvent(events.FEEDBACKING);
    });

    _defineProperty(this, "destroyFeedback", function (triggerNextStep) {
      var getSteps = _this.getSteps,
          classes = _this.classes,
          nextStep = _this.nextStep,
          stepper = _this.stepper,
          events = _this.events;
      var activeStep = getSteps().active.step; // If there's no activeStep or preloader, returns

      if (!activeStep || !activeStep.classList.contains(classes.FEEDBACKINGSTEP)) return; // Removes the FEEDBACKINGSTEP class from the step

      activeStep.classList.remove(classes.FEEDBACKINGSTEP); // Gets the preloader div

      var fbDiv = activeStep.getElementsByClassName(classes.PRELOADERWRAPPER)[0]; // Removes the preloader div

      fbDiv.parentNode.removeChild(fbDiv); // Calls nextStep if requested (default=false)

      if (triggerNextStep) nextStep(undefined, true); // Dispatches the event

      stepper.dispatchEvent(events.FEEDBACKDESTROYED);
    });

    _defineProperty(this, "getSteps", function () {
      var stepper = _this.stepper,
          classes = _this.classes;
      var steps = stepper.querySelectorAll("li.".concat(classes.STEP));
      var activeStep = stepper.querySelector("li.".concat(classes.ACTIVESTEP));
      var activeStepIndex = Array.prototype.indexOf.call(steps, activeStep);
      return {
        steps: steps,
        active: {
          step: activeStep,
          index: activeStepIndex
        }
      };
    });

    _defineProperty(this, "activateStep", function (elements, index) {
      var getSteps = _this.getSteps,
          _slideDown = _this._slideDown,
          stepper = _this.stepper,
          _methodsBindingManager = _this._methodsBindingManager;
      var nodesIterator = MStepper.nodesIterator;
      var currentSteps = getSteps();
      var nextStep = currentSteps.steps[index]; // Stores a let variable to return the right element after the activation

      var returnableElement = null; // Starts the checking of the elements parameter

      if (typeof elements === 'string') {
        // The element is in string format
        // Insert it with the insertAdjacentHTML function
        nextStep.insertAdjacentHTML('beforeBegin', elements); // Defines the inserted element as the returnableElement

        returnableElement = nextStep.previousSibling; // Activates (slideDown) the step

        _slideDown(returnableElement);
      } else if (Array.isArray(elements)) {
        // The element is in array format, probably an array of strings
        // Sets the returnableElement to be an empty array
        returnableElement = []; // Loops through the array

        elements.forEach(function (element) {
          // Inserts each element with the insertAdjacentHTML function
          nextStep.insertAdjacentHTML('beforeBegin', element); // Adds each element to the returnableElement array

          returnableElement.push(nextStep.previousSibling); // Activates (slideDown) each element

          _slideDown(nextStep.previousSibling);
        });
      } else if (elements instanceof Element || elements instanceof HTMLCollection || elements instanceof NodeList) {
        // The element is an HTMLElement or an HTMLCollection
        // Insert it/them with the insertBefore function and sets the returnableElement
        returnableElement = stepper.insertBefore(elements, nextStep); // If it's and HTMLElement, activates (slideDown) it, if it's an HTMLCollection, activates (slideDown) each of them

        if (elements instanceof Element) _slideDown(returnableElement);else nodesIterator(returnableElement, function (appendedElement) {
          return _slideDown(appendedElement);
        });
      } // Do the bidings to the new step(s)


      if (returnableElement) _methodsBindingManager(returnableElement); // Returns the added/activated elements

      return returnableElement;
    });

    _defineProperty(this, "deactivateStep", function (elements) {
      var _slideUp = _this._slideUp,
          stepper = _this.stepper,
          _methodsBindingManager = _this._methodsBindingManager;
      var nodesIterator = MStepper.nodesIterator; // Sets a function to group the orders to deactivate and remove the steps

      var doIt = function doIt(element) {
        // Checks if the step really exists in the stepper
        if (stepper.contains(elements)) {
          // Yeah, it does exist
          // Unbinds the listeners previously binded to the step
          _methodsBindingManager(element, true); // Slides up and removes afterwards


          _slideUp(element, undefined, undefined, function () {
            return stepper.removeChild(element);
          });
        }
      }; // Checks if the elements is an HTMLElement or an HTMLCollection and calls the function doIt in the right way


      if (elements instanceof Element) doIt(elements);else if (elements instanceof HTMLCollection || elements instanceof NodeList) nodesIterator(elements, function (element) {
        return doIt(element);
      }); // Returns the step(s), in case you want to activate it/them again.

      return elements;
    });

    _defineProperty(this, "_slideDown", function (element, className) {
      var classElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : element;
      var cb = arguments.length > 3 ? arguments[3] : undefined;
      // Gets the height of the element when it's already visible
      var height = "".concat(MStepper.getUnknownHeight(element), "px"); // Defines a function to be called after the transition's end

      var endSlideDown = function endSlideDown(e) {
        // If the transition is not 'height', returns
        if (e.propertyName !== 'height') return; // Unbinds the listener from the element

        _this._smartListenerUnbind(element, 'transitionend', endSlideDown); // Removes properties needed for the transition to occur


        MStepper.removeMultipleProperties(element, 'visibility overflow height display'); // Calls the callback() if any

        if (cb) cb();
      }; // Calls an animation frame to avoid async weird stuff


      requestAnimationFrame(function () {
        // Prepare the element for animation
        element.style.overflow = 'hidden';
        element.style.paddingBottom = '0';
        element.style.height = '0';
        element.style.visibility = 'unset';
        element.style.display = 'block'; // Calls another animation frame to wait for the previous changes to take effect

        requestAnimationFrame(function () {
          // Binds the "conclusion" function to the event 'transitionend'
          _this._smartListenerBind(element, 'transitionend', endSlideDown); // Sets the final height to the element to trigger the transition


          element.style.height = height; // Removes the 'padding-bottom: 0' setted previously to trigger it too

          element.style.removeProperty('padding-bottom'); // If a className for the slided element is required, add it

          if (className) classElement.classList.add(className);
        });
      }); // Returns the original element to enable chain functions

      return element;
    });

    _defineProperty(this, "_slideUp", function (element, className) {
      var classElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : element;
      var cb = arguments.length > 3 ? arguments[3] : undefined;
      // Gets the element's height
      var height = "".concat(element.offsetHeight, "px"); // Defines a function to be called after the transition's end

      var endSlideUp = function endSlideUp(e) {
        // If the transition is not 'height', returns
        if (e.propertyName !== 'height') return; // Unbinds the listener from the element

        _this._smartListenerUnbind(element, 'transitionend', endSlideUp); // Sets display none for the slided element


        element.style.display = 'none'; // Removes properties needed for the transition to occur

        MStepper.removeMultipleProperties(element, 'visibility overflow height padding-bottom'); // Calls the callback() if any

        if (cb) cb();
      }; // Calls an animation frame to avoid async weird stuff


      requestAnimationFrame(function () {
        // Prepare the element for animation
        element.style.overflow = 'hidden';
        element.style.visibility = 'unset';
        element.style.display = 'block';
        element.style.height = height; // Calls another animation frame to wait for the previous changes to take effect

        requestAnimationFrame(function () {
          // Binds the "conclusion" function to the event 'transitionend'
          _this._smartListenerBind(element, 'transitionend', endSlideUp); // Sets the height to 0 the element to trigger the transition


          element.style.height = '0'; // Sets the 'padding-bottom: 0' to transition the padding

          element.style.paddingBottom = '0'; // If a removal of a className for the slided element is required, remove it

          if (className) classElement.classList.remove(className);
        });
      }); // Returns the original element to enable chain functions

      return element;
    });

    _defineProperty(this, "_formWrapperManager", function () {
      var stepper = _this.stepper,
          options = _this.options; // Checks if there's a form wrapping the stepper and gets it

      var form = stepper.closest('form'); // Checks if the form doesn't exist and the autoFormCreation option is true (default=true)

      if (!form && options.autoFormCreation) {
        // The form doesn't exist and the autoFormCreation is true
        // Gathers the form settings from the dataset of the stepper
        var dataAttrs = stepper.dataset || {};
        var method = dataAttrs.method || 'GET';
        var action = dataAttrs.action || '?'; // Creates a form element

        var wrapper = document.createElement('form'); // Defines the form's settings

        wrapper.method = method;
        wrapper.action = action; // Wraps the stepper with it

        stepper.parentNode.insertBefore(wrapper, stepper);
        wrapper.appendChild(stepper); // Returns the wrapper (the form)

        return wrapper;
      } else if (form.length) {
        // The form exists
        // Returns the form
        return form;
      } else {
        // The form doesn't exist autoFormCreation is false
        // Returns null
        return null;
      }
    });

    _defineProperty(this, "_validationFunctionCaller", function () {
      var options = _this.options,
          getSteps = _this.getSteps,
          form = _this.form,
          classes = _this.classes;
      return options.validationFunction(form, getSteps().active.step.querySelector(".".concat(classes.STEPCONTENT)));
    });

    _defineProperty(this, "_smartListenerBind", function (el, event, fn) {
      var similar = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var callFn = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var listenerStore = _this.listenerStore; // Builds an object with the element, event and function.

      var newListener = {
        el: el,
        event: event,
        fn: fn
      }; // Checks if similar listeners will be unbinded before the binding

      if (similar) {
        // Loops through the store searching for functions binded to the same element listening for the same event
        for (var i = 0; i < listenerStore.length; i++) {
          var listener = listenerStore[i]; // Unbind if found

          if (listener.event === event && listener.el.isSameNode(el)) listener.el.removeEventListener(listener.event, listener.fn); // Calls the binded function if requested

          if (callFn) listener.fn();
        }
      } else {
        // If similar listeners won't be unbinded, unbind duplicates
        var existentOneIndex = listenerStore.indexOf(newListener);

        if (existentOne !== -1) {
          var existentOne = listenerStore[existentOneIndex];
          existentOne.el.removeEventListener(existentOne.event, existentOne.fn);
          if (callFn) existentOne[existentOneIndex].fn();
        }
      } // Finally, binds the listener


      el.addEventListener(event, fn);
      listenerStore.push(newListener);
    });

    _defineProperty(this, "_smartListenerUnbind", function (el, event, fn) {
      var listenerStore = _this.listenerStore; // Gets the index of the listener in the stepper listenerStore

      var existentOneIndex = listenerStore.indexOf({
        el: el,
        event: event,
        fn: fn
      }); // Remove the even listener from the element

      el.removeEventListener(event, fn); // Remove the listener reference in the listenerStore

      listenerStore.splice(existentOneIndex, 1);
    });

    this.stepper = elem;
    this.options = {
      firstActive: _options.firstActive || 0,
      linearStepsNavigation: _options.linearStepsNavigation || true,
      autoFocusInput: _options.autoFocusInput || true,
      showFeedbackPreloader: _options.showFeedbackPreloader || true,
      autoFormCreation: _options.autoFormCreation || true,
      validationFunction: _options.validationFunction || null,
      feedbackPreloader: _options.feedbackPreloader || '<div class="preloader-wrapper active"> <div class="spinner-layer spinner-blue-only"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div></div>'
    };
    this.classes = {
      HORIZONTALSTEPPER: 'horizontal',
      LINEAR: 'linear',
      NEXTSTEPBTN: 'next-step',
      PREVSTEPBTN: 'previous-step',
      STEPTITLE: 'step-title',
      STEP: 'step',
      STEPCONTENT: 'step-content',
      PRELOADERWRAPPER: 'wait-feedback',
      FEEDBACKINGSTEP: 'feedbacking',
      ACTIVESTEP: 'active',
      WRONGSTEP: 'wrong',
      DONESTEP: 'done'
    };
    this.events = {
      STEPCHANGE: new Event('stepchange'),
      NEXTSTEP: new Event('nextstep'),
      PREVSTEP: new Event('prevstep'),
      STEPERROR: new Event('steperror'),
      FEEDBACKING: new Event('feedbacking'),
      FEEDBACKDESTROYED: new Event('feedbackdestroyed')
    }; // Creates an empty array to power the methods _smartListenerBind/Unbind

    this.listenerStore = []; // Creates an empty variable to store the form (or not) afterwards

    this.form = null; // Calls the initialization method

    this._init();
  }
  /**
   * Init private method. Will be called on the creating of a new instance of MStepper.
   * @returns {void}
   */


  _createClass(MStepper, null, [{
    key: "addMultipleEventListeners",

    /**
     * Util function to simplify the binding of functions to nodelists.
     * @param {(HTMLCollection|NodeList|HTMLElement)} elements - Elements to bind a listener to.
     * @param {string} event - Event name, like 'click'.
     * @param {function} fn - Function to bind to elements.
     * @returns {void}
     */
    value: function addMultipleEventListeners(elements, event, fn) {
      var passive = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      if (elements instanceof Element) return elements.addEventListener(event, fn, passive);

      for (var i = 0, len = elements.length; i < len; i++) {
        elements[i].addEventListener(event, fn, passive);
      }
    }
    /**
     * Util function to simplify the unbinding of functions to nodelists.
     * @param {(HTMLCollection|NodeList|HTMLElement)} elements - Elements from which the listeners will be unbind.
     * @param {string} event - Event name, like 'click'.
     * @param {function} fn - Function to unbind from elements.
     * @returns {void}
     */

  }, {
    key: "removeMultipleEventListeners",
    value: function removeMultipleEventListeners(elements, event, fn) {
      var passive = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      if (elements instanceof Element) return elements.removeEventListener(event, fn, passive);

      for (var i = 0, len = elements.length; i < len; i++) {
        elements[i].removeEventListener(event, fn, passive);
      }
    }
    /**
     * An util function to simplify the removal of multiple properties.
     * @param {HTMLElement} el - Element target from which the properties will me removed.
     * @param {string} properties - Properties to be removed, separated by spaces, like 'height margin padding-top'.
     */

  }, {
    key: "removeMultipleProperties",
    value: function removeMultipleProperties(el, properties) {
      var propArray = properties.split(' ');

      for (var i = 0; i < propArray.length; i++) {
        el.style.removeProperty(propArray[i]);
      }
    }
    /**
     * Util function to itarate through HTMLCollections and NodeList using the same command.
     * @param {(HTMLCollection | NodeList)} nodes - List of elements to loop through.
     * @param {function} fn - Function to call for each element inside the nodes list.
     * @returns {(HTMLCollection | NodeList)} - The original nodes to enable chain functions
     */

  }, {
    key: "nodesIterator",
    value: function nodesIterator(nodes, fn) {
      for (var i = 0; i < nodes.length; i++) {
        fn(nodes[i]);
      }

      return nodes;
    }
    /**
     * Util function to find the height of a hidden DOM object.
     * @param {HTMLElement} el - Hidden HTML element (node).
     * @returns {number} - The height without "px".
     */

  }, {
    key: "getUnknownHeight",
    value: function getUnknownHeight(el) {
      // Clones the element to insert it invisible
      var clone = el.cloneNode(true); // Defines some styles for it to be 100% invisible and unnoticeable

      clone.style.position = 'fixed';
      clone.style.display = 'block';
      clone.style.top = '-999999px';
      clone.style.left = '-999999px';
      clone.style.height = 'auto';
      clone.style.opacity = '0';
      clone.style.zIndex = '-999999';
      clone.style.pointerEvents = 'none'; // Rename the radio buttons in the cloned node as only 1 radio button is allowed to be selected with the same name in the DOM.

      var radios = clone.querySelectorAll('[type="radio"]');
      radios.forEach(function (radio) {
        radio.name = "__" + radio.name + "__";
      }); // Inserts it before the hidden element

      var insertedElement = el.parentNode.insertBefore(clone, el); // Gets it's height

      var height = insertedElement.offsetHeight; // Removes it

      el.parentNode.removeChild(insertedElement); // Returns the height (without 'px')

      return height;
    }
    /**
     * Util bindable tabbing disabler.
     * @returns {void}
     */

  }, {
    key: "tabbingDisabler",
    value: function tabbingDisabler(e) {
      if (e.keyCode === 9) e.preventDefault();
    }
  }]);

  return MStepper;
}();

if (window.Element && !Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
        i,
        el = this;

    do {
      i = matches.length;

      while (--i >= 0 && matches.item(i) !== el) {}

      ;
    } while (i < 0 && (el = el.parentElement));

    return el;
  };
}