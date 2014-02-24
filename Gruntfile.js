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
            all: {
                files: ['**/*.js', '!**/node_modules/**', '**/*.css', '**/*.html'],
                options: {
                    livereload: true
                }
            },
			css: {
				files: ['css/*.less'],
				tasks: ['less:style']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');

}