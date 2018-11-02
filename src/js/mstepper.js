class MStepper {
   /* exported MStepper */
   /**
    * Util function to simplify the binding of functions to nodelists.
    * @param {HTMLElement} elements - Elements to bind a listener to.
    * @param {string} event - Event name, like 'click'.
    * @param {function} fn - Function to bind to elements.
    * @returns {void}
    */
   static addMultipleEventListeners(elements, event, fn, passive = false) {
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
   static removeMultipleEventListeners(elements, event, fn, passive = false) {
      for (var i = 0, len = elements.length; i < len; i++) {
         elements[i].removeEventListener(event, fn, passive);
      }
   }

   static parents(elem, selector) {
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
   static removeMultipleProperties(el, properties) {
      var propArray = properties.split(' ');
      for (let i = 0; i < propArray.length; i++) {
         el.style.removeProperty(propArray[i]);
      }
   }

   /**
    * Util function to find the height of a hidden DOM object.
    * @param {HTMLElement} el - Hidden HTML element (node).
    * @returns {number} - The height without "px".
    */
   static getUnknownHeight(el) {
      const clone = el.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.display = 'block';
      clone.style.top = '-999999px';
      clone.style.left = '-999999px';
      clone.style.height = 'auto';
      clone.style.opacity = '0';
      clone.style.zIndex = '-999999';
      clone.style.pointerEvents = 'none';
      const insertedElement = el.parentNode.insertBefore(clone, el);
      const height = insertedElement.offsetHeight;
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
   constructor(elem, options = {}) {
      this.stepper = elem;
      this.options = {
         firstActive: options.firstActive || 0,
         linearStepsNavigation: options.linearStepsNavigation || true,
         autoFocusInput: options.autoFocusInput || true,
         showFeedbackPreloader: options.showFeedbackPreloader || true,
         autoFormCreation: options.autoFormCreation || true,
         validationFunction: options.validationFunction || null,
         feedbackPreloader: options.feedbackPreloader || '<div class="preloader-wrapper active"> <div class="spinner-layer spinner-blue-only"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div></div>'
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
         DONESTEP: 'done',
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
   smartListenerUnbind = (el, event, fn) => {
      const { listenerStore } = this;
      var existentOneIndex = listenerStore.indexOf({ el, event, fn });
      el.removeEventListener(event, fn);
      listenerStore.splice(existentOneIndex, 1);
   }

   /**
    * An util method to manage binded eventListeners and avoid duplicates. This is the opposite of "smartListenerUnbind".
    * @param {HTMLElement} el - Target element in which the listener will be binded.
    * @param {string} event - Event to be listened like 'click'.
    * @param {function} fn - Function to be executed.
    * @param {boolean} [similar=false] - Unbind other listeners binded to the same event.
    * @param {boolean} [callFn=false] - If there's the same listener, will the function be executed before the removal?
    */
   smartListenerBind = (el, event, fn, similar = false, callFn = false) => {
      const { listenerStore } = this;
      // Builds an object with the element, event and function.
      const newListener = { el, event, fn };
      // Checks if similar listeners will be unbinded before the binding
      if (similar) {
         // Loops through the store searching for listeners binded to the same element listening for the same event
         for (let i = 0; i < listenerStore.length; i++) {
            const listener = listenerStore[i];
            // Unbind if found
            if (listener.event === event && listener.el.isSameNode(el)) listener.el.removeEventListener(listener.event, listener.fn);
            // Call the binded function if requested
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
      }
      // Finally, bind the listener
      el.addEventListener(event, fn);
      listenerStore.push(newListener);
   }

   /**
    * Slide Down function (almost like jQuery's one).
    * @param {HTMLElement} element - Element to be slided.
    * @param {string} [className] - Class to be added to the element.
    * @param {string} [classElement=element] - Element to add the class to. Otherwise, the first element will be used.
    * @param {string} [cb] - Callback to be executed after animation ends.
    * @returns {HTMLElement} - The original received step.
    */
   _slideDown = (element, className, classElement = element, cb) => {
      const height = `${MStepper.getUnknownHeight(element)}px`;

      const endSlideDown = e => {
         if (e.propertyName !== 'height') return;
         this.smartListenerUnbind(element, 'transitionend', endSlideDown);
         MStepper.removeMultipleProperties(element, 'visibility overflow height display');
         if (cb) cb();
      };

      requestAnimationFrame(() => {
         // Prepare the element for animation
         element.style.overflow = 'hidden';
         element.style.paddingBottom = '0';
         element.style.height = '0';
         element.style.visibility = 'unset';
         element.style.display = 'block';
         requestAnimationFrame(() => {
            this.smartListenerBind(element, 'transitionend', endSlideDown, true);
            element.style.height = height;
            element.style.removeProperty('padding-bottom');
            if (className) classElement.classList.add(className);
         });
      });
      return element;
   }

   /**
    * Slide up function (almost like jQuery's one).
    * @param {HTMLElement} element - Element to be slided.
    * @param {string} [className] - Class to be removed from the element.
    * @param {string} [classElement=element] - Element to removed the class from. Otherwise, the first element will be used.
    * @param {string} [cb] - Callback to be executed after animation ends.
    * @returns {HTMLElement} - The original received step.
    */
   _slideUp = (element, className, classElement = element, cb) => {
      const height = `${element.offsetHeight}px`;

      const endSlideUp = e => {
         if (e.propertyName !== 'height') return;
         this.smartListenerUnbind(element, 'transitionend', endSlideUp);
         element.style.display = 'none';
         MStepper.removeMultipleProperties(element, 'visibility overflow height padding-bottom');
         if (cb) cb();
      };

      requestAnimationFrame(() => {
         // Prepare the element for animation
         element.style.overflow = 'hidden';
         element.style.visibility = 'unset';
         element.style.display = 'block';
         element.style.height = height;
         requestAnimationFrame(() => {
            this.smartListenerBind(element, 'transitionend', endSlideUp, true);
            element.style.height = '0';
            element.style.paddingBottom = '0';
            if (className) classElement.classList.remove(className);
         });
      });

      return element;
   }

   _closeAction = (step) => {
      const { _slideUp, classes, stepper } = this;
      const stepContent = step.getElementsByClassName(classes.STEPCONTENT)[0];

      if (window.innerWidth < 993 || !stepper.classList.contains(classes.HORIZONTALSTEPPER)) {
         _slideUp(stepContent, classes.ACTIVESTEP, step);
      } else {
            step.classList.remove('active');
      }
      return step;
   }

   _openAction = (step, closeActiveStep = true) => {
      const { _slideDown, classes, getSteps, _closeAction, stepper } = this;
      const activeStep = getSteps().active.step;
      if (activeStep && activeStep.isSameNode(step)) return step;
      const stepContent = step.getElementsByClassName(classes.STEPCONTENT)[0];
      step.classList.remove(classes.DONESTEP);
      
      if (window.innerWidth < 993 || !stepper.classList.contains(classes.HORIZONTALSTEPPER)) {
         if (activeStep && closeActiveStep) _closeAction(activeStep);
         _slideDown(stepContent, classes.ACTIVESTEP, step);
      } else {
         step.classList.add('active');
         if (activeStep && closeActiveStep) _closeAction(activeStep);
      }

      return step;
   }

   _init = () => {
      const { _formWrapperManager, getSteps, options, stepper, classes, nextStep, prevStep, _stepTitleClickHandler, _openAction } = this;
      const { addMultipleEventListeners } = MStepper;
      this.form = _formWrapperManager();
      _openAction(getSteps().steps[options.firstActive]);
      const nextBtns = stepper.getElementsByClassName(classes.NEXTSTEPBTN);
      const prevBtns = stepper.getElementsByClassName(classes.PREVSTEPBTN);
      const stepsTitles = stepper.getElementsByClassName(classes.STEPTITLE);
      addMultipleEventListeners(nextBtns, 'click', nextStep, false);
      addMultipleEventListeners(prevBtns, 'click', prevStep, false);
      addMultipleEventListeners(stepsTitles, 'click', _stepTitleClickHandler);
   }

   /**
    * General nextStep function. It closes the active one and open the next.
    * @returns {boolean} e - Event.
    * @returns {boolean} skipFeedback - Destroys active feedback preloader (if any) and triggers nextStep.
    */
   nextStep = (e, skipFeedback) => {
      if (e && e.preventDefault) e.preventDefault();
      const { options, getSteps, activateFeedback, form, wrongStep, classes, _openAction, stepper, events, destroyFeedback } = this;
      const { showFeedbackPreloader, validationFunction } = options;
      const { active } = getSteps();
      const nextStep = getSteps().steps[active.index + 1];
      // const nextStepInputs = nextStep.querySelector('input, select');
      const feedbackFunction = e && e.target ? e.target.dataset.feedback : null;

      if (feedbackFunction && !skipFeedback) {
         if (showFeedbackPreloader && !active.step.dataset.nopreloader) activateFeedback();
         window[feedbackFunction](destroyFeedback, form, active.step);
         return;
      } else if (validationFunction && !validationFunction(form, active.step)) {
         return wrongStep();
      }

      active.step.classList.add(classes.DONESTEP);
      _openAction(nextStep);
      // if (options.autoFocusInput && nextStepInputs) nextStepInputs.focus();
      stepper.dispatchEvent(events.STEPCHANGE);
      stepper.dispatchEvent(events.NEXTSTEP);
   }
   prevStep = e => {
      if (e && e.preventDefault) e.preventDefault();
      const { getSteps, classes, _openAction, stepper, events } = this;
      const activeStep = getSteps().active;
      const prevStep = getSteps().steps[activeStep.index + -1];

      _openAction(prevStep);
      stepper.dispatchEvent(events.STEPCHANGE);
      stepper.dispatchEvent(events.PREVSTEP);
   }
   _stepTitleClickHandler = e => {
      const { getSteps, classes, nextStep, prevStep, stepper, _openAction } = this;
      const { steps, active } = getSteps();
      const clickedStep = MStepper.parents(e.target, `.${classes.STEP}`);
      if (stepper.classList.contains(classes.LINEAR)) {
         const clickedStepIndex = Array.prototype.indexOf.call(steps, clickedStep);
         if (clickedStepIndex == active.index + 1) nextStep(); else if (clickedStepIndex == active.index - 1) prevStep();
      } else {
         _openAction(clickedStep);
      }
   }
   activateFeedback = () => {
      const { getSteps, classes, options, stepper, events } = this;
      const { step: activeStep } = getSteps().active;
      activeStep.classList.add(classes.FEEDBACKINGSTEP);
      const content = activeStep.getElementsByClassName(classes.STEPCONTENT)[0];
      content.insertAdjacentHTML('afterBegin', `<div class="${classes.PRELOADERWRAPPER}">${options.feedbackPreloader}</div>`);
      stepper.dispatchEvent(events.FEEDBACKING);
   }
   destroyFeedback = triggerNextStep => {
      const { getSteps, classes, nextStep, stepper, events } = this;
      const { step: activeStep } = getSteps().active;
      activeStep.classList.remove(classes.FEEDBACKINGSTEP);
      const fbDiv = activeStep.getElementsByClassName(classes.PRELOADERWRAPPER)[0];
      fbDiv.parentNode.removeChild(fbDiv);
      if (triggerNextStep) nextStep(undefined, true);
      stepper.dispatchEvent(events.FEEDBACKDESTROYED);
   }
   wrongStep = () => {
      const { getSteps, classes, stepper, events } = this;
      getSteps().active.step.classList.add(classes.WRONGSTEP);
      const inputs = getSteps().active.step.querySelectorAll('input, select');
      const removeWrongOnInput = () => {
         getSteps().active.step.classList.remove(classes.WRONGSTEP);
         MStepper.removeMultipleEventListeners(inputs, 'input', removeWrongOnInput);
      };
      MStepper.addMultipleEventListeners(inputs, 'input', removeWrongOnInput);
      stepper.dispatchEvent(events.STEPERROR);
   }
   getSteps = () => {
      const { stepper, classes } = this;
      const steps = stepper.querySelectorAll(`li.${classes.STEP}`);
      const activeStep = stepper.querySelector(`li.${classes.ACTIVESTEP}`);
      const activeStepIndex = Array.prototype.indexOf.call(steps, activeStep);
      return { steps, active: { step: activeStep, index: activeStepIndex } };
   }
   activateStep = (elements, index) => {
      const { getSteps, _slideDown, stepper } = this;
      const currentSteps = getSteps();
      const nextStep = currentSteps.steps[index];
      let returnElement = null;
      if (typeof elements === 'string') {
         nextStep.insertAdjacentHTML('beforeBegin', elements);
         returnElement = nextStep.previousSibling;
         _slideDown(returnElement);
      } else if (Array.isArray(elements)) {
         returnElement = [];
         elements.forEach(element => {
            nextStep.insertAdjacentHTML('beforeBegin', element);
            returnElement.push(nextStep.previousSibling);
            _slideDown(nextStep.previousSibling);
         });
      } else if (elements instanceof Element || elements instanceof HTMLCollection) {
         returnElement = stepper.insertBefore(elements, nextStep);
         if (elements instanceof Element) _slideDown(returnElement); else returnElement.forEach(appendedElement => _slideDown(appendedElement));
      }
      return returnElement;
   }
   deactivateStep = elements => {
      const { _slideUp, stepper } = this;
      const doIt = element => { if (stepper.contains(elements)) _slideUp(element, undefined, undefined, () => stepper.removeChild(element)); };
      if (elements instanceof Element) doIt(elements); else if (elements instanceof HTMLCollection) elements.forEach(element => doIt(element));
      return elements;
   }
   _formWrapperManager = () => {
      const { stepper, options } = this;
      const form = MStepper.parents(stepper, 'form');
      if (!form.length && options.autoFormCreation) {
         const dataAttrs = stepper.dataset || {};
         const method = dataAttrs.method || 'GET';
         const action = dataAttrs.action || '?';
         const wrapper = document.createElement('form');
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
   }
}
