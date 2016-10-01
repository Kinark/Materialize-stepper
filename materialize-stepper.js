// Materializecss Stepper - By Kinark 2016
// https://github.com/Kinark/Materialize-stepper
// JS v1.0

$.fn.activateFeedback  = function() {
   form = this.closest('form');
   active = this.find('.step.active');
   if(form.valid()) {
      active.removeClass('wrong');
      active.find('.step-content').prepend('<div class="wait-feedback"><div class="preloader-wrapper active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>');
   } else {
      active.addClass('wrong');
   }
};

$.fn.destroyFeedback  = function() {
   active = this.find('.step.active');
   active.find('.step-content').find('.wait-feedback').remove();
};

$.fn.nextStep = function() {
   form = this.closest('form');
   active = this.find('.step.active');
   if(form.valid()) {
      active.find('.step-content').find('.wait-feedback').remove();
      active.removeClass('active wrong').addClass('done').find('.step-content').stop().slideUp('normal');
      active.next().addClass('active').find('.step-content').slideDown('normal');
   } else {
      active.removeClass('done').addClass('wrong');
   }
};

$.fn.prevStep = function() {
   active = this.find('.step.active');
   active.removeClass('active').find('.step-content').stop().slideUp('normal');
   active.prev().removeClass('done').addClass('active').find('.step-content').slideDown('normal');
};

$.fn.openStep = function(step) {
   step = this.find('.step:eq('+step+')');
   if(step.hasClass('active')) return;
   active = this.find('.step.active');
   active.removeClass('active').find('.step-content').stop().slideUp('normal');
   step.addClass('active').find('.step-content').slideDown('normal');
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
      $stepper.find('li.step .step-title').each(function(index) {
         var myIndex = index + 1;
         $(this).prepend('<div class="number">'+myIndex+'</div>');
      });

      $stepper.on("click", '.step:not(.active)', function () {
         if(!$stepper.hasClass('linear')) {
            object = $('.step').index($(this));
            $stepper.openStep(object);
         }
      }).on("click", '.next-step', function (e) {
         e.preventDefault();
         if($(this).data("feedback")) {
            $stepper.activeFeedback();
            return window[$stepper.data("feedback")].call();
         }
         $stepper.nextStep();
      }).on("click", '.previous-step', function (e) {
         e.preventDefault();
         $stepper.prevStep();
      });
   });
};
