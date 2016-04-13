module.exports = function(grunt) {
    // JS eslint targets
    var lint = {
        targets: [
            'src/**/*.js'
        ]
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        localConfig: (function() {
            try {
                return grunt.file.readJSON('localConfig.json');
            } catch (e) {
                return {};
            }
        })(),
        clean: {
            buildProducts: 'build/'
        },
        connect: {
            server: {
                options: {
                    hostname: '0.0.0.0',
                    port: 3000,
                    base: '.'
                }
            }
        },
        watch: {
            files: [
                'src/**/*',
                'examples/**/*'
            ],
            tasks: ['build']
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/scooch.js',
                dest: 'build/scooch.min.js'
            }
        },
        cssmin: {
            core: {
                src: 'src/scooch.css',
                dest: 'build/scooch.min.css'
            },
            style: {
                src: 'src/scooch-style.css',
                dest: 'build/scooch-style.min.css'
            }
        },
        zip: {
            'build/scooch.zip': ['src/scooch.js', 'src/scooch.css', 'src/scooch-style.css']
        },
        eslint: {
            prod: {
                src: lint.targets,
                options: {
                    reset: true,
                    config: require.resolve('mobify-code-style/javascript/.eslintrc-prod')
                }
            },
            dev: {
                src: lint.targets,
                options: {
                    reset: true,
                    config: require.resolve('mobify-code-style/javascript/.eslintrc')
                }
            }
        },
        open: {
            examples: {
                path: 'http://localhost:3000/examples',
                app: 'Google Chrome'
            }
        }
    });

    // Load the task plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-css');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-clean');

    // Default task(s).
    grunt.registerTask('examples', ['build', 'connect:server', 'open:examples', 'watch']);
    grunt.registerTask('lint', ['eslint:prod']);
    grunt.registerTask('serve', ['connect', 'watch']);
    grunt.registerTask('build', ['lint', 'uglify', 'cssmin', 'zip']);
    grunt.registerTask('default', 'build');
};
