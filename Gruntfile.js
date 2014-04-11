module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        localConfig: (function(){
                        try {
                            return grunt.file.readJSON('localConfig.json');
                        } catch(e) {
                            return {};
                        }
                    })(),
        releaseName: '<%= pkg.name %>-<%= pkg.version %>',
        releaseMessage: '<%= pkg.name %> release <%= pkg.version %>',
        clean: {
            buildProducts: "build/"
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
            files: ["src/**/*"],
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
            "build/scooch.zip": ["src/scooch.js", "src/scooch.css", "src/scooch-style.css"]
        },
        s3: {
            key: '<%= localConfig.aws.key %>',
            secret: '<%= localConfig.aws.secret %>',
            bucket: '<%= localConfig.aws.bucket %>',
            access: "public-read",
            headers: { "Cache-Control": "max-age=1200" },
            upload: [
                { // build
                    src: "build/*",
                    dest: "modules/scooch/<%= pkg.version %>/",
                    rel: "build"
                }
            ]
        },
        release: {
            options: {
                folder: '.',
                npm: false,
                bump: false,
                add: false,
                commit: false,
                file: 'bower.json',
                github: {
                    repo: 'mobify/scooch',
                    usernameVar: 'GITHUB_USERNAME',
                    passwordVar: 'GITHUB_TOKEN'
                }
            }
        }
    });

    // Load the task plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-css');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-s3');
    grunt.loadNpmTasks('grunt-clean');
    grunt.loadNpmTasks('grunt-release');

    // Default task(s).
    grunt.registerTask('serve', ['connect', 'watch']);
    grunt.registerTask('build', ['uglify', 'cssmin', 'zip']);
    grunt.registerTask('publish', ['build', 'release', 's3'])
    grunt.registerTask('default', 'build')

};