/**
 * Materialize Stepper - A little plugin that implements a stepper to Materializecss framework.
 * @version v3.0.0
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

var MStepper =
/*#__PURE__*/
function () {
  _createClass(MStepper, null, [{
    key: "addMultipleEventListeners",

    /* exported MStepper */

    /**
     * Util function to simplify the binding of functions to nodelists.
     * @param {HTMLElement} elements - Elements to bind a listener to.
     * @param {string} event - Event name, like 'click'.
     * @param {function} fn - Function to bind to elements.
     * @returns {void}
     */
    value: function addMultipleEventListeners(elements, event, fn) {
      var passive = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      for (var i = 0, len = elements.length; i < len; i++) {
        elements[i].addEventListener(event, fn, passive);
      }
    }
    /**
     * Util function to simplify the unbinding of functions to nodelists.
     * @param {HTMLElement} elements - Elements from which the listeners will be unbind.
     * @param {string} event - Event name, like 'click'.
     * @param {function} fn - Function to unbind from elements.
     * @returns {void}
     */

  }, {
    key: "removeMultipleEventListeners",
    value: function removeMultipleEventListeners(elements, event, fn) {
      var passive = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      for (var i = 0, len = elements.length; i < len; i++) {
        elements[i].removeEventListener(event, fn, passive);
      }
    }
  }, {
    key: "parents",
    value: function parents(elem, selector) {
      var elements = [];
      var ishaveselector = selector !== undefined;

      while ((elem = elem.parentElement) !== null) {
        if (elem.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }

        if (!ishaveselector || elem.matches(selector)) {
          elements.push(elem);
        }
      }

      return elements[0] || false;
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
     * Util function to find the height of a hidden DOM object.
     * @param {HTMLElement} el - Hidden HTML element (node).
     * @returns {number} - The height without "px".
     */

  }, {
    key: "getUnknownHeight",
    value: function getUnknownHeight(el) {
      var clone = el.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.display = 'block';
      clone.style.top = '-999999px';
      clone.style.left = '-999999px';
      clone.style.height = 'auto';
      clone.style.opacity = '0';
      clone.style.zIndex = '-999999';
      clone.style.pointerEvents = 'none';
      var insertedElement = el.parentNode.insertBefore(clone, el);
      var height = insertedElement.offsetHeight;
      el.parentNode.removeChild(insertedElement);
      return height;
    }
    /**
     * Class constructor for Materialize Stepper.
     * @constructor
     * @param {HTMLElement} elem - Element in which stepper will be initialized.
     * @param {object} [options] - Stepper options.
     * @param {number} [options.firstActive=0] - Default active step.
     * @param {boolean} [options.linearStepsNavigation=true] - Allow navigation by clicking on the next and previous steps on linear steppers.
     * @param {boolean} [options.autoFocusInput=true] - Auto focus on first input of each step.
     * @param {boolean} [options.showFeedbackPreloader=true] - Set if a loading screen will appear while feedbacks functions are running.
     * @param {boolean} [options.autoFormCreation=true] - Auto generation of a form around the stepper.
     * @param {function} [options.validationFunction=null] - Function to be called everytime a nextstep occurs. It receives 2 arguments, in this sequece: stepperForm, activeStep.
     * @param {string} [options.feedbackPreloader] - Preloader used when step is waiting for feedback function. If not defined, Materializecss spinner-blue-only will be used.
     */

  }]);

  function MStepper(elem) {
    var _this = this;

    var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, MStepper);

    _defineProperty(this, "smartListenerUnbind", function (el, event, fn) {
      var listenerStore = _this.listenerStore;
      var existentOneIndex = listenerStore.indexOf({
        el: el,
        event: event,
        fn: fn
      });
      el.removeEventListener(event, fn);
      listenerStore.splice(existentOneIndex, 1);
    });

    _defineProperty(this, "smartListenerBind", function (el, event, fn) {
      var similar = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var callFn = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var listenerStore = _this.listenerStore; // Builds an object with the element, event and function.

      var newListener = {
        el: el,
        event: event,
        fn: fn
      }; // Checks if similar listeners will be unbinded before the binding

      if (similar) {
        // Loops through the store searching for listeners binded to the same element listening for the same event
        for (var i = 0; i < listenerStore.length; i++) {
          var listener = listenerStore[i]; // Unbind if found

          if (listener.event === event && listener.el.isSameNode(el)) listener.el.removeEventListener(listener.event, listener.fn); // Call the binded function if requested

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
      } // Finally, bind the listener


      el.addEventListener(event, fn);
      listenerStore.push(newListener);
    });

    _defineProperty(this, "_slideDown", function (element, className) {
      var classElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : element;
      var cb = arguments.length > 3 ? arguments[3] : undefined;
      var height = "".concat(MStepper.getUnknownHeight(element), "px");

      var endSlideDown = function endSlideDown(e) {
        if (e.propertyName !== 'height') return;

        _this.smartListenerUnbind(element, 'transitionend', endSlideDown);

        MStepper.removeMultipleProperties(element, 'visibility overflow height display');
        if (cb) cb();
      };

      requestAnimationFrame(function () {
        // Prepare the element for animation
        element.style.overflow = 'hidden';
        element.style.paddingBottom = '0';
        element.style.height = '0';
        element.style.visibility = 'unset';
        element.style.display = 'block';
        requestAnimationFrame(function () {
          _this.smartListenerBind(element, 'transitionend', endSlideDown, true);

          element.style.height = height;
          element.style.removeProperty('padding-bottom');
          if (className) classElement.classList.add(className);
        });
      });
      return element;
    });

    _defineProperty(this, "_slideUp", function (element, className) {
      var classElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : element;
      var cb = arguments.length > 3 ? arguments[3] : undefined;
      var height = "".concat(element.offsetHeight, "px");

      var endSlideUp = function endSlideUp(e) {
        if (e.propertyName !== 'height') return;

        _this.smartListenerUnbind(element, 'transitionend', endSlideUp);

        element.style.display = 'none';
        MStepper.removeMultipleProperties(element, 'visibility overflow height padding-bottom');
        if (cb) cb();
      };

      requestAnimationFrame(function () {
        // Prepare the element for animation
        element.style.overflow = 'hidden';
        element.style.visibility = 'unset';
        element.style.display = 'block';
        element.style.height = height;
        requestAnimationFrame(function () {
          _this.smartListenerBind(element, 'transitionend', endSlideUp, true);

          element.style.height = '0';
          element.style.paddingBottom = '0';
          if (className) classElement.classList.remove(className);
        });
      });
      return element;
    });

    _defineProperty(this, "_closeAction", function (step) {
      var _slideUp = _this._slideUp,
          classes = _this.classes,
          stepper = _this.stepper;
      var stepContent = step.getElementsByClassName(classes.STEPCONTENT)[0];

      if (window.innerWidth < 993 || !stepper.classList.contains(classes.HORIZONTALSTEPPER)) {
        _slideUp(stepContent, classes.ACTIVESTEP, step);
      } else {
        step.classList.remove('active');
      }

      return step;
    });

    _defineProperty(this, "_openAction", function (step) {
      var closeActiveStep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var _slideDown = _this._slideDown,
          classes = _this.classes,
          getSteps = _this.getSteps,
          _closeAction = _this._closeAction,
          stepper = _this.stepper;
      var activeStep = getSteps().active.step;
      if (activeStep && activeStep.isSameNode(step)) return step;
      var stepContent = step.getElementsByClassName(classes.STEPCONTENT)[0];
      step.classList.remove(classes.DONESTEP);

      if (window.innerWidth < 993 || !stepper.classList.contains(classes.HORIZONTALSTEPPER)) {
        if (activeStep && closeActiveStep) _closeAction(activeStep);

        _slideDown(stepContent, classes.ACTIVESTEP, step);
      } else {
        step.classList.add('active');
        if (activeStep && closeActiveStep) _closeAction(activeStep);
      }

      return step;
    });

    _defineProperty(this, "_init", function () {
      var _formWrapperManager = _this._formWrapperManager,
          getSteps = _this.getSteps,
          options = _this.options,
          stepper = _this.stepper,
          classes = _this.classes,
          nextStep = _this.nextStep,
          prevStep = _this.prevStep,
          _stepTitleClickHandler = _this._stepTitleClickHandler,
          _openAction = _this._openAction;
      var addMultipleEventListeners = MStepper.addMultipleEventListeners;
      _this.form = _formWrapperManager();

      _openAction(getSteps().steps[options.firstActive]);

      var nextBtns = stepper.getElementsByClassName(classes.NEXTSTEPBTN);
      var prevBtns = stepper.getElementsByClassName(classes.PREVSTEPBTN);
      var stepsTitles = stepper.getElementsByClassName(classes.STEPTITLE);
      addMultipleEventListeners(nextBtns, 'click', nextStep, false);
      addMultipleEventListeners(prevBtns, 'click', prevStep, false);
      addMultipleEventListeners(stepsTitles, 'click', _stepTitleClickHandler);
    });

    _defineProperty(this, "nextStep", function (e, skipFeedback) {
      if (e && e.preventDefault) e.preventDefault();
      var options = _this.options,
          getSteps = _this.getSteps,
          activateFeedback = _this.activateFeedback,
          form = _this.form,
          wrongStep = _this.wrongStep,
          classes = _this.classes,
          _openAction = _this._openAction,
          stepper = _this.stepper,
          events = _this.events;
      var showFeedbackPreloader = options.showFeedbackPreloader,
          validationFunction = options.validationFunction;

      var _getSteps = getSteps(),
          active = _getSteps.active;

      var nextStep = getSteps().steps[active.index + 1]; // const nextStepInputs = nextStep.querySelector('input, select');

      var feedbackFunction = e && e.target ? e.target.dataset.feedback : null;

      if (feedbackFunction && !skipFeedback) {
        if (showFeedbackPreloader && !active.step.dataset.nopreloader) activateFeedback();
        window[feedbackFunction](form, active.step);
        return;
      } else if (validationFunction && !validationFunction(form, active.step)) {
        return wrongStep();
      }

      active.step.classList.add(classes.DONESTEP);

      _openAction(nextStep); // if (options.autoFocusInput && nextStepInputs) nextStepInputs.focus();


      stepper.dispatchEvent(events.STEPCHANGE);
      stepper.dispatchEvent(events.NEXTSTEP);
    });

    _defineProperty(this, "prevStep", function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var getSteps = _this.getSteps,
          classes = _this.classes,
          _openAction = _this._openAction,
          stepper = _this.stepper,
          events = _this.events;
      var activeStep = getSteps().active;
      var prevStep = getSteps().steps[activeStep.index + -1];

      _openAction(prevStep);

      stepper.dispatchEvent(events.STEPCHANGE);
      stepper.dispatchEvent(events.PREVSTEP);
    });

    _defineProperty(this, "_stepTitleClickHandler", function (e) {
      var getSteps = _this.getSteps,
          classes = _this.classes,
          nextStep = _this.nextStep,
          prevStep = _this.prevStep,
          stepper = _this.stepper,
          _openAction = _this._openAction;

      var _getSteps2 = getSteps(),
          steps = _getSteps2.steps,
          active = _getSteps2.active;

      var clickedStep = MStepper.parents(e.target, ".".concat(classes.STEP));

      if (stepper.classList.contains(classes.LINEAR)) {
        var clickedStepIndex = Array.prototype.indexOf.call(steps, clickedStep);
        if (clickedStepIndex == active.index + 1) nextStep();else if (clickedStepIndex == active.index - 1) prevStep();
      } else {
        _openAction(clickedStep);
      }
    });

    _defineProperty(this, "activateFeedback", function () {
      var getSteps = _this.getSteps,
          classes = _this.classes,
          options = _this.options,
          stepper = _this.stepper,
          events = _this.events;
      var activeStep = getSteps().active.step;
      activeStep.classList.add(classes.FEEDBACKINGSTEP);
      var content = activeStep.getElementsByClassName(classes.STEPCONTENT)[0];
      content.insertAdjacentHTML('afterBegin', "<div class=\"".concat(classes.PRELOADERWRAPPER, "\">").concat(options.feedbackPreloader, "</div>"));
      stepper.dispatchEvent(events.FEEDBACKING);
    });

    _defineProperty(this, "destroyFeedback", function (triggerNextStep) {
      var getSteps = _this.getSteps,
          classes = _this.classes,
          nextStep = _this.nextStep,
          stepper = _this.stepper,
          events = _this.events;
      var activeStep = getSteps().active.step;
      activeStep.classList.remove(classes.FEEDBACKINGSTEP);
      var fbDiv = activeStep.getElementsByClassName(classes.PRELOADERWRAPPER)[0];
      fbDiv.parentNode.removeChild(fbDiv);
      if (triggerNextStep) nextStep(undefined, true);
      stepper.dispatchEvent(events.FEEDBACKDESTROYED);
    });

    _defineProperty(this, "wrongStep", function () {
      var getSteps = _this.getSteps,
          classes = _this.classes,
          stepper = _this.stepper,
          events = _this.events;
      getSteps().active.step.classList.add(classes.WRONGSTEP);
      var inputs = getSteps().active.step.querySelectorAll('input, select');

      var removeWrongOnInput = function removeWrongOnInput() {
        getSteps().active.step.classList.remove(classes.WRONGSTEP);
        MStepper.removeMultipleEventListeners(inputs, 'input', removeWrongOnInput);
      };

      MStepper.addMultipleEventListeners(inputs, 'input', removeWrongOnInput);
      stepper.dispatchEvent(events.STEPERROR);
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
          stepper = _this.stepper;
      var currentSteps = getSteps();
      var nextStep = currentSteps.steps[index];
      var returnElement = null;

      if (typeof elements === 'string') {
        nextStep.insertAdjacentHTML('beforeBegin', elements);
        returnElement = nextStep.previousSibling;

        _slideDown(returnElement);
      } else if (Array.isArray(elements)) {
        returnElement = [];
        elements.forEach(function (element) {
          nextStep.insertAdjacentHTML('beforeBegin', element);
          returnElement.push(nextStep.previousSibling);

          _slideDown(nextStep.previousSibling);
        });
      } else if (elements instanceof Element || elements instanceof HTMLCollection) {
        returnElement = stepper.insertBefore(elements, nextStep);
        if (elements instanceof Element) _slideDown(returnElement);else returnElement.forEach(function (appendedElement) {
          return _slideDown(appendedElement);
        });
      }

      return returnElement;
    });

    _defineProperty(this, "deactivateStep", function (elements) {
      var _slideUp = _this._slideUp,
          stepper = _this.stepper;

      var doIt = function doIt(element) {
        if (stepper.contains(elements)) _slideUp(element, undefined, undefined, function () {
          return stepper.removeChild(element);
        });
      };

      if (elements instanceof Element) doIt(elements);else if (elements instanceof HTMLCollection) elements.forEach(function (element) {
        return doIt(element);
      });
      return elements;
    });

    _defineProperty(this, "_formWrapperManager", function () {
      var stepper = _this.stepper,
          options = _this.options;
      var form = MStepper.parents(stepper, 'form');

      if (!form.length && options.autoFormCreation) {
        var dataAttrs = stepper.dataset || {};
        var method = dataAttrs.method || 'GET';
        var action = dataAttrs.action || '?';
        var wrapper = document.createElement('form');
        wrapper.method = method;
        wrapper.action = action;
        stepper.parentNode.insertBefore(wrapper, stepper);
        wrapper.appendChild(stepper);
        return wrapper;
      } else if (form.length) {
        return form;
      } else {
        return null;
      }
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
    };
    this.listenerStore = [];
    this.form = null;

    this._init();
  }
  /**
   * An util method to manage binded eventListeners and avoid duplicates. This is the opposite of "smartListenerBind".
   * @param {HTMLElement} el - Target element in which the listener will be unbinded.
   * @param {string} listener - Event to unlisten like 'click'.
   * @param {function} fn - Function to be unbinded.
   */


  return MStepper;
}();