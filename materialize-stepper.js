// Materializecss Stepper - By Kinark 2016
// https://github.com/Kinark/Materialize-stepper
// JS v1.1

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

$.fn.destroyFeedback  = function() {
   active = this.find('.step.active');
   active.find('.step-content').find('.wait-feedback').remove();
};

$.fn.nextStep = function() {
   form = this.closest('form');
   active = this.find('.step.active');
   next = $('.step').index($(active))+2;
   if(form.valid()) {
      active.removeClass('wrong').addClass('done');
      this.openStep(next);
   } else {
      active.removeClass('done').addClass('wrong');
   }
   this.trigger('nextstep').trigger('stepchange').trigger('step'+next);
};

$.fn.prevStep = function() {
   active = this.find('.step.active');
   prev = $('.step').index($(active));
   this.openStep(prev);
   this.trigger('prevstep').trigger('stepchange').trigger('step'+prev);
};

$.fn.openStep = function(step) {
   step -= 1;
   step = this.find('.step:eq('+step+')');
   if(step.hasClass('active')) return;
   active = this.find('.step.active');
   active.find('.step-content').find('.wait-feedback').remove();
   active.removeClass('active').find('.step-content').stop().slideUp('normal');
   step.removeClass('done').addClass('active').find('.step-content').slideDown('normal');
};

$.fn.updateSteps = function() {
   this.find('li.step .step-title:visible').each(function(index) {
      var myIndex = index + 1;
      if($(this).children(":first").hasClass('number')){
         $(this).children(":first").html(myIndex);
      } else {
         $(this).prepend('<div class="number">'+myIndex+'</div>');
      }
   });
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
      $stepper.find('li.step .step-title:visible').each(function(index) {
         var myIndex = index + 1;
         if($(this).children(":first").hasClass('number')){
            $(this).children(":first").html(myIndex);
         } else {
            $(this).prepend('<div class="number">'+myIndex+'</div>');
         }
      });

      $stepper.on("click", '.step:not(.active)', function () {
         object = $('.step').index($(this));
         if(!$stepper.hasClass('linear')) {
            $stepper.openStep(object);
         } else {
            active = $stepper.find('.step.active');
            if($('.step').index($(active))+1 == object) {
               $stepper.nextStep();
            } else if ($('.step').index($(active))-1 == object) {
               $stepper.prevStep();
            }
         }
      }).on("click", '.next-step', function (e) {
         e.preventDefault();
         if($(this).data("feedback")) {
            $stepper.activateFeedback();
            return window[$(this).data("feedback")].call();
         }
         $stepper.nextStep();
      }).on("click", '.previous-step', function (e) {
         e.preventDefault();
         $stepper.prevStep();
      });
   });
};
