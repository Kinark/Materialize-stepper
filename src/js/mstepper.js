/** Class representing an MStepper */
class MStepper {
   /**
    * Constructor for Materialize Stepper.
    * @param {HTMLElement} elem - Element in which stepper will be initialized.
    * @param {object} [options] - Stepper options.
    * @param {number} [options.firstActive=0] - Default active step.
    * @param {boolean} [options.autoFocusInput=false] - Auto focus on first input of each step.
    * @param {boolean} [options.showFeedbackPreloader=true] - Set if a loading screen will appear while feedbacks functions are running.
    * @param {boolean} [options.autoFormCreation=true] - Auto generation of a form around the stepper.
    * @param {function} [options.validationFunction=null] - Function to be called everytime a nextstep occurs. It receives 2 arguments, in this sequece: stepperForm, activeStep.
    * @param {string} [options.feedbackPreloader] - Preloader used when step is waiting for feedback function. If not defined, Materializecss spinner-blue-only will be used.
    */
   constructor(elem, options = {}) {
      this.stepper = elem;
      this.options = Object.assign({
         firstActive: 0,
         autoFocusInput: true,
         showFeedbackPreloader: true,
         autoFormCreation: true,
         validationFunction: MStepper.defaultValidationFunction,
         stepTitleNavigation: true,
         feedbackPreloader: '<div class="preloader-wrapper active"> <div class="spinner-layer spinner-blue-only"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div></div>'
      }, options);
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
         STEPOPEN: new Event('stepopen'),
         STEPCLOSE: new Event('stepclose'),
         NEXTSTEP: new Event('nextstep'),
         PREVSTEP: new Event('prevstep'),
         STEPERROR: new Event('steperror'),
         FEEDBACKING: new Event('feedbacking'),
         FEEDBACKDESTROYED: new Event('feedbackdestroyed')
      };
      // Creates an empty array to power the methods _smartListenerBind/Unbind
      this.listenerStore = [];
      // Creates an empty variable to store the form (or not) afterwards
      this.form = null;
      // Calls the initialization method
      this._init();
   }

   /**
    * Init private method. Will be called on the creating of a new instance of MStepper.
    * @returns {void}
    */
   _init = () => {
      const { _formWrapperManager, getSteps, options, _methodsBindingManager, _openAction } = this;
      const { steps } = getSteps();
      // Calls the _formWrapperManager
      this.form = _formWrapperManager();
      // Opens the first step (or other specified in the constructor)
      _openAction(steps[options.firstActive], undefined, undefined, true);
      // Gathers the steps and send them to the methodsBinder
      _methodsBindingManager(steps);
   }

   /**
    * A private method that manages the binding of the methods into the correct elements inside the stepper.
    * @param {(HTMLElement|HTMLCollection|NodeList)} steps - The steps to find the bindable elements.
    * @param {boolean} [unbind=false] - Should it unbind instead of bind?
    * @returns {void}
    */
   _methodsBindingManager = (steps, unbind = false) => {
      const { classes, _formSubmitHandler, _nextStepProxy, _prevStepProxy, _stepTitleClickHandler, form, options } = this;
      const { addMultipleEventListeners, removeMultipleEventListeners, nodesIterator, tabbingDisabler } = MStepper;
      const bindOrUnbind = unbind ? removeMultipleEventListeners : addMultipleEventListeners;

      // Sets the binding function
      const bindEvents = step => {
         const nextBtns = step.getElementsByClassName(classes.NEXTSTEPBTN);
         const prevBtns = step.getElementsByClassName(classes.PREVSTEPBTN);
         const stepsTitle = step.getElementsByClassName(classes.STEPTITLE);
         const inputs = step.querySelectorAll('input, select, textarea, button');
         const submitButtons = step.querySelectorAll('button[type="submit"]');
         bindOrUnbind(nextBtns, 'click', _nextStepProxy, false);
         bindOrUnbind(prevBtns, 'click', _prevStepProxy, false);
         // Adding suggested feature in #62
         if (options.stepTitleNavigation) bindOrUnbind(stepsTitle, 'click', _stepTitleClickHandler);
         // Prevents the tabbing issue (https://github.com/Kinark/Materialize-stepper/issues/49)
         if (inputs.length) bindOrUnbind(inputs[inputs.length - 1], 'keydown', tabbingDisabler);
         // Binds to the submit button an internal handler to manage validation
         if (submitButtons && form && options.validationFunction) bindOrUnbind(submitButtons, 'keydown', _formSubmitHandler);
         return step;
      };
      // Calls the binder function in the right way (if it's a unique step or multiple ones)
      if (steps instanceof Element) bindEvents(steps); else nodesIterator(steps, step => bindEvents(step));
   }

   /**
    * A private method that manages submit of the form (sends to validationFunction before).
    * @returns {void}
    */
   _formSubmitHandler = e => { if (!this._validationFunctionCaller()) e.preventDefault(); }

   /**
    * An util method to reset stepper into it's original state (clear the form and open step 1). Can only be used with a form.
    * @returns {void}
    */
   resetStepper = () => { if (this.form) { this.form.reset(); this.openStep(this.options.firstActive); } }
   
   /**
    * An util method to update the stepper event listeners.
    * @returns {void}
    */
   updateStepper = () => { 
      const { getSteps, _methodsBindingManager } = this;
      // Gathers the current steps from the stepper
      const { steps } = getSteps();
      // Removes any bound methods
      _methodsBindingManager(steps, true);
      // Send the steps again to the methodsBindingManager
      _methodsBindingManager(steps);
    }

   /**
    * A private method to handle the opening of the steps.
    * @param {HTMLElement} step - Step which will be opened.
    * @param {function} cb - Callback to be executed after the transition ends.
    * @param {boolean} [closeActiveStep=true] - Should it close the active (open) step while opening the new one?
    * @param {boolean} [skipAutoFocus] - Should it skip autofocus on the first input of the next step?
    * @returns {HTMLElement} - The original received step.
    */
   _openAction = (step, cb, closeActiveStep = true, skipAutoFocus) => {
      const { _slideDown, classes, getSteps, _closeAction, stepper, events, options } = this;
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
         // Calls the slideDown private method if the stepper is vertical
         _slideDown(stepContent, classes.ACTIVESTEP, step, cb);

         // Beginning of autoFocusInput
         if (!skipAutoFocus) {
            _slideDown(stepContent, classes.ACTIVESTEP, step, () => {
               // Gets the inputs from the nextStep to focus on the first one (temporarily disabled)
               const nextStepInputs = stepContent.querySelector('input, select, textarea');
               // Focus on the first input of the next step (temporarily disabled)
               if (options.autoFocusInput && nextStepInputs) nextStepInputs.focus();
               if (cb && typeof cb === 'function') cb();
            });
         }
         // Enf of autoFocusInput

      } else {
         // The stepper is running in horizontal mode
         // Adds the class 'active' from the step, since all the animation is made by the CSS
         step.classList.add(classes.ACTIVESTEP);
      }
      // If it was requested to close the active step as well, does it (default=true)
      if (activeStep && closeActiveStep) {
         _closeAction(activeStep);
         // We are changing steps, so dispatch the change event.
         stepper.dispatchEvent(events.STEPCHANGE);
      }
      // Dispatch OPEN Event
      stepper.dispatchEvent(events.STEPOPEN);

      return step;
   }

   /**
    * A private method to handle the closing of the steps.
    * @param {HTMLElement} step - Step which will be closed.
    * @param {function} cb - Callback to be executed after the transition ends.
    * @returns {HTMLElement} - The original received step.
    */
   _closeAction = (step, cb) => {
      const { _slideUp, classes, stepper, events, _smartListenerUnbind, _smartListenerBind } = this;
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
               _smartListenerUnbind(stepContent, 'transitionend', waitForTransitionToCb);
               // Calls the callback
               cb();
            };
            // Binds the callback caller function to the event 'transitionend'
            _smartListenerBind(stepContent, 'transitionend', waitForTransitionToCb);
         }
         // Removes the class 'active' from the step, since all the animation is made by the CSS
         step.classList.remove(classes.ACTIVESTEP);
      }
      // Dispatch Event
      stepper.dispatchEvent(events.STEPCLOSE);
      return step;
   }

   // Two proxies to send the event as the last parameter
   _nextStepProxy = e => this.nextStep(undefined, undefined, e)
   _prevStepProxy = e => this.prevStep(undefined, e)

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
    * General nextStep function. It closes the active one and open the next one.
    * @param {function} cb - Callback to be executed after the transition ends.
    * @param {boolean} skipFeedback - Destroys active feedback preloader (if any) and triggers nextStep.
    * @param {object} e - Event.
    * @returns {void}
    */
   nextStep = (cb, skipFeedback, e) => {
      if (e && e.preventDefault) e.preventDefault();
      const { options, getSteps, activateFeedback, form, wrongStep, classes, _openAction, stepper, events, destroyFeedback, _validationFunctionCaller } = this;
      const { showFeedbackPreloader, validationFunction } = options;
      const { active } = getSteps();
      const nextStep = getSteps().steps[active.index + 1];

      // Gets the feedback function (if any) from the button
      const feedbackFunction = e && e.target ? e.target.dataset.feedback : null;

      // Checks if there's a validation function defined
      if (validationFunction && !_validationFunctionCaller()) {
         // There's a validation function and no feedback function
         // The validation function was already called in the if statement and it retuerned false, so returns the calling of the wrongStep method
         return wrongStep();
      }

      // Checks if there's a feedback function
      if (feedbackFunction && !skipFeedback) {
         // There's a feedback function and it wasn't requested to skip it
         // If showFeedbackPreloader is true (default=true), activates it
         if (showFeedbackPreloader && !active.step.dataset.nopreloader) activateFeedback();
         // Calls the feedbackFunction
         window[feedbackFunction](destroyFeedback, form, active.step.querySelector(`.${classes.STEPCONTENT}`));
         // Returns to prevent the nextStep method from being called
         return;
      }

      // Adds the class 'done' to the current step
      active.step.classList.add(classes.DONESTEP);
      // Opens the next one
      _openAction(nextStep, cb);

      // Dispatches the event
      stepper.dispatchEvent(events.NEXTSTEP);
   }

   /**
    * General prevStep function. It closes the active one and open the previous one. Will destroy active feedback preloader.
    * @param {function} cb - Callback to be executed after the transition ends.
    * @param {boolean} e - Event.
    * @returns {void}
    */
   prevStep = (cb, e) => {
      if (e && e.preventDefault) e.preventDefault();
      const { getSteps, _openAction, stepper, events, destroyFeedback } = this;
      const activeStep = getSteps().active;
      const prevStep = getSteps().steps[activeStep.index + -1];

      // Destroyes the feedback preloader, if any
      destroyFeedback();
      // Opens the previous step
      _openAction(prevStep, cb);

      // Dispatches the event
      stepper.dispatchEvent(events.PREVSTEP);
   }

   /**
    * General openStep function. It closes the active one and open the required one. Will destroy active feedback preloader.
    * @param {number} index - Index of the step to be opened (zero based, so the first step is 0, not 1).
    * @param {function} cb - Callback to be executed after the transition ends.
    * @returns {void}
    */
   openStep = (index, cb) => {
      const { getSteps, _openAction, destroyFeedback } = this;
      const stepToOpen = getSteps().steps[index];

      // Destroyes the feedback preloader, if any
      destroyFeedback();
      // Opens the requested step
      _openAction(stepToOpen, cb);
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
      const inputs = getSteps().active.step.querySelectorAll('input, select, textarea');
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
      if (triggerNextStep) nextStep(undefined, true);

      // Dispatches the event
      stepper.dispatchEvent(events.FEEDBACKDESTROYED);
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
      const steps = stepper.children;
      const activeStep = stepper.querySelector(`li.${classes.STEP}.${classes.ACTIVESTEP}`);
      const activeStepIndex = Array.prototype.indexOf.call(steps, activeStep);
      return { steps, active: { step: activeStep, index: activeStepIndex } };
   }

   /**
    * Add and activate one or more steps.
    * @param {(string|string[]|HTMLElement|HTMLCollection|NodeList)} elements - The step/steps to be added.
    * @param {number} index - The index in which the steps will be added (zero based, so the first one is 0, not 1).
    * @returns {(HTMLElement|HTMLCollection|NodeList)} - The new added/activated step/steps.
    */
   activateStep = (elements, index) => {
      const { getSteps, _slideDown, stepper, _methodsBindingManager } = this;
      const { nodesIterator } = MStepper;
      const currentSteps = getSteps().steps;

      // Checks if the steps will be added at the end or in the middle of the stepper
      const before = currentSteps.length > index;
      // Based on the previous check, sets the reference step
      const referenceStep = before ? currentSteps[index] : currentSteps[currentSteps.length - 1];

      // Stores a let variable to return the right element after the activation
      let returnableElement = null;
      // Starts the checking of the elements parameter
      if (typeof elements === 'string') {
         // The element is in string format
         // Insert it with the insertAdjacentHTML function (and trim the string to avoid errors)
         referenceStep.insertAdjacentHTML(before ? 'beforeBegin' : 'afterEnd', elements.trim());
         // Defines the inserted element as the returnableElement
         returnableElement = before ? referenceStep.previousSibling : referenceStep.nextSibling;
         // Activates (slideDown) the step
         _slideDown(returnableElement);
      } else if (Array.isArray(elements)) {
         // The element is in array format, probably an array of strings
         // Sets the returnableElement to be an empty array
         returnableElement = [];
         // Loops through the array
         elements.forEach(element => {
            // Inserts each element with the insertAdjacentHTML function (and trim the string to avoid errors)
            referenceStep.insertAdjacentHTML(before ? 'beforeBegin' : 'afterEnd', element.trim());
            // Gets the new added element
            const addedStep = before ? referenceStep.previousSibling : referenceStep.nextSibling;
            // Adds each element to the returnableElement array
            returnableElement.push(addedStep);
            // Activates (slideDown) each element
            _slideDown(addedStep);
         });
      } else if (elements instanceof Element || elements instanceof HTMLCollection || elements instanceof NodeList) {
         // The element is an HTMLElement or an HTMLCollection
         // Sets the rigth function to add the new steps
         const rigthFunction = before ? stepper.insertBefore : stepper.appendChild;
         // Insert it/them with the rigthFunction and sets the returnableElement
         returnableElement = rigthFunction(elements, referenceStep);
         // If it's and HTMLElement, activates (slideDown) it, if it's an HTMLCollection, activates (slideDown) each of them
         if (elements instanceof Element) _slideDown(returnableElement); else nodesIterator(returnableElement, appendedElement => _slideDown(appendedElement));
      }
      // Do the bidings to the new step(s)
      if (returnableElement) _methodsBindingManager(returnableElement);
      // Returns the added/activated elements
      return returnableElement;
   }

   /**
    * Deactivate and remove one or more steps.
    * @param {(HTMLElement|HTMLCollection|NodeList)} elements - The step/steps to be removed.
    * @returns {(HTMLElement|HTMLCollection|NodeList)} - The step(s) that has been deactivated, in case you want to activate it again.
    */
   deactivateStep = elements => {
      const { _slideUp, stepper, _methodsBindingManager } = this;
      const { nodesIterator } = MStepper;

      // Sets a function to group the orders to deactivate and remove the steps
      const doIt = element => {
         // Checks if the step really exists in the stepper
         if (stepper.contains(elements)) {
            // Yeah, it does exist
            // Unbinds the listeners previously binded to the step
            _methodsBindingManager(element, true);
            // Slides up and removes afterwards
            _slideUp(element, undefined, undefined, () => stepper.removeChild(element));
         }
      };
      // Checks if the elements is an HTMLElement or an HTMLCollection and calls the function doIt in the right way
      if (elements instanceof Element)
         doIt(elements);
      else if (elements instanceof HTMLCollection || elements instanceof NodeList)
         nodesIterator(elements, element => doIt(element));
      // Returns the step(s), in case you want to activate it/them again.
      return elements;
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
         this._smartListenerUnbind(element, 'transitionend', endSlideDown);
         // Removes properties needed for the transition to occur
         MStepper.removeMultipleProperties(element, 'visibility overflow height display');
         // Calls the callback() if any
         if (cb) cb();
      };

      // Calls an animation frame to avoid async weird stuff
      requestAnimationFrame(() => {
         element.style.display = 'none';
         requestAnimationFrame(() => {
            // Prepare the element for animation
            element.style.overflow = 'hidden';
            element.style.height = '0';
            element.style.paddingBottom = '0';
            element.style.visibility = 'unset';
            element.style.display = 'block';
            // Calls another animation frame to wait for the previous changes to take effect
            requestAnimationFrame(() => {
               // Binds the "conclusion" function to the event 'transitionend'
               this._smartListenerBind(element, 'transitionend', endSlideDown);
               // Sets the final height to the element to trigger the transition
               element.style.height = height;
               // Removes the 'padding-bottom: 0' setted previously to trigger it too
               element.style.removeProperty('padding-bottom');
               // element.style.paddingBottom = '0';
               // If a className for the slided element is required, add it
               if (className) classElement.classList.add(className);
            });
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
         this._smartListenerUnbind(element, 'transitionend', endSlideUp);
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
            this._smartListenerBind(element, 'transitionend', endSlideUp);
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
      } else if (form && form.length) {
         // The form exists
         // Returns the form
         return form;
      } else {
         // The form doesn't exist and autoFormCreation is false
         // Returns null
         return null;
      }
   }

   /**
    * An util method to make easy the task of calling the validationFunction.
    * @returns {boolean} - The validation function result.
    */
   _validationFunctionCaller = () => {
      const { options, getSteps, form, classes } = this;
      return options.validationFunction(form, getSteps().active.step.querySelector(`.${classes.STEPCONTENT}`));
   }

   /**
     * An util method to manage binded eventListeners and avoid duplicates. This is the opposite of "_smartListenerUnbind".
     * @param {HTMLElement} el - Target element in which the listener will be binded.
     * @param {string} event - Event to be listened like 'click'.
     * @param {function} fn - Function to be executed.
     * @param {boolean} [similar=false] - Unbind other listeners binded to the same event.
     * @param {boolean} [callFn=false] - If there's the same listener, will the function be executed before the removal?
     */
   _smartListenerBind = (el, event, fn, similar = true, callFn = false) => {
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
    * An util method to manage binded eventListeners and avoid duplicates. This is the opposite of "_smartListenerBind".
    * @param {HTMLElement} el - Target element in which the listener will be unbinded.
    * @param {string} listener - Event to unlisten like 'click'.
    * @param {function} fn - Function to be unbinded.
    */
   _smartListenerUnbind = (el, event, fn) => {
      const { listenerStore } = this;
      // Gets the index of the listener in the stepper listenerStore
      var existentOneIndex = listenerStore.indexOf({ el, event, fn });
      // Remove the even listener from the element
      el.removeEventListener(event, fn);
      // Remove the listener reference in the listenerStore
      listenerStore.splice(existentOneIndex, 1);
   }


   /**
    * Util function to simplify the binding of functions to nodelists.
    * @param {(HTMLCollection|NodeList|HTMLElement)} elements - Elements to bind a listener to.
    * @param {string} event - Event name, like 'click'.
    * @param {function} fn - Function to bind to elements.
    * @returns {void}
    */
   static addMultipleEventListeners(elements, event, fn, passive = false) {
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
   static removeMultipleEventListeners(elements, event, fn, passive = false) {
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
   static removeMultipleProperties(el, properties) {
      var propArray = properties.split(' ');
      for (let i = 0; i < propArray.length; i++) {
         el.style.removeProperty(propArray[i]);
      }
   }

   /**
    * Util function to itarate through HTMLCollections and NodeList using the same command.
    * @param {(HTMLCollection | NodeList)} nodes - List of elements to loop through.
    * @param {function} fn - Function to call for each element inside the nodes list.
    * @returns {(HTMLCollection | NodeList)} - The original nodes to enable chain functions
    */
   static nodesIterator(nodes, fn) { for (let i = 0; i < nodes.length; i++) fn(nodes[i]); return nodes; }

   /**
    * Util function to find the height of a hidden DOM object.
    * @param {HTMLElement} el - Hidden HTML element (node).
    * @returns {number} - The height without "px".
    */
   static getUnknownHeight(el) {
      // Spawns the hidden element in stealth mode
      el.style.position = 'fixed';
      el.style.display = 'block';
      el.style.top = '-999999px';
      el.style.left = '-999999px';
      el.style.height = 'auto';
      el.style.opacity = '0';
      el.style.zIndex = '-999999';
      el.style.pointerEvents = 'none';
      // Gets it's height
      const height = el.offsetHeight;
      // Removes the stealth mode and hides the element again
      MStepper.removeMultipleProperties(el, 'position display top left height opacity z-index pointer-events');
      return height;
   }

   /**
    * Default validation function.
    * @returns {boolean}
    */
   static defaultValidationFunction(stepperForm, activeStepContent) {
      var inputs = activeStepContent.querySelectorAll('input, textarea, select');
      for (let i = 0; i < inputs.length; i++) if (!inputs[i].checkValidity()) return false;
      return true;
   }

   /**
    * Util bindable tabbing disabler.
    * @returns {void}
    */
   static tabbingDisabler(e) { if (e.keyCode === 9) e.preventDefault(); }
}
