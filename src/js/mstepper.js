class MStepper {
   /**
    * Util function to simplify the binding of functions to nodelists
    * @param {HTMLElement} el - Element to search in
    * @param {string} className - Class to search
    * @param {string} event - Event name, like 'click'
    * @param {function} fn Function to bind to elements found
    * @returns {void}
    */
   static addEventListenerByClass(el, className, event, fn) {
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
   static removeMultipleProperties(el, properties) {
      var propArray = properties.split(' ');
      for (let i = 0; i < propArray.length; i++) {
         el.style.removeProperty(propArray[i]);
      }
   }

   /**
    * Util function to find the height of a hidden DOM object.
    * @param {HTMLElement} el - Hidden HTML element (node)
    * @returns {number} - The height without "px"
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
      const insertedElement = el.parentNode.appendChild(clone);
      const height = insertedElement.offsetHeight;
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
   constructor(elem, options = {}) {
      this.stepper = elem;
      this.options = {
         firstActive: options.firstActive || 0,
         linearStepsNavigation: options.linearStepsNavigation || true,
         autoFocusInput: options.autoFocusInput || true,
         showFeedbackLoader: options.showFeedbackLoader || true,
         autoFormCreation: options.autoFormCreation || true
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
         STEP: step => `step${step}`
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
   smartListenerUnbind = (el, event, fn) => {
      const { listenerStore } = this;
      var existentOneIndex = listenerStore.indexOf({ el, event, fn });
      el.removeEventListener(event, fn);
      listenerStore.splice(existentOneIndex, 1);
   }

   /**
    * An util method to manage binded eventListeners and avoid duplicates. This is the opposite of "smartListenerUnbind".
    * @param {HTMLElement} el - Target element in wich the listener will be binded
    * @param {string} event - Event to be listened like 'click'
    * @param {function} fn - Function to be executed
    * @param {boolean} [similar=false] - Unbind other listeners binded to the same event
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
    * Animation function
    * @param {HTMLElement} step - Step to open
    * @returns {HTMLElement} - The original received step
    */
   openAction = step => {
      step.classList.remove('done');
      const content = step.getElementsByClassName('step-content')[0];
      const height = `${MStepper.getUnknownHeight(content)}px`;

      const endSlideDown = e => {
         if (e.propertyName !== 'height') return;
         this.smartListenerUnbind(content, 'transitionend', endSlideDown);
         MStepper.removeMultipleProperties(content, 'visibility overflow height display');
      };

      requestAnimationFrame(() => {
         // Prepare the element for animation
         content.style.overflow = 'hidden';
         content.style.visibility = 'unset';
         content.style.display = 'block';
         requestAnimationFrame(() => {
            this.smartListenerBind(content, 'transitionend', endSlideDown, true);
            content.style.height = height;
            step.classList.add('active');
         });
      });
      return step;
   }

   /**
    * Animation function
    * @param {HTMLElement} step - Step to close
    * @returns {HTMLElement} - The original received step
    */
   closeAction = step => {
      const content = step.getElementsByClassName('step-content')[0];
      const height = `${content.offsetHeight}px`;

      const endSlideUp = e => {
         if (e.propertyName !== 'height') return;
         this.smartListenerUnbind(content, 'transitionend', endSlideUp);
         MStepper.removeMultipleProperties(content, 'visibility overflow height display');
      };

      requestAnimationFrame(() => {
         // Prepare the element for animation
         content.style.overflow = 'hidden';
         content.style.visibility = 'unset';
         content.style.display = 'block';
         content.style.height = height;
         requestAnimationFrame(() => {
            this.smartListenerBind(content, 'transitionend', endSlideUp, true);
            content.style.height = '0';
            step.classList.remove('active');
         });
      });

      return step;
   }

   activateStepper = () => {
      const { wrapWithForm, getSteps, options, stepper, classes, nextStep, prevStep, openAction } = this;
      const { addEventListenerByClass } = MStepper;
      wrapWithForm();
      openAction(getSteps().steps[options.firstActive]);
      addEventListenerByClass(stepper, classes.NEXT, 'click', nextStep);
      addEventListenerByClass(stepper, classes.PREV, 'click', prevStep);
   }
   nextStep = () => {
      var getSteps = this.getSteps();
      const activeStep = getSteps.active;
      this.closeAction(activeStep.step);
      this.openAction(getSteps.steps[activeStep.index + 1]);
   }
   prevStep = () => {
      const activeStep = this.getSteps().active;
      this.closeAction(activeStep.step);
      this.openAction(this.getSteps().steps[activeStep.index + -1]);
   }
   getSteps = () => {
      const steps = this.stepper.querySelectorAll('li');
      let active, activeIndex;
      for (let i = 0; i < steps.length; i++) {
         if (steps[i].classList.contains('active')) {
            active = steps[i];
            activeIndex = i;
         }
      }
      return { steps, active: { step: active, index: activeIndex } };
   }
   wrapWithForm = () => {
      const stpr = this.stepper;
      if (!parentsUntil(stpr, 'form').length && this.options.autoFormCreation) {
         const dataAttrs = stpr.dataset || {};
         const method = dataAttrs || 'GET';
         const action = dataAttrs || '?';
         const wrapper = document.createElement('form');
         wrapper.method = method;
         wrapper.action = action;
         // stpr.parentNode.insertBefore(wrapper, stpr);
      }
   }
}


/**
 * Traverse parents until find the one (like jQuery's parents)
 * @param {HTMLElement} el - Base element to start the search
 * @param {string} selector - Selector to filter
 * @param {string} filter - Filter
 * @returns {HTMLElement}
 */
function parentsUntil(el, selector, filter) {
   const result = [];
   const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
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
