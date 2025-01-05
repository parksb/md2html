# md2html

`md2html` is a tool for converting Markdown to HTML, with support for customizable templates.

```
Usage: md2html [FILE] [-o FILE] [-t NAME]

Commands:
  md2html [input]     Convert a markdown to HTML                       [default]
  md2html templates   Show available templates

Positionals:
  input  Input file path                                                [string]

Options:
      --version   Show version number                                  [boolean]
      --help      Show help                                            [boolean]
  -o, --output    Output file path                                      [string]
  -t, --template  Template name                    [string] [default: "default"]
      --toc-min   Minimum heading level to include in the table of contents
                                                           [number] [default: 2]
      --toc-max   Maximum heading level to include in the table of contents
                                                           [number] [default: 4]
      --html      Allow HTML in the input             [boolean] [default: false]

Examples:
  md2html input.md -o output.html       Convert input.md to output.html.
  cat input.md | md2html > output.html  Convert input.md to output.html.
```

## Installation

Install `md2html` using npm (or any package manager of your choice).

```sh
$ npm install -g @parksb/md2html
```

For macOS users, md2html is also available via Homebrew.

```sh
$ brew install parksb/x/md2html
```

## Usage

You can generate HTML directly to stdout by passing Markdown text via stdin.

```
$ echo "# Title" | md2html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
  </head>
  <body>
    <h1 id="title" tabindex="-1">Title</h1>
  </body>
</html>
```

The key feature is its support for customizable templates. You can specify a template using the `-t` option to tailor the output to your needs.

```
$ cat input.md | md2html -t paper
```

The following templates are included by default:

- `pure`
- `paper`
- `github`

If no template is specified, the default template(`pure`) is used.

You can create your own templates by adding them to the templates directory. To find the template directory, run with the `templates` command.

```
$ md2html templates
/path/to/templates
default
github
paper
pure
```

To add a custom template, create a `.ejs` file in the template directory(e.g., `/path/to/templates`). The template file can use two variables: `document.title` and `document.html`. Refer to the `pure` template for a simple example of how to structure a custom template.
