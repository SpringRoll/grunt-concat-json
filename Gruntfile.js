/**
 *  grunt-concat-json
 *
 *  Copyright (c) 2014 CloudKid
 *  Licensed under the MIT license.
 */
module.exports = function(grunt)
{
    'use strict';

    grunt.initConfig(
    {
        jshint:
        {
            all: [
                'Gruntfile.js',
                'tasks/*.js'
            ]
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('default', ['test', 'version:current']);
};
