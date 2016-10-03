// Materializecss Stepper - By Kinark 2016
// https://github.com/Kinark/Materialize-stepper
// JS v1.0.3

$.validator.setDefaults({
   errorClass: 'invalid',
   validClass: "valid",
   errorPlacement: function (error, element) {
      if(!element.is(':radio') && !element.is(':checkbox')) {
         if($('.'+element.attr("id")).length) {
            $($('.'+element.attr("id"))).html(error.text());
         } else {
            $(element).after('<label class="error '+element.attr("id")+'" for="'+element.attr("id")+'">'+error.text()+'</label>');
         }
      }
   },
});

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
      active.removeClass('wrong').addClass('done');
      this.openStep($('.step').index($(active))+1);
   } else {
      active.removeClass('done').addClass('wrong');
   }
};

$.fn.prevStep = function() {
   active = this.find('.step.active');
   this.openStep($('.step').index($(active))-1);
};

$.fn.openStep = function(step) {
   step = this.find('.step:eq('+step+')');
   if(step.hasClass('active')) return;
   active = this.find('.step.active');
   active.find('.step-content').find('.wait-feedback').remove();
   active.removeClass('active').find('.step-content').stop().slideUp('normal');
   step.removeClass('done').addClass('active').find('.step-content').slideDown('normal');
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
