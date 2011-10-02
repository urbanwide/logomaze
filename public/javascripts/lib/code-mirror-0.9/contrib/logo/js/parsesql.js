var SqlParser = Editor.Parser = (function() {

  function wordRegexp(words) {
    return new RegExp("^(?:" + words.join("|") + ")$", "i");
  }

  var functions = wordRegexp([
    "forward", "fd", "back", "bk", "left", "lt", "right", "rt", "penup", "pendown", "home", "clean", "clearscreen", "cs", "showturtle", "st", "hideturtle", "ht"
  ]);

  var keywords = wordRegexp([
    "repeat", "if", "ifelse", "to", "end"
  ]);

  var types = wordRegexp([
    
  ]);

  var operators = wordRegexp([    
    "\\+", "\\-", "\\*", "\\/", "\\[", "\\]", "\\^", "\\(", "\\)", "sin", "arcsin", "cos", "arccos", "tan", "arctan", "sqrt"
  ]);

  var operatorChars = /[*+\-<>=&|:\/]/;

  var tokenizeSql = (function() {
    function normal(source, setState) {
      var ch = source.next();
      if (ch == ":") {
        source.nextWhileMatches(/[\w\d]/);
        return "sql-var";
      }
//      else if (ch == "["){
//	    setState(inAlias(ch))
//	  	return null;
//      }
//      else if (ch == "\"" || ch == "'" || ch == "`") {
//        setState(inLiteral(ch));
//        return null;
//      }
//      else if (ch == "," || ch == ";") {
//        return "sql-separator"
//      }
//      else if (ch == '-') {
//        if (source.peek() == "-") {
//          while (!source.endOfLine()) source.next();
//          return "sql-comment";
//        }
//        else if (/\d/.test(source.peek())) {
//          source.nextWhileMatches(/\d/);
//          if (source.peek() == '.') {
//            source.next();
//            source.nextWhileMatches(/\d/);
//          }
//          return "sql-number";
//        }
//        else
//          return "sql-operator";
//      }
//      else if (operatorChars.test(ch)) {
//        source.nextWhileMatches(operatorChars);
//        return "sql-operator";
//      }
      else if (/\d/.test(ch)) {
        source.nextWhileMatches(/\d/);
        if (source.peek() == '.') {
          source.next();
          source.nextWhileMatches(/\d/);
        }
        return "sql-number";
      }
//      else if (/[()]/.test(ch)) {
//        return "sql-punctuation";
//      }
      else {
        source.nextWhileMatches(/[_\w\d]/);
        var word = source.get(), type;
        if (operators.test(word))
          type = "sql-operator";
        else if (keywords.test(word))
          type = "sql-keyword";
        else if (functions.test(word))
          type = "sql-function";
        else if (types.test(word))
          type = "sql-type";
        else
          type = "sql-word";
        return {style: type, content: word};
      }
    }

    function inAlias(quote) {
	  return function(source, setState) {
	    while (!source.endOfLine()) {
		  var ch = source.next();
		  if (ch == ']') {
		    setState(normal);
		    break;
		  }
	    }
	    return "sql-word";
	  }
    }

    function inLiteral(quote) {
      return function(source, setState) {
        var escaped = false;
        while (!source.endOfLine()) {
          var ch = source.next();
          if (ch == quote && !escaped) {
            setState(normal);
            break;
          }
          escaped = !escaped && ch == "\\";
        }
        return quote == "`" ? "sql-word" : "sql-literal";
      };
    }

    return function(source, startState) {
      return tokenizer(source, startState || normal);
    };
  })();

  function indentSql(context) {
    return function(nextChars) {
	return 0;	
      var firstChar = nextChars && nextChars.charAt(0);
      var closing = context && firstChar == context.type;
      if (!context)
        return 0;
      else if (context.align)
        return context.col - (closing ? context.width : 0);
      else
        return context.indent + (closing ? 0 : indentUnit);
    }
  }

  function parseSql(source) {
    var tokens = tokenizeSql(source);
    var context = null, indent = 0, col = 0;
    function pushContext(type, width, align) {
      context = {prev: context, indent: indent, col: col, type: type, width: width, align: align};
    }
    function popContext() {
      context = context.prev;
    }

    var iter = {
      next: function() {
        var token = tokens.next();
        var type = token.style, content = token.content, width = token.value.length;

        if (content == "\n") {
          token.indentation = indentSql(context);
          indent = col = 0;
          if (context && context.align == null) context.align = false;
        }
        else if (type == "whitespace" && col == 0) {
          indent = width;
        }
        else if (!context && type != "sql-comment") {
          pushContext(";", 0, false);
        }

        if (content != "\n") col += width;

        if (type == "sql-punctuation") {
          if (content == "(")
            pushContext(")", width);
          else if (content == ")")
            popContext();
        }
        else if (type == "sql-separator" && content == ";" && context && !context.prev) {
          popContext();
        }

        return token;
      },

      copy: function() {
        var _context = context, _indent = indent, _col = col, _tokenState = tokens.state;
        return function(source) {
          tokens = tokenizeSql(source, _tokenState);
          context = _context;
          indent = _indent;
          col = _col;
          return iter;
        };
      }
    };
    return iter;
  }

  return {make: parseSql, electricChars: ")"};
})();
