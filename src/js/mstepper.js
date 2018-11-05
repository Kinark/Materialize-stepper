/** Class representing an MStepper */
class MStepper {
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
      // Clones the element to insert it invisible
      const clone = el.cloneNode(true);
      // Defines some styles for it to be 100% invisible and unnoticeable
      clone.style.position = 'fixed';
      clone.style.display = 'block';
      clone.style.top = '-999999px';
      clone.style.left = '-999999px';
      clone.style.height = 'auto';
      clone.style.opacity = '0';
      clone.style.zIndex = '-999999';
      clone.style.pointerEvents = 'none';
      // Inserts it before the hidden element
      const insertedElement = el.parentNode.insertBefore(clone, el);
      // Gets it's height
      const height = insertedElement.offsetHeight;
      // Removes it
      el.parentNode.removeChild(insertedElement);
      // Returns the height (without 'px')
      return height;
   }

   /**
    * Constructor for Materialize Stepper.
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
      // Creates an empty array to power the methods smartListenerBind/Unbind
      this.listenerStore = [];
      // Creates an empty variable to store the form (or not) afterwards
      this.form = null;
      // Calls the initialization method
      this._init();
   }

   /**
    * An util method to manage binded eventListeners and avoid duplicates. This is the opposite of "smartListenerUnbind".
    * @param {HTMLElement} el - Target element in which the listener will be binded.
    * @param {string} event - Event to be listened like 'click'.
    * @param {function} fn - Function to be executed.
    * @param {boolean} [similar=false] - Unbind other listeners binded to the same event.
    * @param {boolean} [callFn=false] - If there's the same listener, will the function be executed before the removal?
    */
   smartListenerBind = (el, event, fn, similar = true, callFn = false) => {
      const { listenerStore } = this;
      // Builds an object with the element, event and function.
      const newListener = { el, event, fn };
      // Checks if similar listeners will be unbinded before the binding
      if (similar) {
         // Loops through the store searching for functions binded to the same element listening for the same event
         for (let i = 0; i < listenerStore.length; i++) {
            const listener = listenerStore[i];
            // Unbind if found
            if (listener.event === event && listener.el.isSameNode(el)) listener.el.removeEventListener(listener.event, listener.fn);
            // Calls the binded function if requested
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
      // Finally, binds the listener
      el.addEventListener(event, fn);
      listenerStore.push(newListener);
   }

   /**
    * An util method to manage binded eventListeners and avoid duplicates. This is the opposite of "smartListenerBind".
    * @param {HTMLElement} el - Target element in which the listener will be unbinded.
    * @param {string} listener - Event to unlisten like 'click'.
    * @param {function} fn - Function to be unbinded.
    */
   smartListenerUnbind = (el, event, fn) => {
      const { listenerStore } = this;
      // Gets the index of the listener in the stepper listenerStore
      var existentOneIndex = listenerStore.indexOf({ el, event, fn });
      // Remove the even listener from the element
      el.removeEventListener(event, fn);
      // Remove the listener reference in the listenerStore
      listenerStore.splice(existentOneIndex, 1);
   }

   /**
    * Slide Down function (almost like jQuery's one), but it requires the element to already count with transition properties in CSS.
    * @param {HTMLElement} element - Element to be slided.
    * @param {string} [className] - Class to be added to the element.
    * @param {string} [classElement=element] - Element to add the class to. Otherwise, the first element will be used.
    * @param {string} [cb] - Callback to be executed after animation ends.
    * @returns {HTMLElement} - The original received step.
    */
   _slideDown = (element, className, classElement = element, cb) => {
      // Gets the height of the element when it's already visible
      const height = `${MStepper.getUnknownHeight(element)}px`;

      // Defines a function to be called after the transition's end
      const endSlideDown = e => {
         // If the transition is not 'height', returns
         if (e.propertyName !== 'height') return;
         // Unbinds the listener from the element
         this.smartListenerUnbind(element, 'transitionend', endSlideDown);
         // Removes properties needed for the transition to occur
         MStepper.removeMultipleProperties(element, 'visibility overflow height display');
         // Calls the callback() if any
         if (cb) cb();
      };

      // Calls an animation frame to avoid async weird stuff
      requestAnimationFrame(() => {
         // Prepare the element for animation
         element.style.overflow = 'hidden';
         element.style.paddingBottom = '0';
         element.style.height = '0';
         element.style.visibility = 'unset';
         element.style.display = 'block';
         // Calls another animation frame to wait for the previous changes to take effect
         requestAnimationFrame(() => {
            // Binds the "conclusion" function to the event 'transitionend'
            this.smartListenerBind(element, 'transitionend', endSlideDown);
            // Sets the final height to the element to trigger the transition
            element.style.height = height;
            // Removes the 'padding-bottom: 0' setted previously to trigger it too
            element.style.removeProperty('padding-bottom');
            // If a className for the slided element is required, add it
            if (className) classElement.classList.add(className);
         });
      });
      // Returns the original element to enable chain functions
      return element;
   }

   /**
    * Slide up function (almost like jQuery's one), but it requires the element to already count with transition properties in CSS.
    * @param {HTMLElement} element - Element to be slided.
    * @param {string} [className] - Class to be removed from the element.
    * @param {string} [classElement=element] - Element to removed the class from. Otherwise, the first element will be used.
    * @param {string} [cb] - Callback to be executed after animation ends.
    * @returns {HTMLElement} - The original received step.
    */
   _slideUp = (element, className, classElement = element, cb) => {
      // Gets the element's height
      const height = `${element.offsetHeight}px`;

      // Defines a function to be called after the transition's end
      const endSlideUp = e => {
         // If the transition is not 'height', returns
         if (e.propertyName !== 'height') return;
         // Unbinds the listener from the element
         this.smartListenerUnbind(element, 'transitionend', endSlideUp);
         // Sets display none for the slided element
         element.style.display = 'none';
         // Removes properties needed for the transition to occur
         MStepper.removeMultipleProperties(element, 'visibility overflow height padding-bottom');
         // Calls the callback() if any
         if (cb) cb();
      };

      // Calls an animation frame to avoid async weird stuff
      requestAnimationFrame(() => {
         // Prepare the element for animation
         element.style.overflow = 'hidden';
         element.style.visibility = 'unset';
         element.style.display = 'block';
         element.style.height = height;
         // Calls another animation frame to wait for the previous changes to take effect
         requestAnimationFrame(() => {
            // Binds the "conclusion" function to the event 'transitionend'
            this.smartListenerBind(element, 'transitionend', endSlideUp);
            // Sets the height to 0 the element to trigger the transition
            element.style.height = '0';
            // Sets the 'padding-bottom: 0' to transition the padding
            element.style.paddingBottom = '0';
            // If a removal of a className for the slided element is required, remove it
            if (className) classElement.classList.remove(className);
         });
      });
      // Returns the original element to enable chain functions
      return element;
   }

   /**
    * A private method to handle the closing of the steps.
    * @param {HTMLElement} step - Step which will be closed.
    * @param {function} cb - Callback to be executed after the transition ends.
    * @returns {HTMLElement} - The original received step.
    */
   _closeAction = (step, cb) => {
      const { _slideUp, classes, stepper, smartListenerUnbind, smartListenerBind } = this;
      // Gets the step content div inside the step
      const stepContent = step.getElementsByClassName(classes.STEPCONTENT)[0];

      // Checks if the step is currently horizontal or vertical
      if (window.innerWidth < 993 || !stepper.classList.contains(classes.HORIZONTALSTEPPER)) {
         // The stepper is running in vertical mode
         // Calls the slideUp private method on the step
         _slideUp(stepContent, classes.ACTIVESTEP, step, cb);
      } else {
         // The stepper is running in horizontal mode
         // If there's a callback, handles it
         if (cb) {
            // Defines a function to be called after the transition's end
            const waitForTransitionToCb = e => {
               // If the transition is not 'left', returns
               if (e.propertyName !== 'left') return;
               // Unbinds the listener from the element
               smartListenerUnbind(stepContent, 'transitionend', waitForTransitionToCb);
               // Calls the callback
               cb();
            };
            // Binds the callback caller function to the event 'transitionend'
            smartListenerBind(stepContent, 'transitionend', waitForTransitionToCb);
         }
         // Removes the class 'active' from the step, since all the animation is made by the CSS
         step.classList.remove('active');
      }
      return step;
   }

   /**
    * A private method to handle the opening of the steps.
    * @param {HTMLElement} step - Step which will be opened.
    * @param {function} cb - Callback to be executed after the transition ends.
    * @returns {HTMLElement} - The original received step.
    */
   _openAction = (step, cb, closeActiveStep = true) => {
      const { _slideDown, classes, getSteps, _closeAction, stepper } = this;
      // Gets the active step element
      const activeStep = getSteps().active.step;
      // If the active step is the same as the one that has been asked to be opened, returns the step
      if (activeStep && activeStep.isSameNode(step)) return step;
      // Gets the step content div inside the step
      const stepContent = step.getElementsByClassName(classes.STEPCONTENT)[0];
      step.classList.remove(classes.DONESTEP);

      // Checks if the step is currently horizontal or vertical
      if (window.innerWidth < 993 || !stepper.classList.contains(classes.HORIZONTALSTEPPER)) {
         // The stepper is running in vertical mode
         // If it was requested to close the active step as well, does it (default=true)
         if (activeStep && closeActiveStep) _closeAction(activeStep);
         // Calls the slideDown private method if the stepper is vertical
         _slideDown(stepContent, classes.ACTIVESTEP, step, cb);
      } else {
         // The stepper is running in horizontal mode
         // Adds the class 'active' from the step, since all the animation is made by the CSS
         step.classList.add('active');
         // If it was requested to close the active step as well, does it (default=true)
         if (activeStep && closeActiveStep) _closeAction(activeStep, cb);
      }
      return step;
   }

   /**
    * Init private method. Will be called on the creating of a new instance of MStepper.
    * @returns {void}
    */
   _init = () => {
      const { _formWrapperManager, getSteps, options, stepper, classes, _nextStepProxy, _prevStepProxy, _stepTitleClickHandler, _openAction } = this;
      const { addMultipleEventListeners } = MStepper;
      // Calls the _formWrapperManager
      this.form = _formWrapperManager();
      // Opens the first step (or other specified in the constructor)
      _openAction(getSteps().steps[options.firstActive]);
      // Gathers some divs and binds the right methods to them
      const nextBtns = stepper.getElementsByClassName(classes.NEXTSTEPBTN);
      const prevBtns = stepper.getElementsByClassName(classes.PREVSTEPBTN);
      const stepsTitles = stepper.getElementsByClassName(classes.STEPTITLE);
      addMultipleEventListeners(nextBtns, 'click', _nextStepProxy, false);
      addMultipleEventListeners(prevBtns, 'click', _prevStepProxy, false);
      addMultipleEventListeners(stepsTitles, 'click', _stepTitleClickHandler);
   }

   // Two proxies to send the event as the last parameter
   _nextStepProxy = e => this.nextStep(undefined, undefined, e)
   _prevStepProxy = e => this.prevStep(undefined, e)

   /**
    * General nextStep function. It closes the active one and open the next one.
    * @param {function} cb - Callback to be executed after the transition ends.
    * @param {boolean} skipFeedback - Destroys active feedback preloader (if any) and triggers nextStep.
    * @param {object} e - Event.
    * @returns {void}
    */
   nextStep = (cb, skipFeedback, e) => {
      if (e && e.preventDefault) e.preventDefault();
      const { options, getSteps, activateFeedback, form, wrongStep, classes, _openAction, stepper, events, destroyFeedback } = this;
      const { showFeedbackPreloader, validationFunction } = options;
      const { active } = getSteps();
      const nextStep = getSteps().steps[active.index + 1];

      // Gets the inputs from the nextStep to focus on the first one afterwards (temporarily disabled)
      // const nextStepInputs = nextStep.querySelector('input, select');
      // Gets the feedback function (if any) from the button
      const feedbackFunction = e && e.target ? e.target.dataset.feedback : null;

      // Handles the feedback/validation functions. The former is more priority
      if (feedbackFunction && !skipFeedback) {
         // There's a feedback function and it wasn't requested to skip it
         // If showFeedbackPreloader is true (default=true), activates it
         if (showFeedbackPreloader && !active.step.dataset.nopreloader) activateFeedback();
         // Calls the feedbackFunction
         window[feedbackFunction](destroyFeedback, form, active.step);
         // Returns to prevent the nextStep method from being called
         return;
      } else if (validationFunction && !validationFunction(form, active.step)) {
         // There's a validation function and no feedback function
         // The validation function was already called in the if statement and it retuerned false, so returns the calling of the wrongStep method
         return wrongStep();
      }

      // Adds the class 'done' to the current step
      active.step.classList.add(classes.DONESTEP);
      // Opens the next one
      _openAction(nextStep, cb);
      // Focus on the first input of the next step (temporarily disabled)
      // if (options.autoFocusInput && nextStepInputs) nextStepInputs.focus();

      // Dispatches the events
      stepper.dispatchEvent(events.STEPCHANGE);
      stepper.dispatchEvent(events.NEXTSTEP);
   }

   /**
    * General prevStep function. It closes the active one and open the previous one. Will destroy active feedback preloader.
    * @param {function} cb - Callback to be executed after the transition ends.
    * @param {boolean} e - Event.
    * @returns {void}
    */
   prevStep = (e, cb) => {
      if (e && e.preventDefault) e.preventDefault();
      const { getSteps, _openAction, stepper, events, destroyFeedback } = this;
      const activeStep = getSteps().active;
      const prevStep = getSteps().steps[activeStep.index + -1];

      // Destroyes the feedback preloader, if any
      destroyFeedback();
      // Opens the previous step
      _openAction(prevStep, cb);

      // Dispatches the events
      stepper.dispatchEvent(events.STEPCHANGE);
      stepper.dispatchEvent(events.PREVSTEP);
   }

   /**
    * General openStep function. It closes the active one and open the required one. Will destroy active feedback preloader.
    * @param {number} index - Index of the step to be opened (zero based, so the first step is 0, not 1).
    * @param {function} cb - Callback to be executed after the transition ends.
    * @returns {void}
    */
   openStep = (index, cb) => {
      const { getSteps, _openAction, stepper, events, destroyFeedback } = this;
      const stepToOpen = getSteps().steps[index];

      // Destroyes the feedback preloader, if any
      destroyFeedback();
      // Opens the requested step
      _openAction(stepToOpen, cb);

      // Dispatches the events
      stepper.dispatchEvent(events.STEPCHANGE);
   }

   /**
    * Private method to handle the clicks on the step-titles.
    * @param {boolean} e - Event.
    * @returns {void}
    */
   _stepTitleClickHandler = e => {
      const { getSteps, classes, nextStep, prevStep, stepper, _openAction } = this;
      const { steps, active } = getSteps();
      const clickedStep = e.target.closest(`.${classes.STEP}`);

      // Checks if the stepper is linear or not
      if (stepper.classList.contains(classes.LINEAR)) {
         // Linear stepper detected
         // Get the index of the active step
         const clickedStepIndex = Array.prototype.indexOf.call(steps, clickedStep);
         // If the step clicked is the next one, calls nextStep(), if it's the previous one, calls prevStep(), otherwise do nothing
         if (clickedStepIndex == active.index + 1) nextStep(); else if (clickedStepIndex == active.index - 1) prevStep();
      } else {
         // Non-linear stepper detected
         // Opens the step clicked
         _openAction(clickedStep);
      }
   }

   /**
    * Activate feedback preloader.
    * @returns {void}
    */
   activateFeedback = () => {
      const { getSteps, classes, options, stepper, events } = this;
      const { step: activeStep } = getSteps().active;

      // Adds the FEEDBACKINGSTEP class to the step
      activeStep.classList.add(classes.FEEDBACKINGSTEP);
      // Gets the step content div inside the step
      const content = activeStep.getElementsByClassName(classes.STEPCONTENT)[0];
      // Inserts the predefined prealoder in the step content div
      content.insertAdjacentHTML('afterBegin', `<div class="${classes.PRELOADERWRAPPER}">${options.feedbackPreloader}</div>`);

      // Dispatches the event
      stepper.dispatchEvent(events.FEEDBACKING);
   }

   /**
    * Destroys feedback preloader and call (or not) nextStep.
    * @param {boolean} [triggerNextStep] - After the destruction of the feedback preloader, trigger nextStep?
    * @returns {void}
    */
   destroyFeedback = triggerNextStep => {
      const { getSteps, classes, nextStep, stepper, events } = this;
      const { step: activeStep } = getSteps().active;

      // If there's no activeStep or preloader, returns
      if (!activeStep || !activeStep.classList.contains(classes.FEEDBACKINGSTEP)) return;
      // Removes the FEEDBACKINGSTEP class from the step
      activeStep.classList.remove(classes.FEEDBACKINGSTEP);
      // Gets the preloader div
      const fbDiv = activeStep.getElementsByClassName(classes.PRELOADERWRAPPER)[0];
      // Removes the preloader div
      fbDiv.parentNode.removeChild(fbDiv);
      // Calls nextStep if requested (default=false)
      if (triggerNextStep) nextStep(undefined, undefined, true);

      // Dispatches the event
      stepper.dispatchEvent(events.FEEDBACKDESTROYED);
   }

   /**
    * Show error on the step and remove it after any change on inputs or select.
    * @returns {void}
    */
   wrongStep = () => {
      const { getSteps, classes, stepper, events } = this;

      // Add the WRONGSTEP class to the step
      getSteps().active.step.classList.add(classes.WRONGSTEP);
      // Gets all the inputs from the active step
      const inputs = getSteps().active.step.querySelectorAll('input, select');
      // Defines a function to be binded to any change in any input
      const removeWrongOnInput = () => {
         // If there's a change, removes the WRONGSTEP class
         getSteps().active.step.classList.remove(classes.WRONGSTEP);
         // Unbinds the listener from the element
         MStepper.removeMultipleEventListeners(inputs, 'input', removeWrongOnInput);
      };
      // Binds the removeWrongOnInput function to the inputs, listening to the event 'input'
      MStepper.addMultipleEventListeners(inputs, 'input', removeWrongOnInput);

      // Dispatches the event
      stepper.dispatchEvent(events.STEPERROR);
   }

   /**
    * @typedef {Object} Steps - A structure with information about the steps in a stepper.
    * @property {HTMLCollection} steps - A collection with the references to the steps in the DOM.
    * @property {object} active - An object with some information about the active step.
    * @property {HTMLElement} active.step - An HTMLElement referencing the active step in the DOM.
    * @property {number} active.index - A number indicating the index of the active step (zero based, so the first one is 0, not 1).
    */

   /**
    * Method to get information about the steps.
    * @returns {Steps} - A structure with information about the steps in a stepper.
    */
   getSteps = () => {
      const { stepper, classes } = this;
      const steps = stepper.querySelectorAll(`li.${classes.STEP}`);
      const activeStep = stepper.querySelector(`li.${classes.ACTIVESTEP}`);
      const activeStepIndex = Array.prototype.indexOf.call(steps, activeStep);
      return { steps, active: { step: activeStep, index: activeStepIndex } };
   }

   /**
    * Add and activate one or more steps.
    * @param {(string|string[]|HTMLElement|HTMLCollection|)} elements - The step/steps to be added.
    * @param {number} index - The index in which the steps will be added (zero based, so the first one is 0, not 1).
    * @returns {HTMLElement|HTMLCollection} - The new added/activated step/steps.
    */
   activateStep = (elements, index) => {
      const { getSteps, _slideDown, stepper } = this;
      const currentSteps = getSteps();
      const nextStep = currentSteps.steps[index];

      // Stores a let variable to return the right element after the activation
      let returnElement = null;
      // Starts the checking of the elements parameter
      if (typeof elements === 'string') {
         // The element is in string format
         // Insert it with the insertAdjacentHTML function
         nextStep.insertAdjacentHTML('beforeBegin', elements);
         // Defines the inserted element as the returnElement
         returnElement = nextStep.previousSibling;
         // Activates (slideDown) the step
         _slideDown(returnElement);
      } else if (Array.isArray(elements)) {
         // The element is in array format, probably an array of strings
         // Sets the returnElement to be an empty array
         returnElement = [];
         // Loops through the array
         elements.forEach(element => {
            // Inserts each element with the insertAdjacentHTML function
            nextStep.insertAdjacentHTML('beforeBegin', element);
            // Adds each element to the returnElement array
            returnElement.push(nextStep.previousSibling);
            // Activates (slideDown) each element
            _slideDown(nextStep.previousSibling);
         });
      } else if (elements instanceof Element || elements instanceof HTMLCollection) {
         // The element is an HTMLElement or an HTMLCollection
         // Insert it/them with the insertBefore function and sets the returnElement
         returnElement = stepper.insertBefore(elements, nextStep);
         // If it's and HTMLElement, activates (slideDown) it, if it's an HTMLCollection, activates (slideDown) each of them
         if (elements instanceof Element) _slideDown(returnElement); else returnElement.forEach(appendedElement => _slideDown(appendedElement));
      }
      // Returns the added/activated elements
      return returnElement;
   }

   /**
    * Deactivate and remove one or more steps.
    * @param {(HTMLElement|HTMLCollection)} elements - The step/steps to be removed.
    * @returns {HTMLElement|HTMLCollection} - The step(s) that has been deactivated, in case you want to activate it again.
    */
   deactivateStep = elements => {
      const { _slideUp, stepper } = this;

      // Sets a function to group the orders to deactivate and remove the steps
      const doIt = element => { if (stepper.contains(elements)) _slideUp(element, undefined, undefined, () => stepper.removeChild(element)); };
      // Checks if the elements is an HTMLElement or an HTMLCollection and calls the function doIt in the right way
      if (elements instanceof Element) doIt(elements); else if (elements instanceof HTMLCollection) elements.forEach(element => doIt(element));
      // Returns the step(s), in case you want to activate it/them again.
      return elements;
   }


   /**
    * Private method to wrap the ul.stepper with a form.
    * @returns {HTMLElement} - The form itself.
    */
   _formWrapperManager = () => {
      const { stepper, options } = this;
      // Checks if there's a form wrapping the stepper and gets it
      const form = stepper.closest('form');
      // Checks if the form doesn't exist and the autoFormCreation option is true (default=true)
      if (!form && options.autoFormCreation) {
         // The form doesn't exist and the autoFormCreation is true
         // Gathers the form settings from the dataset of the stepper
         const dataAttrs = stepper.dataset || {};
         const method = dataAttrs.method || 'GET';
         const action = dataAttrs.action || '?';
         // Creates a form element
         const wrapper = document.createElement('form');
         // Defines the form's settings
         wrapper.method = method;
         wrapper.action = action;
         // Wraps the stepper with it
         stepper.parentNode.insertBefore(wrapper, stepper);
         wrapper.appendChild(stepper);
         // Returns the wrapper (the form)
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
   }
}
