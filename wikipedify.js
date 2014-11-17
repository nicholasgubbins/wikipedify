var selectedText = false;
var currentText = "";

/**
* Sets the Spinner parameters (using spin.js)
*/
var opts = {
  lines: 11, // The number of lines to draw
  length: 8, // The length of each line
  width: 2, // The line thickness
  radius: 10, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 9, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1.2, // Rounds per second
  trail: 49, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};
var spinner = new Spinner(opts).spin();


var hoverBox = {

    classes: {
        box: '.hoverbox',
        noOverflowDiv: '.hoverbox_noverflow',
        loadingImg: '.hoverbox_loading'
    },

    ids: {
        top: '#hover_top',
        left: '#hover_left',
        right: '#hover_right',
        bottom: '#hover_bottom'
    },

   startHTML: function(id) {
        return '<div class="hoverbox arrow_box" id="' + id + '">' +
                    '<div class="hoverbox_noverflow">' +
                    '<img class="hoverbox_loading" alt="Loading Wiki...">'+
                    '<h2></h2>' +
                    '<p>';
    },

    endHTML:            '</p>' +
                    '</div>' +
                '</div>',

    html: {
        top: function() {
            return hoverBox.startHTML('hover_top') + hoverBox.endHTML;
        },
        left: function() {
            return hoverBox.startHTML('hover_left') + hoverBox.endHTML;
        },
        right: function() {
            return hoverBox.startHTML('hover_right') + hoverBox.endHTML;
        },
        bottom: function() {
            return hoverBox.startHTML('hover_bottom') + hoverBox.endHTML;
        },
    },

    /**
     * Sets the inner HTML of the box
     */
    setHTML: function(html) {
        $(this.classes.box + ' > ' + this.classes.noOverflowDiv + ' > p').html(html);
    },

    /**
     * Injects the HTML necessary to display the popup box
     */
    appendBoxToBody: function () {
    	
        if (this.element_Top === null) {
        	
            $('body').append(this.html.top())
                     .append(this.html.left())
                     .append(this.html.right())
                     .append(this.html.bottom());
        }
        
    },

    /**
     * Injects the HTML and Creates the jquery element for the popup box
     */
    initialiseHoverBoxElement: function() {
        this.appendBoxToBody();
        this.element_Top = $(this.ids.top);
        this.element_Left = $(this.ids.left);
        this.element_Right = $(this.ids.right);
        this.element_Bottom = $(this.ids.bottom);
    },

    element_Top: null,
    element_Right: null,
    element_Left: null,
    element_Bottom: null,

    showElement: function(x, y) {
    	
        var boxWidth = hoverBox.element_Top.outerWidth();
        var boxHeight = hoverBox.element_Top.outerHeight();
        var wind = $(window);
      
        if (x - boxWidth / 2 < 0) {
            hoverBox.hideElements();
            hoverBox.element_Right.show();
        } else if (x + boxWidth / 2 > wind.width()) {
            hoverBox.hideElements();
            hoverBox.element_Left.show();
        } else if (y - boxHeight - 30 < wind.scrollTop()) {
            hoverBox.hideElements();
            hoverBox.element_Bottom.show();
        } else {
            hoverBox.hideElements();
            hoverBox.element_Top.show();
        }
    },

    hideElements: function() {
        hoverBox.element_Right.hide();
        hoverBox.element_Left.hide();
        hoverBox.element_Top.hide();
        hoverBox.element_Bottom.hide();
    },

    /**
     * Sets the x,y position of the popup box
     */
    setPosition: function(x, y) {

        var boxWidth = hoverBox.element_Top.outerWidth();
        var boxHeight = hoverBox.element_Top.outerHeight();

        var top = {
            box: y - boxHeight - 30,
            bottomBox: y + 30,
            leftBox: y - boxHeight / 2,
            rightBox: y - boxHeight / 2
        };

        var left = {
            box: x - boxWidth / 2,
            bottomBox: x - boxWidth / 2,
            leftBox: x - boxWidth - 30,
            rightBox: x + 30
        };

        this.element_Top.css(
            {
                top: top.box,
                left: left.box
            }
        );

        this.element_Right.css(
            {
                top: top.rightBox,
                left: left.rightBox
            }
        );

        this.element_Left.css(
            {
                top: top.leftBox,
                left: left.leftBox
            }
        );

        this.element_Bottom.css(
            {
                top: top.bottomBox,
                left: left.bottomBox
            }
        );
    }
};


