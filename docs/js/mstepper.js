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
    key: "addEventListenerByClass",

    /**
     * Util function to simplify the binding of functions to nodelists
     * @param {HTMLElement} el - Element to search in
     * @param {string} className - Class to search
     * @param {string} event - Event name, like 'click'
     * @param {function} fn Function to bind to elements found
     * @returns {void}
     */
    value: function addEventListenerByClass(el, className, event, fn) {
      var list = el.getElementsByClassName(className);

      for (var i = 0, len = list.length; i < len; i++) {
        list[i].addEventListener(event, fn, false);
      }
    }
    /**
     * An util function to simplify the removal of multiple properties
     * @param {HTMLElement} el - Element target from wich the properties will me removed
     * @param {string} properties - Properties to be removed, separated by spaces, like 'height margin padding-top'
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
     * @param {HTMLElement} el - Hidden HTML element (node)
     * @returns {number} - The height without "px"
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
      var insertedElement = el.parentNode.appendChild(clone);
      var height = insertedElement.offsetHeight;
      el.parentNode.removeChild(insertedElement);
      return height;
    }
    /**
     * Class constructor for Materialize Stepper.
     * @constructor
     * @param {HTMLElement} elem - Element in which stepper will be initialized.
     * @param {object} [options] - Stepper options
     * @param {number} [options.firstActive=0] - Default active step
     * @param {boolean} [options.linearStepsNavigation=true] - Allow navigation by clicking on the next and previous steps on linear steppers
     * @param {boolean} [options.autoFocusInput=true] - Auto focus on first input of each step
     * @param {boolean} [options.showFeedbackLoader=true] - Set if a loading screen will appear while feedbacks functions are running
     * @param {boolean} [options.autoFormCreation=true] - Auto generation of a form around the stepper
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

    _defineProperty(this, "openAction", function (step) {
      step.classList.remove('done');
      var content = step.getElementsByClassName('step-content')[0];
      var height = "".concat(MStepper.getUnknownHeight(content), "px");

      var endSlideDown = function endSlideDown(e) {
        if (e.propertyName !== 'height') return;

        _this.smartListenerUnbind(content, 'transitionend', endSlideDown);

        MStepper.removeMultipleProperties(content, 'visibility overflow height display');
      };

      requestAnimationFrame(function () {
        // Prepare the element for animation
        content.style.overflow = 'hidden';
        content.style.visibility = 'unset';
        content.style.display = 'block';
        requestAnimationFrame(function () {
          _this.smartListenerBind(content, 'transitionend', endSlideDown, true);

          content.style.height = height;
          step.classList.add('active');
        });
      });
      return step;
    });

    _defineProperty(this, "closeAction", function (step) {
      var content = step.getElementsByClassName('step-content')[0];
      var height = "".concat(content.offsetHeight, "px");

      var endSlideUp = function endSlideUp(e) {
        if (e.propertyName !== 'height') return;

        _this.smartListenerUnbind(content, 'transitionend', endSlideUp);

        MStepper.removeMultipleProperties(content, 'visibility overflow height display');
      };

      requestAnimationFrame(function () {
        // Prepare the element for animation
        content.style.overflow = 'hidden';
        content.style.visibility = 'unset';
        content.style.display = 'block';
        content.style.height = height;
        requestAnimationFrame(function () {
          _this.smartListenerBind(content, 'transitionend', endSlideUp, true);

          content.style.height = '0';
          step.classList.remove('active');
        });
      });
      return step;
    });

    _defineProperty(this, "activateStepper", function () {
      var wrapWithForm = _this.wrapWithForm,
          getSteps = _this.getSteps,
          options = _this.options,
          stepper = _this.stepper,
          classes = _this.classes,
          nextStep = _this.nextStep,
          prevStep = _this.prevStep,
          openAction = _this.openAction;
      var addEventListenerByClass = MStepper.addEventListenerByClass;
      wrapWithForm();
      openAction(getSteps().steps[options.firstActive]);
      addEventListenerByClass(stepper, classes.NEXT, 'click', nextStep);
      addEventListenerByClass(stepper, classes.PREV, 'click', prevStep);
    });

    _defineProperty(this, "nextStep", function () {
      var getSteps = _this.getSteps();

      var activeStep = getSteps.active;

      _this.closeAction(activeStep.step);

      _this.openAction(getSteps.steps[activeStep.index + 1]);
    });

    _defineProperty(this, "prevStep", function () {
      var activeStep = _this.getSteps().active;

      _this.closeAction(activeStep.step);

      _this.openAction(_this.getSteps().steps[activeStep.index + -1]);
    });

    _defineProperty(this, "getSteps", function () {
      var steps = _this.stepper.querySelectorAll('li');

      var active, activeIndex;

      for (var i = 0; i < steps.length; i++) {
        if (steps[i].classList.contains('active')) {
          active = steps[i];
          activeIndex = i;
        }
      }

      return {
        steps: steps,
        active: {
          step: active,
          index: activeIndex
        }
      };
    });

    _defineProperty(this, "wrapWithForm", function () {
      var stpr = _this.stepper;

      if (!parentsUntil(stpr, 'form').length && _this.options.autoFormCreation) {
        var dataAttrs = stpr.dataset || {};
        var method = dataAttrs || 'GET';
        var action = dataAttrs || '?';
        var wrapper = document.createElement('form');
        wrapper.method = method;
        wrapper.action = action; // stpr.parentNode.insertBefore(wrapper, stpr);
      }
    });

    this.stepper = elem;
    this.options = {
      firstActive: _options.firstActive || 0,
      linearStepsNavigation: _options.linearStepsNavigation || true,
      autoFocusInput: _options.autoFocusInput || true,
      showFeedbackLoader: _options.showFeedbackLoader || true,
      autoFormCreation: _options.autoFormCreation || true
    };
    this.classes = {
      NEXT: 'next-step',
      PREV: 'previous-step',
      ACTIVE: 'active',
      DONE: 'done',
      FB: 'feedbacking'
    };
    this.events = {
      STPCHG: 'stepChange',
      NEXT: 'nextStep',
      PREV: 'prevStep',
      STEP: function STEP(step) {
        return "step".concat(step);
      }
    };
    this.listenerStore = [];
    this.activateStepper();
  }
  /**
   * An util method to manage binded eventListeners and avoid duplicates. This is the opposite of "smartListenerBind".
   * @param {HTMLElement} el - Target element in wich the listener will be unbinded
   * @param {string} listener - Event to unlisten like 'click'
   * @param {function} fn - Function to be unbinded
   */


  return MStepper;
}();
/**
 * Traverse parents until find the one (like jQuery's parents)
 * @param {HTMLElement} el - Base element to start the search
 * @param {string} selector - Selector to filter
 * @param {string} filter - Filter
 * @returns {HTMLElement}
 */


function parentsUntil(el, selector, filter) {
  var result = [];
  var matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
  el = el.parentElement;

  while (el && !matchesSelector.call(el, selector)) {
    if (!filter) {
      result.push(el);
    } else {
      if (matchesSelector.call(el, filter)) {
        result.push(el);
      }
    }

    el = el.parentElement;
  }

  return result;
}