module.exports = function(grunt) {

	var 
		_ = grunt.util._
		, LESS_PATHS = [
			'src/less'
			, 'src/bower_components/bootstrap/less'
		]
	;

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')

		, requirejs: {
			compile: {
				options: {
					baseUrl: 'src/js'
					, mainConfigFile: 'src/js/main.js'
					, out: 'dist/js/main.min.js'
					, name: 'main'
					, insertRequire: ['main']
					, optimize: 'uglify'
				}
			}
		}

		, less: {
			dev: {
				options: {
					sourceMap: true
					, sourceMapURL: '/css/styles.css.map'
					, paths: LESS_PATHS
				}
				, files: {
					'src/css/styles.css': [
						'src/less/styles.less'
					]
				}
			}
			, dist: {
				options: {
					cleancss: true
					, paths: LESS_PATHS
				}
				, files: {
					'src/css/styles.css': [
						'src/less/styles.less'
					]
				}
			}
		}

		, watch: {
			less: {
				files: [
					'src/less/**/*.less'
				]
				, tasks: ['less:dev']
				, options: {
					livereload: true,
				}
			}
			, all: {
				files: [
					'src/**/*.html'
					, 'src/js/**/*.js'
					, 'src/data/**/*.{json,xml}'
				]
				, tasks: []
				, options: {
					livereload: true,
				}
			}
		}

		, connect: {
			dev: {
				options: {
					base: 'src'
				}
			}
			, live: {
				options: {
					base: 'dist'
					, keepalive: true
				}
			}
		}

		, clean: ['dist']

		, copy: {
			js: {
				cwd: 'src'
				, expand: true
				, src: 'js/**/*.min.js'
				, dest: 'dist'
			}
			, css: {
				cwd: 'src'
				, expand: true
				, src: 'css/**/*.css'
				, dest: 'dist'
			}
			, sound: {
				cwd: 'src'
				, expand: true
				, src: ['audio/**/*.mp3', 'audio/**/*.ogg']
				, dest: 'dist'
			}
			, markup: {
				cwd: 'src'
				, expand: true
				, src: ['**/*.html', '!**/bower_components/**']
				, dest: 'dist'
				, options: {
					process: function (content, srcpath) {
						var r = content.replace(/main.js/g, 'main.min.js');
						r = r.replace(/<!-- livereload -->(.|[\r\n])*<!-- livereload -->/gm, '');
						return r
					}
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('package', [
		'clean'
		, 'less:dist'
		, 'requirejs'
		, 'copy'
	]);

	grunt.registerTask('server', function(target) {
		grunt.task.run([
			'less:dev'
			, 'connect:dev'
			, 'watch'
		]);
	});

	grunt.registerTask('server-live', function(target) {
		grunt.task.run([
			'package'
			, 'connect:live'
		]);
	});

	grunt.registerTask('default', ['server']);	
};