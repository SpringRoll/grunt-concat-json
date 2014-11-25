module.exports = function(grunt)
{
	var chalk = require("chalk");
	var stripJsonComments = require("strip-json-comments");
	var jsonlint = require("jsonlint");

	grunt.registerMultiTask("concat-json", "Merge Multiple JSON Files", function()
	{
		/*  prepare options  */
		var options = this.options(
		{
			replacer: null,
			space: "\t"
		});

		grunt.verbose.writeflags(options, "Options");

		/*  iterate over all src-dest file pairs  */
		this.files.forEach(function(f)
		{
			try
			{
				/*  start with an empty object  */
				var json = {};

				f.src.forEach(function(src)
				{
					/*  merge JSON file into object  */
					if (!grunt.file.exists(src))
						throw "JSON source file \"" + chalk.red(src) + "\" not found.";
					else
					{
						var fragment;
						grunt.log.debug("reading JSON source file \"" + chalk.green(src) + "\"");

						try
						{
							var withComments = grunt.file.read(src);
							var without = stripJsonComments(withComments);
							var linted = jsonlint.parse(without);

							fragment = {
								dir: '',
								// attach comment-less JSON
								json: linted
							};

							/* start a top level */
							var currentDir = json;

							/* remove .json extension */
							var path = src.replace(f.base + '/', '').replace('.json', '');

							var test = true;
							while (test)
							{
								test = testDirectory(path, currentDir);
							}

							/* 
							 * For each path, drill through each "folder" via the string path.
							 * If a corresponding object for the folder-name doesn't exist, create it.
							 * If no folders are left, use the name of the file as the object name.
							 * Insert json into it's file-name object
							 */
							function testDirectory(_path, _currentDir)
							{

								var firstSlash = _path.indexOf('/');
								if (firstSlash > 0)
								{
									var dir = _path.substr(0, _path.indexOf('/'));
									if (!_currentDir[dir])
									{
										_currentDir[dir] = {};
										json = grunt.util._.extend(json, _currentDir[dir]);
									}
									currentDir = _currentDir[dir];
									path = _path.substr(_path.indexOf('/') + 1);
									return true;
								}

								var insert = _currentDir;
								insert[_path] = fragment.json;
								return false;
							}

						}
						catch (e)
						{
							grunt.fail.warn(e);
						}
					}
				});

				/*  write object as new JSON  */
				grunt.log.debug("writing JSON destination file \"" + chalk.green(f.dest) + "\"");
				grunt.file.write(f.dest, JSON.stringify(json, options.replacer, options.space));
				grunt.log.writeln("File \"" + chalk.green(f.dest) + "\" created.");
			}
			catch (e)
			{
				grunt.fail.warn(e);
			}
		});
	});
};