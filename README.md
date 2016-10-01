# Materialize-stepper
###v1.0
A little plugin, inspired by [MDL-Stepper](https://getmdl.io), that implements a stepper to Materializecss framework.

*Demo = http://codepen.io/Kinark/full/VKrjJp/  
*Ps.: for some reason, callback screen isn't working on codepen. I promise to make a better demo soon!

## Getting Started

First of all, sorry for the bad english. Also, I don't know how to work with github yet. Yeah.
It's simple (really simples), small, bugged and has lack of resources, but it is the first version so... Wait for more (???) and... HELP ME!!!

### Prerequisities

Since it is still a implementation to [Materializecss framework](http://materializecss.com/), you'll need it implemented. So as [jQuery Validation Plugin](https://jqueryvalidation.org/), the plugin use it to verify required inputs to proceed or not,

```
- jQuery (obviously)
- Materializecss framework
- Google Material Icons (
- jQuery Validation Plugin
```

### Installing

You just need to import te .css and the .js files after you load the prerequisites above listed:

```html
<!-- Compiled and minified CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/css/materialize.min.css">
<!--Import Google Icon Font-->
<link href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<!--Import Materialize-Stepper CSS -->
<link rel="stylesheet" href="css/materialize-stepper.css">

<!-- jQuery -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
<!-- Compiled and minified JavaScript -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/js/materialize.min.js"></script>
<!--Import Materialize-Stepper JavaScript -->
<script src="js/materialize-stepper.js"></script>

```

## Usage

It doesn't have an horizontal version yet. The HTML base is like this:

```html
<ul class="stepper linear">
   <li class="step active">
      <div class="step-title waves-effect waves-dark">E-mail</div>
      <div class="step-content">
         <div class="row">
            <div class="input-field col s6">
               <input id="email" name="email" type="email" class="validate" required>
               <label for="first_name">Your e-mail</label>
            </div>
         </div>
         <div class="step-actions">
            <button class="waves-effect waves-dark btn next-step">CONTINUE</button>
         </div>
      </div>
   </li>
   <li class="step">
      <div class="step-title waves-effect waves-dark">Passo 2</div>
      <div class="step-content">
         <div class="row">
            <div class="input-field col s6">
               <input id="password" name="password" type="password" class="validate" required>
               <label for="password">Your password</label>
            </div>
         </div>
         <div class="step-actions">
            <button class="waves-effect waves-dark btn next-step">CONTINUE</button>
            <button class="waves-effect waves-dark btn-flat previous-step">BACK</button>
         </div>
      </div>
   </li>
   <li class="step">
      <div class="step-title waves-effect waves-dark">Fim!</div>
      <div class="step-content">
         Finish!
         <div class="step-actions">
            <button class="waves-effect waves-dark btn" type="submit">SUBMIT</button>
         </div>
      </div>
   </li>
</ul>
```

After that you'll need to initialize it through:

```html
<script>
$('.stepper').activateStepper();
</script>
```

## Explanation

Every class explains very well it's function, so... Everything runs inside a ul with ".stepper" class:

```html
<ul class="stepper linear">
```

Each step runs inside a li tag with the class ".step": 

```html
<li class="step">
```

Insdie each step there is two divs. The step-tile, where you put the title of... guess what...

```html
<div class="step-title waves-effect waves-dark">First step</div>
```

And the step-content, that holds the information:

```html
<div class="step-content">
```

There's the step-actions container inside step-content, which holds the buttons:

```html
<div class="step-actions">

```

And finally there is the buttons, which proceed (.next-step class) or return (.previous-step class):

```html
<button class="waves-effect waves-dark btn next-step">CONTINUE</button>
<button class="waves-effect waves-dark btn-flat previous-step">BACK</button>
```

## Options

###Linear and non-linear

All the strcture runs under a ul tag with a .stepper class.

```html
<ul class="stepper linear">
```

If you want the users to change between steps freely (without validations or use CONTINUE/BACK buttons), just remove .linear class from there:

```html
<ul class="stepper">
```

###Form and inputs

The JS spawns a form wrapping the ul for the validate.js to work with the inputs. Since the primary funcion of stepper is to split some kind a form, for now, the only way to make a step required is to add "required" attribute to an input inside the .step-content container:

```html
<input id="email" name="email" type="email" class="validate" required>
```

If the input is not valid, the icon will turn red until user click proceed again (or press enter).

In the last step, if a callback is not defined (we'll talk about it later), the form will be submited, and you can define the method and the action of it through two attributes in the principal ul:

```html
<ul class="stepper linear" data-method="GET" data-action="page.php">
```

Which works just as the method and action of the default form we all know.

###Navigate

There is three ways to navigate through steps.

One is by clicking, if you are not using the linear class. The second way is by the buttons:

```html
<!-- If you want the button to proceed, give it a .next-step class -->
<button class="waves-effect waves-dark btn next-step">CONTINUE</button>
<!-- If you want the button to return, give it a .previous-step class -->
<button class="waves-effect waves-dark btn-flat previous-step">BACK</button>
<!-- If you want the button to submit the form, give it no additional classes and define type="submit" -->
<button class="waves-effect waves-dark btn" type="submit">SUBMIT</button>
```

The third way is by navigating programatically and, for that, there is three JS functions:

To proceed one step:
```html
$('.steper').nextStep();
```

To return one step:
```html
$('.steper').prevStep();
```

And to jump to a specific step:
```html
//Just pass the number of the step wanted as a parameter
$('.steper').openStep(2);
```

###Callback/feedback

There is a way to make the button run a function instead of proceeding, just add a data-feedback attribute with the function name to a ".next-step" classified button. Just like that:

```html
<button class="waves-effect waves-dark btn next-step" data-feedback="checkEmailDB">CONTINUE</button>
```

When the user press the button, a loading screen will overlay everything, making the user unable to proceed until you trigger the nextStep function manually. It's useful when you need to check if a e-mail exists in database through AJAX, for example.

To dimiss the feedback loading screen you just need, as I said, to trigger nextStep function:

```html
$('.steper').nextStep();
```

If you want to dimss but doesn't proceed, you just call:

```html
$('.steper').destroyFeedback();
```

And if for some reason you want to active the feedback screen, just call:

```html
$('.steper').activateFeedback();
```

It's also useful if you don't want the form to submit in the end.

## Built With

* Atom - ergaerga

## Authors

* **Igor Marcossi** - *Initial work* - [Kinark](https://github.com/Kinark)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

* THANK YOU [MDL-Stepper](https://getmdl.io) FOR IDEAS AND A LITTLE OF CSS!