/**
 * Returns the HTML hyperlink to the wikipedia article based on title
 */
function linkifyTitle(title){
	return '<a href="http://en.wikipedia.org/wiki/' + title.replace(/ /g, '_') + '" target="_blank" id="wikilink">';
}


/**
 * Cleans up and returns HTML for certain articles' first paragraphs including:
 * - articles with disambigution (many different possible articles)
 * - articles with headers before the first paragraph
 */
function cleanUpHTML(html){
	var ret = html;
	var referTo = ret.indexOf("refer to:");
	var referToNoColon = ret.indexOf("refer to</p>");
	if (referTo > -1 ){
		ret = ret.substr(0, referTo) + "refer to multipe things.</p>";
	}
	else if (referToNoColon > -1 ){
		ret = ret.substr(0, referToNoColon) + "refer to multipe things.</p>";
	}
	var includingList = ret.indexOf(", including:");
	if (includingList > -1){
		ret = ret.substr(0, includingList) + ".</p>";
	}
	var dl = ret.indexOf("</dl>");
	if (dl > -1){
		ret = ret.substr(dl+5);
	}
	return ret;
}


/**
 * Adds the title link to the HTML in the correct place
 */
function addLinkHTML(html, title){
	var link = linkifyTitle(title);
	var firstBoldStart = html.indexOf("<b>");
	var ret = html;
	ret = ret.substr(0, firstBoldStart) + link + ret.substr(firstBoldStart);
	var firstBoldEnd = ret.indexOf("</b>") + 4;
	ret = ret.substr(0, firstBoldEnd) + "</a>" + ret.substr(firstBoldEnd);
	ret = cleanUpHTML(ret);
	return ret;
}

/**
 * Returns the Title and the first paragraph
 * if the first paragraph is too short (just a <br> as found in some articles), it also gets the first real paragraph
 * note that the key to get the data is unique per request so key is extracted in line 197 (always only one key in the object)
 */
function getTitleAndParagraph(data) {
	try	{
		var keys = [];
		for(var k in data.query.pages) keys.push(k);
	    var paragraph = data.query.pages[keys[0]].extract;

		if (paragraph == ""){
			throw err;
		}

		var firstParaIndex = paragraph.indexOf("</p>") + 4;
		paragraph = paragraph.substring(0,firstParaIndex);

		if (paragraph.length < 15){
			var newParagraph = data.query.pages[keys[0]].extract.substring(firstParaIndex+1);
			newParaIndex = newParagraph.indexOf("</p>") + 4;
			newParagraph = newParagraph.substring(0,newParaIndex);
			paragraph = newParagraph;
		}

   		var title = data.query.pages[keys[0]].title;
    	paragraph = addLinkHTML(paragraph, title);	
    	return paragraph;
    }
    catch(err) {
        return "No Wikipedia article for this content";
    }
}

/**
 * Initialises the hoverbox as well as calls the wikimedia API and setting the data
 * params x, y are the coordinates from the click
 */
function fetchWiki(pageTitle, x, y) {

    hoverBox.initialiseHoverBoxElement();
    hoverBox.setPosition(x,y);
    hoverBox.setHTML(spinner.el);
    hoverBox.showElement();
  	
    $.getJSON("https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=" + pageTitle + "&redirects=",  
        function(data) {
            var result = getTitleAndParagraph(data);
            hoverBox.setHTML(result);
            hoverBox.setPosition(x,y);
            hoverBox.showElement(x, y);
        }
    );
}


/**
 * Returns selected text from the page
 */
function getSelected() {
  text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
        
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    if (text != "") return text;
    else {
    	return false;
    }
}


/**
 * Click listener that checks for mouseup and looks for selected text
 */
$(function(){
	$('body').mouseup(function(e) {
  		if (selectedText){
  			hoverBox.hideElements();
  		}
   		var selection = getSelected();
      	if (selection && (selection != currentText)) {
  	  		fetchWiki(selection, e.pageX, e.pageY);
      		selectedText = true;
      		currentText = selection;
  		}
  		else {
  			selectedText = false;
  			currentText = "";
  		}
 	});
});