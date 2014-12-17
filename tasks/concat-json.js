module.exports = function(grunt)
{
var chalk = require("chalk");
var stripJsonComments = require("strip-json-comments");
var jsonlint = require("jsonlint");

grunt.registerMultiTask("concat-json", "Merge Multiple JSON Files", function()
{
//prepare options
var options = this.options(
{
    replacer: null,
    space: "\t",
    folderArrayMarker : '[]'
});

grunt.verbose.writeflags(options, "Options");

//iterate over all src-dest file pairs
this.files.forEach(function(f)
{
    try
    {
        //start with an empty object
        var json = {};

        //save paths of unnamed arrays to prevent duplicates
        var arrDict = {};

        f.src.forEach(function(src)
        {
            //merge JSON file into object
            if (!grunt.file.exists(src))
            {
                throw "JSON source file \"" + chalk.red(src) + "\" not found.";
            }
            else
            {
                var fragment;
                grunt.log.debug("reading JSON source file \"" + chalk.green(src) + "\"");

                try
                {
                    //read the raw file
                    var withComments = grunt.file.read(src);
                    //strip the file of the comments
                    var without = stripJsonComments(withComments);
                    //lint the comment-free file
                    //if linting errors, terminal will let you know
                    var linted = jsonlint.parse(without);

                    fragment = {
                        dir: '',
                        //Attach comment-less JSON
                        json: linted
                    };

                    //Start a top level
                    var currentDir = json;

                    //Remove .json extension
                    var path = src.replace(f.base + '/', '').replace('.json', '');

                    var test = true;
                    while (test)
                    {
                        test = testDirectory(path, currentDir);
                    }

                    //For each path, drill through each "folder" via the string path.
                    //If a corresponding object for the folder-name does NOT exist, create it.
                    //If no folders are left, use the name of the file as the object name.
                    //Insert json into it's file-name object
                    function testDirectory(_path, _currentDir)
                    {
                        //test if there a '/', meaning there is a folder
                        //item in this path
                        var firstSlash = _path.indexOf('/');
                        if (firstSlash > -1)
                        {
                            var dir = _path.substr(0, _path.indexOf('/'));

                            var folderIsArray = dir.indexOf(options.folderArrayMarker) > -1;
                            if (folderIsArray)
                            {
                                //strip the folderArrayMarker from the dir
                                //so it doesn't appear in the json
                                dir = dir.substr(0, dir.indexOf(options.folderArrayMarker));
                            }

                            if (!_currentDir[dir])
                            {
                                if (folderIsArray)
                                {
                                    var dirIsArray = Array.isArray(_currentDir);
                                    if (dirIsArray)
                                    {
                                        if (!arrDict[dir])
                                        {
                                            // console.log('adding arrDict['+dir+']');
                                            arrDict[dir] = [];
                                            _currentDir.push([]);
                                        } else {
                                            // console.log(chalk.red('       arrDict['+dir+']'));
                                        }
                                    }
                                    else
                                    {
                                        _currentDir[dir] = [];
                                    }
                                }
                                else
                                {
                                    _currentDir[dir] = {};
                                }
                            }

                            currentDir = _currentDir[dir] || _currentDir[_currentDir.length-1];
                            path = _path.substr(_path.indexOf('/') + 1);
                            return true;
                        }

                        //if contained by an 'array folder'
                        if (Array.isArray(_currentDir))
                        {
                            _currentDir.push(fragment.json);
                        }
                        //using object notation
                        else
                        {
                            _currentDir[_path] = fragment.json;
                        }
                        return false;
                    }
                }
                catch (e)
                {
                    grunt.fail.warn(e);
                }
            }
        });

        //write object as new JSON
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
