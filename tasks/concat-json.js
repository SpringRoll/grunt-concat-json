module.exports = function (grunt)
{
	var chalk = require("chalk");
	var stripJsonComments = require("strip-json-comments");
	var jsonlint = require("jsonlint");

	grunt.registerMultiTask("concat-json", "Merge Multiple JSON Files", function ()
	{
		// prepare options
		var options = this.options(
		{
			replacer: null,
			space: "",
			folderArrayMarker: '[]'
		});

		grunt.verbose.writeflags(options, "Options");

		// Iterate over all src-dest file pairs
		this.files.forEach(function (f)
		{
			try
			{
				// Start with an empty object
				var json = {};

				// Save paths of unnamed arrays to prevent duplicates
				var arrDict = {};

				// Add fragments
				f.src.forEach(function (src)
				{

					// Merge JSON file into object
					if (!grunt.file.exists(src))
					{
						throw "JSON source file \"" + chalk.red(src) + "\" not found.";
					}
					else
					{
						var fragment;

						try
						{
							// Read the raw file
							var withComments = grunt.file.read(src);

							// Strip the file of the comments
							var without = stripJsonComments(withComments);

							// Lint the comment-free file.
							// If linting errors, terminal will let you know!
							var linted = jsonlint.parse(without);

							fragment = {
								dir: '',
								// Attach comment-less JSON
								json: linted
							};

							// Start a top level
							var currentDir = json;

							// Remove the path to the contianer,
							// and the .json extension
							var path = src.replace(f.base + '/', '').replace('.json', '');

							var test = true;
							while (test)
							{
								test = testDirectory(path, currentDir);
							}

							/**
							 *
							 *
							 * @param {String}
							 * @param {String}
							 */
							function testDirectory(_path, _currentDir)
							{
								var _currentDirIsArray = Array.isArray(_currentDir);

								// If the is a slash, we have a parent folder
								var firstSlash = _path.indexOf('/');
								if (firstSlash > -1)
								{
									var dir = _path.slice(0, firstSlash);
									if (grunt.util._.has(_currentDir, dir) === false)
									{
										_currentDir[dir] = {};
									}

									currentDir = _currentDir[dir];
									path = _path.slice(firstSlash + 1);
									return true;
								}

								_currentDir[path] = fragment.json;
								return false;
							}
						}
						catch (e)
						{
							grunt.fail.warn(e);
						}
					}
				});

				/**
				 * Search the JSON object for the folders (now object keys) that
				 * were marked to be arrays, convert the values to array items.
				 * Process removes the folderArrayMarker from the final JSON file,
				 * so you can access keys in code without the special symbol.
				 * i.e. if folderArrayMarker is the default '[]' then
				 * the "directory[]": key becomes "directory"
				 *
				 * Reminder, if an folder-array is nested in a folder-array, only
				 * the top level folder-array will get a name change, as the children
				 * arrays will become nameless array index items.
				 *
				 * @param {Object} _obj
				 */
				var convertArrayMarkedFolders = function (_obj)
				{
					if (typeof _obj !== 'object')
					{
						return false;
					}

					for (var key in _obj)
					{
						convertArrayMarkedFolders(_obj[key]);
						// Check all keys for the folderArrayMarker
						var indexOfMarker = key.indexOf(options.folderArrayMarker);
						var folderIsArray = indexOfMarker > -1;
						if (folderIsArray)
						{
							/* Send contents through recursively before doing
							 * the contents copy.
							 * The process removes all but the top level key. */
							convertArrayMarkedFolders(_obj[key]);

							var contents = _obj[key];
							/* Push the values one by one of the original key
							 * into a new fresh array who's key has the
							 * folderArrayMarker removed from it */
							var keyWithoutMarker = key.slice(0, indexOfMarker);
							_obj[keyWithoutMarker] = [];
							for (var k in contents)
							{
								_obj[keyWithoutMarker].push(contents[k]);
							}

							// Delete the original marker key.
							delete _obj[key];
						}
					}
				};

				convertArrayMarkedFolders(json);

				// Write object as new JSON
				grunt.log.debug(
					"writing JSON destination file \"" +
					chalk.green(f.dest) +
					"\"");

				grunt.file.write(
					f.dest,
					JSON.stringify(json, options.replacer, options.space));

				grunt.log.writeln("File \"" +
					chalk.green(f.dest) +
					"\" created.");
			}
			catch (e)
			{
				grunt.fail.warn(e);
			}
		});
	});
};
