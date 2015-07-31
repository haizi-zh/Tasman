htmlStyleRemove = function (html) {
  var htmlStr = html,
      html = "";
  UniHTML.parse(htmlStr, {
    start: function(tagName, attrOnTag, isSelfClose) {
      html = html + "<" + tagName + " ";
      attrOnTag.map(function(attrObj) {
        "style" === attrObj.name ? "" : html = html + attrObj.name + "=" + attrObj.value
      });
      html = html + ">";
    },
    end: function(tagName) {
      html = html + "</" + tagName + ">";
    },
    chars: function(text) { // text between open and closing tag
      html = html + text;
    },
    comment: function(text) {  // text from comment
      // TODO
    }
  });
  return UniHTML.purify(html, {noFormatting: true});
}

