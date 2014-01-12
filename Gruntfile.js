module.exports = function (grunt) {
	
	grunt.registerTask('watch', ['watch']);

	grunt.initConfig({
		less: {
			style: {
				files: {
					'css/style.css': 'css/style.less'
				}
			}
		},
		watch: {
			css: {
				files: ['css/*.less'],
				tasks: ['less:style'],
				options: {
					livereload: true
				}
			},
			js: {
				files: ['js/*.js'],
				options: {
					livereload: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');

}