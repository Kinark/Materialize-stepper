Package.describe({
    name: 'materialize-stepper',
    version: '2.1.4',
    summary: 'A little plugin, inspired by MDL-Stepper, that implements a stepper to Materializecss framework.',
    git: 'https://github.com/TristanWiley/Meteor-Material-Stepper',
    documentation: 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.5');
    api.use('ecmascript');
    api.use('jquery', 'client');
    api.mainModule('materialize-stepper.js', 'client');
    api.addFiles('materialize-stepper.css', 'client');
});
