/* Materializecss Stepper - By Kinark 2016
// https://github.com/Kinark/Materialize-stepper
// JS v1.2.3
*/

$.validator.setDefaults({
   errorClass: 'invalid',
   validClass: "valid",
   errorPlacement: function (error, element) {
      if(element.is(':radio') || element.is(':checkbox')) {
         error.insertBefore($(element).parent());
      }
      else {
         error.insertAfter(element); // default error placement.
      }
   },
   success: function (element) {
      if(!$(element).closest('li').find('label.invalid:not(:empty)').length){
         $(element).closest('li').removeClass('wrong');
      }
   }
});

$.fn.activateStep  = function() {
   $(this).addClass("step").stop().slideDown(function(){$(this).css({'height':'auto', 'margin-bottom': ''});});
};

$.fn.deactivateStep  = function() {
   $(this).removeClass("step").stop().slideUp(function(){$(this).css({'height':'auto', 'margin-bottom': '10px'});});
};

$.fn.showError  = function(error) {
   name = this.attr('name');
   form = this.closest('form');
   var obj = {};
   obj[name] = error;
   form.validate().showErrors(obj);
   this.closest('li').addClass('wrong');
};

$.fn.activateFeedback  = function() {
   active = this.find('.step.active').find('.step-content');
   return active.prepend('<div class="wait-feedback"> <div class="preloader-wrapper active"> <div class="spinner-layer spinner-blue"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div><div class="spinner-layer spinner-red"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div><div class="spinner-layer spinner-yellow"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div><div class="spinner-layer spinner-green"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div></div></div>');
};

$.fn.destroyFeedback  = function() {
   active = this.find('.step.active');
   return active.find('.step-content').find('.wait-feedback').remove();
};

$.fn.nextStep = function(ignorefb) {
   stepper = this;
   form = this.closest('form');
   active = this.find('.step.active');
   next = $(this.children('.step:visible')).index($(active))+2;
   feedback = $(active.find('.step-content').find('.step-actions').find('.next-step')).data("feedback");
   if(form.valid()) {
      if(feedback && ignorefb) {
         stepper.activateFeedback();
         return window[feedback].call();
      }
      active.removeClass('wrong').addClass('done');
      this.openStep(next);
      return this.trigger('nextstep');
   } else {
      return active.removeClass('done').addClass('wrong');
   }
};

$.fn.prevStep = function() {
   active = this.find('.step.active');
   prev = $(this.children('.step:visible')).index($(active));
   active.removeClass('wrong');
   this.openStep(prev);
   return this.trigger('prevstep');
};

$.fn.openStep = function(step) {
   step_num = step - 1;
   step = this.find('.step:visible:eq('+step_num+')');
   if(step.hasClass('active')) return;
   active = this.find('.step.active');
   active.find('.step-content').find('.wait-feedback').remove();
   active.removeClass('active').find('.step-content').stop().slideUp();
   step.removeClass('done').addClass('active').find('.step-content').slideDown();
   this.trigger('stepchange').trigger('step'+(step_num+1));
};

$.fn.activateStepper = function() {
   $(this).each(function(){
      var $stepper = $(this);
      method = $stepper.data('method');
      action = $stepper.data('action');
      method = (method ? method : "GET");
      action = (action ? action : "?");
      $stepper.wrap( '<form action="'+action+'" method="'+method+'"></div>' );
      $stepper.find('li.step.active .step-content').slideDown('normal');

      $stepper.on("click", '.step:not(.active)', function () {
         object = $($stepper.children('.step:visible')).index($(this));
         if(!$stepper.hasClass('linear')) {
            $stepper.openStep(object+1);
         } else {
            active = $stepper.find('.step.active');
            if($($stepper.children('.step:visible')).index($(active))+1 == object) {
               $stepper.nextStep(true);
            } else if ($($stepper.children('.step:visible')).index($(active))-1 == object) {
               $stepper.prevStep();
            }
         }
      }).on("click", '.next-step', function (e) {
         e.preventDefault();
         $stepper.nextStep(true);
      }).on("click", '.previous-step', function (e) {
         e.preventDefault();
         $stepper.prevStep();
      });
   });
};
