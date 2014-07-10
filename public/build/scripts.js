/*!
 * Modernizr v2.8.2
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.8.2',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = '';
          //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
          fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq) && matchMedia(mq).matches || false;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   goo.gl/v3V4Gp
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /**
     * @preserve HTML5 Shiv prev3.7.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
     */
    ;(function(window, document) {
        /*jshint evil:true */
        /** version */
        var version = '3.7.0';

        /** Preset options */
        var options = window.html5 || {};

        /** Used to skip problem elements */
        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

        /** Not all elements can be cloned in IE **/
        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

        /** Detect whether the browser supports default html5 styles */
        var supportsHtml5Styles;

        /** Name of the expando, to work with multiple documents or to re-shiv one document */
        var expando = '_html5shiv';

        /** The id for the the documents expando */
        var expanID = 0;

        /** Cached data for each document */
        var expandoData = {};

        /** Detect whether the browser supports unknown elements */
        var supportsUnknownElements;

        (function() {
          try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
          } catch(e) {
            // assign a false positive if detection fails => unable to shiv
            supportsHtml5Styles = true;
            supportsUnknownElements = true;
          }

        }());

        /*--------------------------------------------------------------------------*/

        /**
         * Creates a style sheet with the given CSS text and adds it to the document.
         * @private
         * @param {Document} ownerDocument The document.
         * @param {String} cssText The CSS text.
         * @returns {StyleSheet} The style element.
         */
        function addStyleSheet(ownerDocument, cssText) {
          var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

          p.innerHTML = 'x<style>' + cssText + '</style>';
          return parent.insertBefore(p.lastChild, parent.firstChild);
        }

        /**
         * Returns the value of `html5.elements` as an array.
         * @private
         * @returns {Array} An array of shived element node names.
         */
        function getElements() {
          var elements = html5.elements;
          return typeof elements == 'string' ? elements.split(' ') : elements;
        }

        /**
         * Returns the data associated to the given document
         * @private
         * @param {Document} ownerDocument The document.
         * @returns {Object} An object of data.
         */
        function getExpandoData(ownerDocument) {
          var data = expandoData[ownerDocument[expando]];
          if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
          }
          return data;
        }

        /**
         * returns a shived element for the given nodeName and document
         * @memberOf html5
         * @param {String} nodeName name of the element
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived element.
         */
        function createElement(nodeName, ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
          }
          if (!data) {
            data = getExpandoData(ownerDocument);
          }
          var node;

          if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
          } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
          } else {
            node = data.createElem(nodeName);
          }

          // Avoid adding some elements to fragments in IE < 9 because
          // * Attributes like `name` or `type` cannot be set/changed once an element
          //   is inserted into a document/fragment
          // * Link elements with `src` attributes that are inaccessible, as with
          //   a 403 response, will cause the tab/window to crash
          // * Script elements appended to fragments will execute when their `src`
          //   or `text` property is set
          return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
        }

        /**
         * returns a shived DocumentFragment for the given document
         * @memberOf html5
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived DocumentFragment.
         */
        function createDocumentFragment(ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
          }
          data = data || getExpandoData(ownerDocument);
          var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
          for(;i<l;i++){
            clone.createElement(elems[i]);
          }
          return clone;
        }

        /**
         * Shivs the `createElement` and `createDocumentFragment` methods of the document.
         * @private
         * @param {Document|DocumentFragment} ownerDocument The document.
         * @param {Object} data of the document.
         */
        function shivMethods(ownerDocument, data) {
          if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
          }


          ownerDocument.createElement = function(nodeName) {
            //abort shiv
            if (!html5.shivMethods) {
              return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
          };

          ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                          'var n=f.cloneNode(),c=n.createElement;' +
                                                          'h.shivMethods&&(' +
                                                          // unroll the `createElement` calls
                                                          getElements().join().replace(/[\w\-]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
          }) +
            ');return n}'
                                                         )(html5, data.frag);
        }

        /*--------------------------------------------------------------------------*/

        /**
         * Shivs the given document.
         * @memberOf html5
         * @param {Document} ownerDocument The document to shiv.
         * @returns {Document} The shived document.
         */
        function shivDocument(ownerDocument) {
          if (!ownerDocument) {
            ownerDocument = document;
          }
          var data = getExpandoData(ownerDocument);

          if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                                          // corrects block display not defined in IE6/7/8/9
                                          'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                            // adds styling not present in IE6/7/8/9
                                            'mark{background:#FF0;color:#000}' +
                                            // hides non-rendered elements
                                            'template{display:none}'
                                         );
          }
          if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
          }
          return ownerDocument;
        }

        /*--------------------------------------------------------------------------*/

        /**
         * The `html5` object is exposed so that more elements can be shived and
         * existing shiving can be detected on iframes.
         * @type Object
         * @example
         *
         * // options can be changed before the script is included
         * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
         */
        var html5 = {

          /**
           * An array or space separated string of node names of the elements to shiv.
           * @memberOf html5
           * @type Array|String
           */
          'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

          /**
           * current version of html5shiv
           */
          'version': version,

          /**
           * A flag to indicate that the HTML5 style sheet should be inserted.
           * @memberOf html5
           * @type Boolean
           */
          'shivCSS': (options.shivCSS !== false),

          /**
           * Is equal to true if a browser supports creating unknown/HTML5 elements
           * @memberOf html5
           * @type boolean
           */
          'supportsUnknownElements': supportsUnknownElements,

          /**
           * A flag to indicate that the document's `createElement` and `createDocumentFragment`
           * methods should be overwritten.
           * @memberOf html5
           * @type Boolean
           */
          'shivMethods': (options.shivMethods !== false),

          /**
           * A string to describe the type of `html5` object ("default" or "default print").
           * @memberOf html5
           * @type String
           */
          'type': 'default',

          // shivs the document according to the specified `html5` object options
          'shivDocument': shivDocument,

          //creates a shived element
          createElement: createElement,

          //creates a shived documentFragment
          createDocumentFragment: createDocumentFragment
        };

        /*--------------------------------------------------------------------------*/

        // expose html5
        window.html5 = html5;

        // shiv the document
        shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);

/*! Respond.js v1.4.2: min/max-width media query polyfill * Copyright 2013 Scott Jehl
 * Licensed under https://github.com/scottjehl/Respond/blob/master/LICENSE-MIT
 *  */

!function(a){"use strict";a.matchMedia=a.matchMedia||function(a){var b,c=a.documentElement,d=c.firstElementChild||c.firstChild,e=a.createElement("body"),f=a.createElement("div");return f.id="mq-test-1",f.style.cssText="position:absolute;top:-100em",e.style.background="none",e.appendChild(f),function(a){return f.innerHTML='&shy;<style media="'+a+'"> #mq-test-1 { width: 42px; }</style>',c.insertBefore(e,d),b=42===f.offsetWidth,c.removeChild(e),{matches:b,media:a}}}(a.document)}(this),function(a){"use strict";if(a.matchMedia&&a.matchMedia("all").addListener)return!1;var b=a.matchMedia,c=b("only all").matches,d=!1,e=0,f=[],g=function(){a.clearTimeout(e),e=a.setTimeout(function(){for(var c=0,d=f.length;d>c;c++){var e=f[c].mql,g=f[c].listeners||[],h=b(e.media).matches;if(h!==e.matches){e.matches=h;for(var i=0,j=g.length;j>i;i++)g[i].call(a,e)}}},30)};a.matchMedia=function(e){var h=b(e),i=[],j=0;return h.addListener=function(b){c&&(d||(d=!0,a.addEventListener("resize",g,!0)),0===j&&(j=f.push({mql:h,listeners:i})),i.push(b))},h.removeListener=function(a){for(var b=0,c=i.length;c>b;b++)i[b]===a&&i.splice(b,1)},h}}(this),function(a){"use strict";function b(){u(!0)}var c={};a.respond=c,c.update=function(){};var d=[],e=function(){var b=!1;try{b=new a.XMLHttpRequest}catch(c){b=new a.ActiveXObject("Microsoft.XMLHTTP")}return function(){return b}}(),f=function(a,b){var c=e();c&&(c.open("GET",a,!0),c.onreadystatechange=function(){4!==c.readyState||200!==c.status&&304!==c.status||b(c.responseText)},4!==c.readyState&&c.send(null))};if(c.ajax=f,c.queue=d,c.regex={media:/@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi,keyframes:/@(?:\-(?:o|moz|webkit)\-)?keyframes[^\{]+\{(?:[^\{\}]*\{[^\}\{]*\})+[^\}]*\}/gi,urls:/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,findStyles:/@media *([^\{]+)\{([\S\s]+?)$/,only:/(only\s+)?([a-zA-Z]+)\s?/,minw:/\([\s]*min\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/,maxw:/\([\s]*max\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/},c.mediaQueriesSupported=a.matchMedia&&null!==a.matchMedia("only all")&&a.matchMedia("only all").matches,!c.mediaQueriesSupported){var g,h,i,j=a.document,k=j.documentElement,l=[],m=[],n=[],o={},p=30,q=j.getElementsByTagName("head")[0]||k,r=j.getElementsByTagName("base")[0],s=q.getElementsByTagName("link"),t=function(){var a,b=j.createElement("div"),c=j.body,d=k.style.fontSize,e=c&&c.style.fontSize,f=!1;return b.style.cssText="position:absolute;font-size:1em;width:1em",c||(c=f=j.createElement("body"),c.style.background="none"),k.style.fontSize="100%",c.style.fontSize="100%",c.appendChild(b),f&&k.insertBefore(c,k.firstChild),a=b.offsetWidth,f?k.removeChild(c):c.removeChild(b),k.style.fontSize=d,e&&(c.style.fontSize=e),a=i=parseFloat(a)},u=function(b){var c="clientWidth",d=k[c],e="CSS1Compat"===j.compatMode&&d||j.body[c]||d,f={},o=s[s.length-1],r=(new Date).getTime();if(b&&g&&p>r-g)return a.clearTimeout(h),h=a.setTimeout(u,p),void 0;g=r;for(var v in l)if(l.hasOwnProperty(v)){var w=l[v],x=w.minw,y=w.maxw,z=null===x,A=null===y,B="em";x&&(x=parseFloat(x)*(x.indexOf(B)>-1?i||t():1)),y&&(y=parseFloat(y)*(y.indexOf(B)>-1?i||t():1)),w.hasquery&&(z&&A||!(z||e>=x)||!(A||y>=e))||(f[w.media]||(f[w.media]=[]),f[w.media].push(m[w.rules]))}for(var C in n)n.hasOwnProperty(C)&&n[C]&&n[C].parentNode===q&&q.removeChild(n[C]);n.length=0;for(var D in f)if(f.hasOwnProperty(D)){var E=j.createElement("style"),F=f[D].join("\n");E.type="text/css",E.media=D,q.insertBefore(E,o.nextSibling),E.styleSheet?E.styleSheet.cssText=F:E.appendChild(j.createTextNode(F)),n.push(E)}},v=function(a,b,d){var e=a.replace(c.regex.keyframes,"").match(c.regex.media),f=e&&e.length||0;b=b.substring(0,b.lastIndexOf("/"));var g=function(a){return a.replace(c.regex.urls,"$1"+b+"$2$3")},h=!f&&d;b.length&&(b+="/"),h&&(f=1);for(var i=0;f>i;i++){var j,k,n,o;h?(j=d,m.push(g(a))):(j=e[i].match(c.regex.findStyles)&&RegExp.$1,m.push(RegExp.$2&&g(RegExp.$2))),n=j.split(","),o=n.length;for(var p=0;o>p;p++)k=n[p],l.push({media:k.split("(")[0].match(c.regex.only)&&RegExp.$2||"all",rules:m.length-1,hasquery:k.indexOf("(")>-1,minw:k.match(c.regex.minw)&&parseFloat(RegExp.$1)+(RegExp.$2||""),maxw:k.match(c.regex.maxw)&&parseFloat(RegExp.$1)+(RegExp.$2||"")})}u()},w=function(){if(d.length){var b=d.shift();f(b.href,function(c){v(c,b.href,b.media),o[b.href]=!0,a.setTimeout(function(){w()},0)})}},x=function(){for(var b=0;b<s.length;b++){var c=s[b],e=c.href,f=c.media,g=c.rel&&"stylesheet"===c.rel.toLowerCase();e&&g&&!o[e]&&(c.styleSheet&&c.styleSheet.rawCssText?(v(c.styleSheet.rawCssText,e,f),o[e]=!0):(!/^([a-zA-Z:]*\/\/)/.test(e)&&!r||e.replace(RegExp.$1,"").split("/")[0]===a.location.host)&&("//"===e.substring(0,2)&&(e=a.location.protocol+e),d.push({href:e,media:f})))}w()};x(),c.update=x,c.getEmValue=t,a.addEventListener?a.addEventListener("resize",b,!1):a.attachEvent&&a.attachEvent("onresize",b)}}(this);
/*! Respond.js v1.4.2: min/max-width media query polyfill * Copyright 2013 Scott Jehl
 * Licensed under https://github.com/scottjehl/Respond/blob/master/LICENSE-MIT
 *  */

!function(a){"use strict";a.matchMedia=a.matchMedia||function(a){var b,c=a.documentElement,d=c.firstElementChild||c.firstChild,e=a.createElement("body"),f=a.createElement("div");return f.id="mq-test-1",f.style.cssText="position:absolute;top:-100em",e.style.background="none",e.appendChild(f),function(a){return f.innerHTML='&shy;<style media="'+a+'"> #mq-test-1 { width: 42px; }</style>',c.insertBefore(e,d),b=42===f.offsetWidth,c.removeChild(e),{matches:b,media:a}}}(a.document)}(this),function(a){"use strict";function b(){u(!0)}var c={};a.respond=c,c.update=function(){};var d=[],e=function(){var b=!1;try{b=new a.XMLHttpRequest}catch(c){b=new a.ActiveXObject("Microsoft.XMLHTTP")}return function(){return b}}(),f=function(a,b){var c=e();c&&(c.open("GET",a,!0),c.onreadystatechange=function(){4!==c.readyState||200!==c.status&&304!==c.status||b(c.responseText)},4!==c.readyState&&c.send(null))};if(c.ajax=f,c.queue=d,c.regex={media:/@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi,keyframes:/@(?:\-(?:o|moz|webkit)\-)?keyframes[^\{]+\{(?:[^\{\}]*\{[^\}\{]*\})+[^\}]*\}/gi,urls:/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,findStyles:/@media *([^\{]+)\{([\S\s]+?)$/,only:/(only\s+)?([a-zA-Z]+)\s?/,minw:/\([\s]*min\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/,maxw:/\([\s]*max\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/},c.mediaQueriesSupported=a.matchMedia&&null!==a.matchMedia("only all")&&a.matchMedia("only all").matches,!c.mediaQueriesSupported){var g,h,i,j=a.document,k=j.documentElement,l=[],m=[],n=[],o={},p=30,q=j.getElementsByTagName("head")[0]||k,r=j.getElementsByTagName("base")[0],s=q.getElementsByTagName("link"),t=function(){var a,b=j.createElement("div"),c=j.body,d=k.style.fontSize,e=c&&c.style.fontSize,f=!1;return b.style.cssText="position:absolute;font-size:1em;width:1em",c||(c=f=j.createElement("body"),c.style.background="none"),k.style.fontSize="100%",c.style.fontSize="100%",c.appendChild(b),f&&k.insertBefore(c,k.firstChild),a=b.offsetWidth,f?k.removeChild(c):c.removeChild(b),k.style.fontSize=d,e&&(c.style.fontSize=e),a=i=parseFloat(a)},u=function(b){var c="clientWidth",d=k[c],e="CSS1Compat"===j.compatMode&&d||j.body[c]||d,f={},o=s[s.length-1],r=(new Date).getTime();if(b&&g&&p>r-g)return a.clearTimeout(h),h=a.setTimeout(u,p),void 0;g=r;for(var v in l)if(l.hasOwnProperty(v)){var w=l[v],x=w.minw,y=w.maxw,z=null===x,A=null===y,B="em";x&&(x=parseFloat(x)*(x.indexOf(B)>-1?i||t():1)),y&&(y=parseFloat(y)*(y.indexOf(B)>-1?i||t():1)),w.hasquery&&(z&&A||!(z||e>=x)||!(A||y>=e))||(f[w.media]||(f[w.media]=[]),f[w.media].push(m[w.rules]))}for(var C in n)n.hasOwnProperty(C)&&n[C]&&n[C].parentNode===q&&q.removeChild(n[C]);n.length=0;for(var D in f)if(f.hasOwnProperty(D)){var E=j.createElement("style"),F=f[D].join("\n");E.type="text/css",E.media=D,q.insertBefore(E,o.nextSibling),E.styleSheet?E.styleSheet.cssText=F:E.appendChild(j.createTextNode(F)),n.push(E)}},v=function(a,b,d){var e=a.replace(c.regex.keyframes,"").match(c.regex.media),f=e&&e.length||0;b=b.substring(0,b.lastIndexOf("/"));var g=function(a){return a.replace(c.regex.urls,"$1"+b+"$2$3")},h=!f&&d;b.length&&(b+="/"),h&&(f=1);for(var i=0;f>i;i++){var j,k,n,o;h?(j=d,m.push(g(a))):(j=e[i].match(c.regex.findStyles)&&RegExp.$1,m.push(RegExp.$2&&g(RegExp.$2))),n=j.split(","),o=n.length;for(var p=0;o>p;p++)k=n[p],l.push({media:k.split("(")[0].match(c.regex.only)&&RegExp.$2||"all",rules:m.length-1,hasquery:k.indexOf("(")>-1,minw:k.match(c.regex.minw)&&parseFloat(RegExp.$1)+(RegExp.$2||""),maxw:k.match(c.regex.maxw)&&parseFloat(RegExp.$1)+(RegExp.$2||"")})}u()},w=function(){if(d.length){var b=d.shift();f(b.href,function(c){v(c,b.href,b.media),o[b.href]=!0,a.setTimeout(function(){w()},0)})}},x=function(){for(var b=0;b<s.length;b++){var c=s[b],e=c.href,f=c.media,g=c.rel&&"stylesheet"===c.rel.toLowerCase();e&&g&&!o[e]&&(c.styleSheet&&c.styleSheet.rawCssText?(v(c.styleSheet.rawCssText,e,f),o[e]=!0):(!/^([a-zA-Z:]*\/\/)/.test(e)&&!r||e.replace(RegExp.$1,"").split("/")[0]===a.location.host)&&("//"===e.substring(0,2)&&(e=a.location.protocol+e),d.push({href:e,media:f})))}w()};x(),c.update=x,c.getEmValue=t,a.addEventListener?a.addEventListener("resize",b,!1):a.attachEvent&&a.attachEvent("onresize",b)}}(this);
/*! jQuery v2.1.1 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.1",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this,a,b)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!n.isArray(a)&&a-parseFloat(a)>=0},isPlainObject:function(a){return"object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+-new Date,v=a.document,w=0,x=0,y=gb(),z=gb(),A=gb(),B=function(a,b){return a===b&&(l=!0),0},C="undefined",D=1<<31,E={}.hasOwnProperty,F=[],G=F.pop,H=F.push,I=F.push,J=F.slice,K=F.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},L="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",N="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",O=N.replace("w","w#"),P="\\["+M+"*("+N+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+O+"))|)"+M+"*\\]",Q=":("+N+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+P+")*)|.*)\\)|)",R=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),S=new RegExp("^"+M+"*,"+M+"*"),T=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),U=new RegExp("="+M+"*([^\\]'\"]*?)"+M+"*\\]","g"),V=new RegExp(Q),W=new RegExp("^"+O+"$"),X={ID:new RegExp("^#("+N+")"),CLASS:new RegExp("^\\.("+N+")"),TAG:new RegExp("^("+N.replace("w","w*")+")"),ATTR:new RegExp("^"+P),PSEUDO:new RegExp("^"+Q),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+L+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ab=/[+~]/,bb=/'|\\/g,cb=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),db=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)};try{I.apply(F=J.call(v.childNodes),v.childNodes),F[v.childNodes.length].nodeType}catch(eb){I={apply:F.length?function(a,b){H.apply(a,J.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fb(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],!a||"string"!=typeof a)return d;if(1!==(k=b.nodeType)&&9!==k)return[];if(p&&!e){if(f=_.exec(a))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return I.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName&&b.getElementsByClassName)return I.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=9===k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(bb,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+qb(o[l]);w=ab.test(a)&&ob(b.parentNode)||b,x=o.join(",")}if(x)try{return I.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function gb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function hb(a){return a[u]=!0,a}function ib(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function jb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function kb(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||D)-(~a.sourceIndex||D);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function lb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function mb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function nb(a){return hb(function(b){return b=+b,hb(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function ob(a){return a&&typeof a.getElementsByTagName!==C&&a}c=fb.support={},f=fb.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fb.setDocument=function(a){var b,e=a?a.ownerDocument||a:v,g=e.defaultView;return e!==n&&9===e.nodeType&&e.documentElement?(n=e,o=e.documentElement,p=!f(e),g&&g!==g.top&&(g.addEventListener?g.addEventListener("unload",function(){m()},!1):g.attachEvent&&g.attachEvent("onunload",function(){m()})),c.attributes=ib(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ib(function(a){return a.appendChild(e.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(e.getElementsByClassName)&&ib(function(a){return a.innerHTML="<div class='a'></div><div class='a i'></div>",a.firstChild.className="i",2===a.getElementsByClassName("i").length}),c.getById=ib(function(a){return o.appendChild(a).id=u,!e.getElementsByName||!e.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if(typeof b.getElementById!==C&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){var c=typeof a.getAttributeNode!==C&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return typeof b.getElementsByTagName!==C?b.getElementsByTagName(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return typeof b.getElementsByClassName!==C&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(e.querySelectorAll))&&(ib(function(a){a.innerHTML="<select msallowclip=''><option selected=''></option></select>",a.querySelectorAll("[msallowclip^='']").length&&q.push("[*^$]="+M+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+M+"*(?:value|"+L+")"),a.querySelectorAll(":checked").length||q.push(":checked")}),ib(function(a){var b=e.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+M+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ib(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",Q)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===e||a.ownerDocument===v&&t(v,a)?-1:b===e||b.ownerDocument===v&&t(v,b)?1:k?K.call(k,a)-K.call(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,f=a.parentNode,g=b.parentNode,h=[a],i=[b];if(!f||!g)return a===e?-1:b===e?1:f?-1:g?1:k?K.call(k,a)-K.call(k,b):0;if(f===g)return kb(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?kb(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},e):n},fb.matches=function(a,b){return fb(a,null,null,b)},fb.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fb(b,n,null,[a]).length>0},fb.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fb.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&E.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fb.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fb.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fb.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fb.selectors={cacheLength:50,createPseudo:hb,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(cb,db),a[3]=(a[3]||a[4]||a[5]||"").replace(cb,db),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fb.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fb.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(cb,db).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+M+")"+a+"("+M+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||typeof a.getAttribute!==C&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fb.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fb.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?hb(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=K.call(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:hb(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?hb(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:hb(function(a){return function(b){return fb(a,b).length>0}}),contains:hb(function(a){return function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:hb(function(a){return W.test(a||"")||fb.error("unsupported lang: "+a),a=a.replace(cb,db).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:nb(function(){return[0]}),last:nb(function(a,b){return[b-1]}),eq:nb(function(a,b,c){return[0>c?c+b:c]}),even:nb(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:nb(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:nb(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:nb(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=lb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=mb(b);function pb(){}pb.prototype=d.filters=d.pseudos,d.setFilters=new pb,g=fb.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fb.error(a):z(a,i).slice(0)};function qb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function rb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function sb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function tb(a,b,c){for(var d=0,e=b.length;e>d;d++)fb(a,b[d],c);return c}function ub(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function vb(a,b,c,d,e,f){return d&&!d[u]&&(d=vb(d)),e&&!e[u]&&(e=vb(e,f)),hb(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||tb(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ub(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ub(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?K.call(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ub(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):I.apply(g,r)})}function wb(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=rb(function(a){return a===b},h,!0),l=rb(function(a){return K.call(b,a)>-1},h,!0),m=[function(a,c,d){return!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d))}];f>i;i++)if(c=d.relative[a[i].type])m=[rb(sb(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return vb(i>1&&sb(m),i>1&&qb(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&wb(a.slice(i,e)),f>e&&wb(a=a.slice(e)),f>e&&qb(a))}m.push(c)}return sb(m)}function xb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=G.call(i));s=ub(s)}I.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&fb.uniqueSort(i)}return k&&(w=v,j=t),r};return c?hb(f):f}return h=fb.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wb(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xb(e,d)),f.selector=a}return f},i=fb.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(cb,db),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(cb,db),ab.test(j[0].type)&&ob(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qb(j),!a)return I.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,ab.test(a)&&ob(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ib(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ib(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||jb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ib(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||jb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ib(function(a){return null==a.getAttribute("disabled")})||jb(L,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fb}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=n.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return g.call(b,a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?n(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=n.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:l,!0)),v.test(c[1])&&n.isPlainObject(b))for(c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};A.prototype=n.fn,y=n(l);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a,"parentNode")},parentsUntil:function(a,b,c){return n.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return n.dir(a,"nextSibling")},prevAll:function(a){return n.dir(a,"previousSibling")},nextUntil:function(a,b,c){return n.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return n.dir(a,"previousSibling",c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(C[a]||n.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return n.each(a.match(E)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):n.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){n.each(b,function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments,function(a,b){var c;while((c=n.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(H.resolveWith(l,[n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function I(){l.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),n.ready()}n.ready.promise=function(b){return H||(H=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},n.ready.promise();var J=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)n.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=n.expando+Math.random()}K.uid=1,K.accepts=n.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,n.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(n.isEmptyObject(f))n.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?n.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){return M.access(a,b,c)},removeData:function(a,b){M.remove(a,b)
},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),P(f,d,e[d])));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=n.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||n.isArray(c)?d=L.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:n.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";k.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|pointer|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return l.activeElement}catch(a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==U&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d,c)!==!1)){if(!e&&!o.noBubble&&!n.isWindow(d)){for(i=o.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),m&&m.apply(g,c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>=0:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e,null,b):n.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?Z:$):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=Z,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!n.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a),!0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var ab=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bb=/<([\w:]+)/,cb=/<|&#?\w+;/,db=/<(?:script|style|link)/i,eb=/checked\s*(?:[^=]|=\s*.checked.)/i,fb=/^$|\/(?:java|ecma)script/i,gb=/^true\/(.*)/,hb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ib={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ib.optgroup=ib.option,ib.tbody=ib.tfoot=ib.colgroup=ib.caption=ib.thead,ib.th=ib.td;function jb(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function kb(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function lb(a){var b=gb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function mb(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function nb(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=n.extend({},h),M.set(b,i))}}function ob(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function pb(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=ob(h),f=ob(a),d=0,e=f.length;e>d;d++)pb(f[d],g[d]);if(b)if(c)for(f=f||ob(a),g=g||ob(h),d=0,e=f.length;e>d;d++)nb(f[d],g[d]);else nb(a,h);return g=ob(h,"script"),g.length>0&&mb(g,!i&&ob(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length;o>m;m++)if(e=a[m],e||0===e)if("object"===n.type(e))n.merge(l,e.nodeType?[e]:e);else if(cb.test(e)){f=f||k.appendChild(b.createElement("div")),g=(bb.exec(e)||["",""])[1].toLowerCase(),h=ib[g]||ib._default,f.innerHTML=h[1]+e.replace(ab,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;n.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===n.inArray(e,d))&&(i=n.contains(e.ownerDocument,e),f=ob(k.appendChild(e),"script"),i&&mb(f),c)){j=0;while(e=f[j++])fb.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f=n.event.special,g=0;void 0!==(c=a[g]);g++){if(n.acceptData(c)&&(e=c[L.expando],e&&(b=L.cache[e]))){if(b.events)for(d in b.events)f[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);L.cache[e]&&delete L.cache[e]}delete M.cache[c[M.expando]]}}}),n.fn.extend({text:function(a){return J(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?n.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||n.cleanData(ob(c)),c.parentNode&&(b&&n.contains(c.ownerDocument,c)&&mb(ob(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(ob(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!db.test(a)&&!ib[(bb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(ab,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(ob(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,n.cleanData(ob(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&eb.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(c=n.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=n.map(ob(c,"script"),kb),g=f.length;l>j;j++)h=c,j!==o&&(h=n.clone(h,!0,!0),g&&n.merge(f,ob(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,n.map(f,lb),j=0;g>j;j++)h=f[j],fb.test(h.type||"")&&!L.access(h,"globalEval")&&n.contains(i,h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(hb,"")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qb,rb={};function sb(b,c){var d,e=n(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:n.css(e[0],"display");return e.detach(),f}function tb(a){var b=l,c=rb[a];return c||(c=sb(a,b),"none"!==c&&c||(qb=(qb||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qb[0].contentDocument,b.write(),b.close(),c=sb(a,b),qb.detach()),rb[a]=c),c}var ub=/^margin/,vb=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wb=function(a){return a.ownerDocument.defaultView.getComputedStyle(a,null)};function xb(a,b,c){var d,e,f,g,h=a.style;return c=c||wb(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),vb.test(g)&&ub.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function yb(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d=l.documentElement,e=l.createElement("div"),f=l.createElement("div");if(f.style){f.style.backgroundClip="content-box",f.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===f.style.backgroundClip,e.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",e.appendChild(f);function g(){f.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",f.innerHTML="",d.appendChild(e);var g=a.getComputedStyle(f,null);b="1%"!==g.top,c="4px"===g.width,d.removeChild(e)}a.getComputedStyle&&n.extend(k,{pixelPosition:function(){return g(),b},boxSizingReliable:function(){return null==c&&g(),c},reliableMarginRight:function(){var b,c=f.appendChild(l.createElement("div"));return c.style.cssText=f.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",f.style.width="1px",d.appendChild(e),b=!parseFloat(a.getComputedStyle(c,null).marginRight),d.removeChild(e),b}})}}(),n.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var zb=/^(none|table(?!-c[ea]).+)/,Ab=new RegExp("^("+Q+")(.*)$","i"),Bb=new RegExp("^([+-])=("+Q+")","i"),Cb={position:"absolute",visibility:"hidden",display:"block"},Db={letterSpacing:"0",fontWeight:"400"},Eb=["Webkit","O","Moz","ms"];function Fb(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Eb.length;while(e--)if(b=Eb[e]+c,b in a)return b;return d}function Gb(a,b,c){var d=Ab.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Hb(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+R[f]+"Width",!0,e))):(g+=n.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ib(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wb(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xb(a,b,f),(0>e||null==e)&&(e=a.style[b]),vb.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Hb(a,b,c||(g?"border":"content"),d,f)+"px"}function Jb(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",tb(d.nodeName)))):(e=S(d),"none"===c&&e||L.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xb(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Fb(i,h)),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Bb.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(n.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||n.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Fb(a.style,h)),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xb(a,b,d)),"normal"===e&&b in Db&&(e=Db[b]),""===c||c?(f=parseFloat(e),c===!0||n.isNumeric(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?zb.test(n.css(a,"display"))&&0===a.offsetWidth?n.swap(a,Cb,function(){return Ib(a,b,d)}):Ib(a,b,d):void 0},set:function(a,c,d){var e=d&&wb(a);return Gb(a,c,d?Hb(a,b,d,"border-box"===n.css(a,"boxSizing",!1,e),e):0)}}}),n.cssHooks.marginRight=yb(k.reliableMarginRight,function(a,b){return b?n.swap(a,{display:"inline-block"},xb,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ub.test(a)||(n.cssHooks[a+b].set=Gb)}),n.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=wb(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Jb(this,!0)},hide:function(){return Jb(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?n(this).show():n(this).hide()})}});function Kb(a,b,c,d,e){return new Kb.prototype.init(a,b,c,d,e)}n.Tween=Kb,Kb.prototype={constructor:Kb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Kb.propHooks[this.prop];return a&&a.get?a.get(this):Kb.propHooks._default.get(this)},run:function(a){var b,c=Kb.propHooks[this.prop];return this.pos=b=this.options.duration?n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Kb.propHooks._default.set(this),this}},Kb.prototype.init.prototype=Kb.prototype,Kb.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[n.cssProps[a.prop]]||n.cssHooks[a.prop])?n.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Kb.propHooks.scrollTop=Kb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},n.fx=Kb.prototype.init,n.fx.step={};var Lb,Mb,Nb=/^(?:toggle|show|hide)$/,Ob=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pb=/queueHooks$/,Qb=[Vb],Rb={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Ob.exec(b),f=e&&e[3]||(n.cssNumber[a]?"":"px"),g=(n.cssNumber[a]||"px"!==f&&+d)&&Ob.exec(n.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,n.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sb(){return setTimeout(function(){Lb=void 0}),Lb=n.now()}function Tb(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ub(a,b,c){for(var d,e=(Rb[b]||[]).concat(Rb["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Vb(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&S(a),q=L.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?L.get(a,"olddisplay")||tb(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Nb.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?tb(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=L.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;L.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ub(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wb(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xb(a,b,c){var d,e,f=0,g=Qb.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Lb||Sb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:Lb||Sb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wb(k,j.opts.specialEasing);g>f;f++)if(d=Qb[f].call(j,a,k,j.opts))return d;return n.map(k,Ub,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(Xb,{tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Rb[c]=Rb[c]||[],Rb[c].unshift(b)},prefilter:function(a,b){b?Qb.unshift(a):Qb.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=Xb(this,n.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pb.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Tb(b,!0),a,d,e)}}),n.each({slideDown:Tb("show"),slideUp:Tb("hide"),slideToggle:Tb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Lb=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Lb=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Mb||(Mb=setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){clearInterval(Mb),Mb=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var Yb,Zb,$b=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return J(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?Zb:Yb)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=n.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void n.removeAttr(a,b))
},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Zb={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$b[b]||n.find.attr;$b[b]=function(a,b,d){var e,f;return d||(f=$b[b],$b[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$b[b]=f),e}});var _b=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return J(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_b.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var ac=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=n(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ac," ").indexOf(b)>=0)return!0;return!1}});var bc=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bc,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cc=n.now(),dc=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var ec,fc,gc=/#.*$/,hc=/([?&])_=[^&]*/,ic=/^(.*?):[ \t]*([^\r\n]*)$/gm,jc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,kc=/^(?:GET|HEAD)$/,lc=/^\/\//,mc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,nc={},oc={},pc="*/".concat("*");try{fc=location.href}catch(qc){fc=l.createElement("a"),fc.href="",fc=fc.href}ec=mc.exec(fc.toLowerCase())||[];function rc(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function sc(a,b,c,d){var e={},f=a===oc;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function tc(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function uc(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function vc(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:fc,type:"GET",isLocal:jc.test(ec[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":pc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?tc(tc(a,n.ajaxSettings),b):tc(n.ajaxSettings,a)},ajaxPrefilter:rc(nc),ajaxTransport:rc(oc),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=ic.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||fc)+"").replace(gc,"").replace(lc,ec[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=mc.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===ec[1]&&h[2]===ec[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(ec[3]||("http:"===ec[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data,k.traditional)),sc(nc,k,b,v),2===t)return v;i=k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!kc.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(dc.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=hc.test(d)?d.replace(hc,"$1_="+cc++):d+(dc.test(d)?"&":"?")+"_="+cc++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since",n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match",n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+pc+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=sc(oc,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=uc(k,v,f)),u=vc(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(n.isFunction(a)?function(b){n(this).wrapInner(a.call(this,b))}:function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},n.expr.filters.visible=function(a){return!n.expr.filters.hidden(a)};var wc=/%20/g,xc=/\[\]$/,yc=/\r?\n/g,zc=/^(?:submit|button|image|reset|file)$/i,Ac=/^(?:input|select|textarea|keygen)/i;function Bc(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||xc.test(a)?d(a,e):Bc(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Bc(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Bc(c,a[c],b,e);return d.join("&").replace(wc,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Ac.test(this.nodeName)&&!zc.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(yc,"\r\n")}}):{name:b.name,value:c.replace(yc,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Cc=0,Dc={},Ec={0:200,1223:204},Fc=n.ajaxSettings.xhr();a.ActiveXObject&&n(a).on("unload",function(){for(var a in Dc)Dc[a]()}),k.cors=!!Fc&&"withCredentials"in Fc,k.ajax=Fc=!!Fc,n.ajaxTransport(function(a){var b;return k.cors||Fc&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Cc;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Dc[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Ec[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Dc[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Gc=[],Hc=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Gc.pop()||n.expando+"_"+cc++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Hc.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Hc.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Hc,"$1"+e):b.jsonp!==!1&&(b.url+=(dc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Gc.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a],b,e),e&&e.length&&n(e).remove(),n.merge([],d.childNodes))};var Ic=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Ic)return Ic.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};var Jc=a.document.documentElement;function Kc(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Kc(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Jc;while(a&&!n.nodeName(a,"html")&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Jc})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;n.fn[b]=function(e){return J(this,function(b,e,f){var g=Kc(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=yb(k.pixelPosition,function(a,c){return c?(c=xb(a,b),vb.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.size=function(){return this.length},n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Lc=a.jQuery,Mc=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Mc),b&&a.jQuery===n&&(a.jQuery=Lc),n},typeof b===U&&(a.jQuery=a.$=n),n});
//# sourceMappingURL=jquery.min.map
/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one(a.support.transition.end,function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b()})}(jQuery),+function(a){"use strict";var b='[data-dismiss="alert"]',c=function(c){a(c).on("click",b,this.close)};c.prototype.close=function(b){function c(){f.trigger("closed.bs.alert").remove()}var d=a(this),e=d.attr("data-target");e||(e=d.attr("href"),e=e&&e.replace(/.*(?=#[^\s]*$)/,""));var f=a(e);b&&b.preventDefault(),f.length||(f=d.hasClass("alert")?d:d.parent()),f.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one(a.support.transition.end,c).emulateTransitionEnd(150):c())};var d=a.fn.alert;a.fn.alert=function(b){return this.each(function(){var d=a(this),e=d.data("bs.alert");e||d.data("bs.alert",e=new c(this)),"string"==typeof b&&e[b].call(d)})},a.fn.alert.Constructor=c,a.fn.alert.noConflict=function(){return a.fn.alert=d,this},a(document).on("click.bs.alert.data-api",b,c.prototype.close)}(jQuery),+function(a){"use strict";var b=function(c,d){this.$element=a(c),this.options=a.extend({},b.DEFAULTS,d),this.isLoading=!1};b.DEFAULTS={loadingText:"loading..."},b.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",f.resetText||d.data("resetText",d[e]()),d[e](f[b]||this.options[b]),setTimeout(a.proxy(function(){"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},b.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}a&&this.$element.toggleClass("active")};var c=a.fn.button;a.fn.button=function(c){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof c&&c;e||d.data("bs.button",e=new b(this,f)),"toggle"==c?e.toggle():c&&e.setState(c)})},a.fn.button.Constructor=b,a.fn.button.noConflict=function(){return a.fn.button=c,this},a(document).on("click.bs.button.data-api","[data-toggle^=button]",function(b){var c=a(b.target);c.hasClass("btn")||(c=c.closest(".btn")),c.button("toggle"),b.preventDefault()})}(jQuery),+function(a){"use strict";var b=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,"hover"==this.options.pause&&this.$element.on("mouseenter",a.proxy(this.pause,this)).on("mouseleave",a.proxy(this.cycle,this))};b.DEFAULTS={interval:5e3,pause:"hover",wrap:!0},b.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},b.prototype.getActiveIndex=function(){return this.$active=this.$element.find(".item.active"),this.$items=this.$active.parent().children(),this.$items.index(this.$active)},b.prototype.to=function(b){var c=this,d=this.getActiveIndex();return b>this.$items.length-1||0>b?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){c.to(b)}):d==b?this.pause().cycle():this.slide(b>d?"next":"prev",a(this.$items[b]))},b.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},b.prototype.next=function(){return this.sliding?void 0:this.slide("next")},b.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},b.prototype.slide=function(b,c){var d=this.$element.find(".item.active"),e=c||d[b](),f=this.interval,g="next"==b?"left":"right",h="next"==b?"first":"last",i=this;if(!e.length){if(!this.options.wrap)return;e=this.$element.find(".item")[h]()}if(e.hasClass("active"))return this.sliding=!1;var j=a.Event("slide.bs.carousel",{relatedTarget:e[0],direction:g});return this.$element.trigger(j),j.isDefaultPrevented()?void 0:(this.sliding=!0,f&&this.pause(),this.$indicators.length&&(this.$indicators.find(".active").removeClass("active"),this.$element.one("slid.bs.carousel",function(){var b=a(i.$indicators.children()[i.getActiveIndex()]);b&&b.addClass("active")})),a.support.transition&&this.$element.hasClass("slide")?(e.addClass(b),e[0].offsetWidth,d.addClass(g),e.addClass(g),d.one(a.support.transition.end,function(){e.removeClass([b,g].join(" ")).addClass("active"),d.removeClass(["active",g].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(1e3*d.css("transition-duration").slice(0,-1))):(d.removeClass("active"),e.addClass("active"),this.sliding=!1,this.$element.trigger("slid.bs.carousel")),f&&this.cycle(),this)};var c=a.fn.carousel;a.fn.carousel=function(c){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},b.DEFAULTS,d.data(),"object"==typeof c&&c),g="string"==typeof c?c:f.slide;e||d.data("bs.carousel",e=new b(this,f)),"number"==typeof c?e.to(c):g?e[g]():f.interval&&e.pause().cycle()})},a.fn.carousel.Constructor=b,a.fn.carousel.noConflict=function(){return a.fn.carousel=c,this},a(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(b){var c,d=a(this),e=a(d.attr("data-target")||(c=d.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"")),f=a.extend({},e.data(),d.data()),g=d.attr("data-slide-to");g&&(f.interval=!1),e.carousel(f),(g=d.attr("data-slide-to"))&&e.data("bs.carousel").to(g),b.preventDefault()}),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var b=a(this);b.carousel(b.data())})})}(jQuery),+function(a){"use strict";var b=function(c,d){this.$element=a(c),this.options=a.extend({},b.DEFAULTS,d),this.transitioning=null,this.options.parent&&(this.$parent=a(this.options.parent)),this.options.toggle&&this.toggle()};b.DEFAULTS={toggle:!0},b.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},b.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b=a.Event("show.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.$parent&&this.$parent.find("> .panel > .in");if(c&&c.length){var d=c.data("bs.collapse");if(d&&d.transitioning)return;c.collapse("hide"),d||c.data("bs.collapse",null)}var e=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[e](0),this.transitioning=1;var f=function(){this.$element.removeClass("collapsing").addClass("collapse in")[e]("auto"),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return f.call(this);var g=a.camelCase(["scroll",e].join("-"));this.$element.one(a.support.transition.end,a.proxy(f,this)).emulateTransitionEnd(350)[e](this.$element[0][g])}}},b.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var d=function(){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return a.support.transition?void this.$element[c](0).one(a.support.transition.end,a.proxy(d,this)).emulateTransitionEnd(350):d.call(this)}}},b.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var c=a.fn.collapse;a.fn.collapse=function(c){return this.each(function(){var d=a(this),e=d.data("bs.collapse"),f=a.extend({},b.DEFAULTS,d.data(),"object"==typeof c&&c);!e&&f.toggle&&"show"==c&&(c=!c),e||d.data("bs.collapse",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.collapse.Constructor=b,a.fn.collapse.noConflict=function(){return a.fn.collapse=c,this},a(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(b){var c,d=a(this),e=d.attr("data-target")||b.preventDefault()||(c=d.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,""),f=a(e),g=f.data("bs.collapse"),h=g?"toggle":d.data(),i=d.attr("data-parent"),j=i&&a(i);g&&g.transitioning||(j&&j.find('[data-toggle=collapse][data-parent="'+i+'"]').not(d).addClass("collapsed"),d[f.hasClass("in")?"addClass":"removeClass"]("collapsed")),f.collapse(h)})}(jQuery),+function(a){"use strict";function b(b){a(d).remove(),a(e).each(function(){var d=c(a(this)),e={relatedTarget:this};d.hasClass("open")&&(d.trigger(b=a.Event("hide.bs.dropdown",e)),b.isDefaultPrevented()||d.removeClass("open").trigger("hidden.bs.dropdown",e))})}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}var d=".dropdown-backdrop",e="[data-toggle=dropdown]",f=function(b){a(b).on("click.bs.dropdown",this.toggle)};f.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;f.toggleClass("open").trigger("shown.bs.dropdown",h),e.focus()}return!1}},f.prototype.keydown=function(b){if(/(38|40|27)/.test(b.keyCode)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var f=c(d),g=f.hasClass("open");if(!g||g&&27==b.keyCode)return 27==b.which&&f.find(e).focus(),d.click();var h=" li:not(.divider):visible a",i=f.find("[role=menu]"+h+", [role=listbox]"+h);if(i.length){var j=i.index(i.filter(":focus"));38==b.keyCode&&j>0&&j--,40==b.keyCode&&j<i.length-1&&j++,~j||(j=0),i.eq(j).focus()}}}};var g=a.fn.dropdown;a.fn.dropdown=function(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new f(this)),"string"==typeof b&&d[b].call(c)})},a.fn.dropdown.Constructor=f,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=g,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",e,f.prototype.toggle).on("keydown.bs.dropdown.data-api",e+", [role=menu], [role=listbox]",f.prototype.keydown)}(jQuery),+function(a){"use strict";var b=function(b,c){this.options=c,this.$element=a(b),this.$backdrop=this.isShown=null,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};b.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},b.prototype.toggle=function(a){return this[this.isShown?"hide":"show"](a)},b.prototype.show=function(b){var c=this,d=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(d),this.isShown||d.isDefaultPrevented()||(this.isShown=!0,this.escape(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function(){var d=a.support.transition&&c.$element.hasClass("fade");c.$element.parent().length||c.$element.appendTo(document.body),c.$element.show().scrollTop(0),d&&c.$element[0].offsetWidth,c.$element.addClass("in").attr("aria-hidden",!1),c.enforceFocus();var e=a.Event("shown.bs.modal",{relatedTarget:b});d?c.$element.find(".modal-dialog").one(a.support.transition.end,function(){c.$element.focus().trigger(e)}).emulateTransitionEnd(300):c.$element.focus().trigger(e)}))},b.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one(a.support.transition.end,a.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal())},b.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.focus()},this))},b.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keyup.dismiss.bs.modal")},b.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.removeBackdrop(),a.$element.trigger("hidden.bs.modal")})},b.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},b.prototype.backdrop=function(b){var c=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var d=a.support.transition&&c;if(this.$backdrop=a('<div class="modal-backdrop '+c+'" />').appendTo(document.body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),d&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;d?this.$backdrop.one(a.support.transition.end,b).emulateTransitionEnd(150):b()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(a.support.transition.end,b).emulateTransitionEnd(150):b()):b&&b()};var c=a.fn.modal;a.fn.modal=function(c,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},b.DEFAULTS,e.data(),"object"==typeof c&&c);f||e.data("bs.modal",f=new b(this,g)),"string"==typeof c?f[c](d):g.show&&f.show(d)})},a.fn.modal.Constructor=b,a.fn.modal.noConflict=function(){return a.fn.modal=c,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(b){var c=a(this),d=c.attr("href"),e=a(c.attr("data-target")||d&&d.replace(/.*(?=#[^\s]+$)/,"")),f=e.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(d)&&d},e.data(),c.data());c.is("a")&&b.preventDefault(),e.modal(f,this).one("hide",function(){c.is(":visible")&&c.focus()})}),a(document).on("show.bs.modal",".modal",function(){a(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){a(document.body).removeClass("modal-open")})}(jQuery),+function(a){"use strict";var b=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};b.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},b.prototype.init=function(b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},b.prototype.getDefaults=function(){return b.DEFAULTS},b.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},b.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},b.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show()},b.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},b.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){if(this.$element.trigger(b),b.isDefaultPrevented())return;var c=this,d=this.tip();this.setContent(),this.options.animation&&d.addClass("fade");var e="function"==typeof this.options.placement?this.options.placement.call(this,d[0],this.$element[0]):this.options.placement,f=/\s?auto?\s?/i,g=f.test(e);g&&(e=e.replace(f,"")||"top"),d.detach().css({top:0,left:0,display:"block"}).addClass(e),this.options.container?d.appendTo(this.options.container):d.insertAfter(this.$element);var h=this.getPosition(),i=d[0].offsetWidth,j=d[0].offsetHeight;if(g){var k=this.$element.parent(),l=e,m=document.documentElement.scrollTop||document.body.scrollTop,n="body"==this.options.container?window.innerWidth:k.outerWidth(),o="body"==this.options.container?window.innerHeight:k.outerHeight(),p="body"==this.options.container?0:k.offset().left;e="bottom"==e&&h.top+h.height+j-m>o?"top":"top"==e&&h.top-m-j<0?"bottom":"right"==e&&h.right+i>n?"left":"left"==e&&h.left-i<p?"right":e,d.removeClass(l).addClass(e)}var q=this.getCalculatedOffset(e,h,i,j);this.applyPlacement(q,e),this.hoverState=null;var r=function(){c.$element.trigger("shown.bs."+c.type)};a.support.transition&&this.$tip.hasClass("fade")?d.one(a.support.transition.end,r).emulateTransitionEnd(150):r()}},b.prototype.applyPlacement=function(b,c){var d,e=this.tip(),f=e[0].offsetWidth,g=e[0].offsetHeight,h=parseInt(e.css("margin-top"),10),i=parseInt(e.css("margin-left"),10);isNaN(h)&&(h=0),isNaN(i)&&(i=0),b.top=b.top+h,b.left=b.left+i,a.offset.setOffset(e[0],a.extend({using:function(a){e.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),e.addClass("in");var j=e[0].offsetWidth,k=e[0].offsetHeight;if("top"==c&&k!=g&&(d=!0,b.top=b.top+g-k),/bottom|top/.test(c)){var l=0;b.left<0&&(l=-2*b.left,b.left=0,e.offset(b),j=e[0].offsetWidth,k=e[0].offsetHeight),this.replaceArrow(l-f+j,j,"left")}else this.replaceArrow(k-g,k,"top");d&&e.offset(b)},b.prototype.replaceArrow=function(a,b,c){this.arrow().css(c,a?50*(1-a/b)+"%":"")},b.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},b.prototype.hide=function(){function b(){"in"!=c.hoverState&&d.detach(),c.$element.trigger("hidden.bs."+c.type)}var c=this,d=this.tip(),e=a.Event("hide.bs."+this.type);return this.$element.trigger(e),e.isDefaultPrevented()?void 0:(d.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?d.one(a.support.transition.end,b).emulateTransitionEnd(150):b(),this.hoverState=null,this)},b.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},b.prototype.hasContent=function(){return this.getTitle()},b.prototype.getPosition=function(){var b=this.$element[0];return a.extend({},"function"==typeof b.getBoundingClientRect?b.getBoundingClientRect():{width:b.offsetWidth,height:b.offsetHeight},this.$element.offset())},b.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},b.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},b.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)},b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},b.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},b.prototype.enable=function(){this.enabled=!0},b.prototype.disable=function(){this.enabled=!1},b.prototype.toggleEnabled=function(){this.enabled=!this.enabled},b.prototype.toggle=function(b){var c=b?a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;c.tip().hasClass("in")?c.leave(c):c.enter(c)},b.prototype.destroy=function(){clearTimeout(this.timeout),this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var c=a.fn.tooltip;a.fn.tooltip=function(c){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof c&&c;(e||"destroy"!=c)&&(e||d.data("bs.tooltip",e=new b(this,f)),"string"==typeof c&&e[c]())})},a.fn.tooltip.Constructor=b,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=c,this}}(jQuery),+function(a){"use strict";var b=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");b.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),b.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),b.prototype.constructor=b,b.prototype.getDefaults=function(){return b.DEFAULTS},b.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content")[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},b.prototype.hasContent=function(){return this.getTitle()||this.getContent()},b.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},b.prototype.tip=function(){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var c=a.fn.popover;a.fn.popover=function(c){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof c&&c;(e||"destroy"!=c)&&(e||d.data("bs.popover",e=new b(this,f)),"string"==typeof c&&e[c]())})},a.fn.popover.Constructor=b,a.fn.popover.noConflict=function(){return a.fn.popover=c,this}}(jQuery),+function(a){"use strict";function b(c,d){var e,f=a.proxy(this.process,this);this.$element=a(a(c).is("body")?window:c),this.$body=a("body"),this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",f),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||(e=a(c).attr("href"))&&e.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.offsets=a([]),this.targets=a([]),this.activeTarget=null,this.refresh(),this.process()}b.DEFAULTS={offset:10},b.prototype.refresh=function(){var b=this.$element[0]==window?"offset":"position";this.offsets=a([]),this.targets=a([]);{var c=this;this.$body.find(this.selector).map(function(){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[b]().top+(!a.isWindow(c.$scrollElement.get(0))&&c.$scrollElement.scrollTop()),e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){c.offsets.push(this[0]),c.targets.push(this[1])})}},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,d=c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(b>=d)return g!=(a=f.last()[0])&&this.activate(a);if(g&&b<=e[0])return g!=(a=f[0])&&this.activate(a);for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,a(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")};var c=a.fn.scrollspy;a.fn.scrollspy=function(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=c,this},a(window).on("load",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);b.scrollspy(b.data())})})}(jQuery),+function(a){"use strict";var b=function(b){this.element=a(b)};b.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a")[0],f=a.Event("show.bs.tab",{relatedTarget:e});if(b.trigger(f),!f.isDefaultPrevented()){var g=a(d);this.activate(b.parent("li"),c),this.activate(g,g.parent(),function(){b.trigger({type:"shown.bs.tab",relatedTarget:e})})}}},b.prototype.activate=function(b,c,d){function e(){f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),b.addClass("active"),g?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active"),d&&d()}var f=c.find("> .active"),g=d&&a.support.transition&&f.hasClass("fade");g?f.one(a.support.transition.end,e).emulateTransitionEnd(150):e(),f.removeClass("in")};var c=a.fn.tab;a.fn.tab=function(c){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new b(this)),"string"==typeof c&&e[c]()})},a.fn.tab.Constructor=b,a.fn.tab.noConflict=function(){return a.fn.tab=c,this},a(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(b){b.preventDefault(),a(this).tab("show")})}(jQuery),+function(a){"use strict";var b=function(c,d){this.options=a.extend({},b.DEFAULTS,d),this.$window=a(window).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(c),this.affixed=this.unpin=this.pinnedOffset=null,this.checkPosition()};b.RESET="affix affix-top affix-bottom",b.DEFAULTS={offset:0},b.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(b.RESET).addClass("affix");var a=this.$window.scrollTop(),c=this.$element.offset();return this.pinnedOffset=c.top-a},b.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},b.prototype.checkPosition=function(){if(this.$element.is(":visible")){var c=a(document).height(),d=this.$window.scrollTop(),e=this.$element.offset(),f=this.options.offset,g=f.top,h=f.bottom;"top"==this.affixed&&(e.top+=d),"object"!=typeof f&&(h=g=f),"function"==typeof g&&(g=f.top(this.$element)),"function"==typeof h&&(h=f.bottom(this.$element));var i=null!=this.unpin&&d+this.unpin<=e.top?!1:null!=h&&e.top+this.$element.height()>=c-h?"bottom":null!=g&&g>=d?"top":!1;if(this.affixed!==i){this.unpin&&this.$element.css("top","");var j="affix"+(i?"-"+i:""),k=a.Event(j+".bs.affix");this.$element.trigger(k),k.isDefaultPrevented()||(this.affixed=i,this.unpin="bottom"==i?this.getPinnedOffset():null,this.$element.removeClass(b.RESET).addClass(j).trigger(a.Event(j.replace("affix","affixed"))),"bottom"==i&&this.$element.offset({top:c-h-this.$element.height()}))}}};var c=a.fn.affix;a.fn.affix=function(c){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof c&&c;e||d.data("bs.affix",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.affix.Constructor=b,a.fn.affix.noConflict=function(){return a.fn.affix=c,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var b=a(this),c=b.data();c.offset=c.offset||{},c.offsetBottom&&(c.offset.bottom=c.offsetBottom),c.offsetTop&&(c.offset.top=c.offsetTop),b.affix(c)})})}(jQuery);
!function(){function n(n,t){return t>n?-1:n>t?1:n>=t?0:0/0}function t(n){return null!=n&&!isNaN(n)}function r(n){return{left:function(t,r,e,u){for(arguments.length<3&&(e=0),arguments.length<4&&(u=t.length);u>e;){var i=e+u>>>1;n(t[i],r)<0?e=i+1:u=i}return e},right:function(t,r,e,u){for(arguments.length<3&&(e=0),arguments.length<4&&(u=t.length);u>e;){var i=e+u>>>1;n(t[i],r)>0?u=i:e=i+1}return e}}}function e(n){return n.length}function u(n){for(var t=1;n*t%1;)t*=10;return t}function i(n,t){try{for(var r in t)Object.defineProperty(n.prototype,r,{value:t[r],enumerable:!1})}catch(e){n.prototype=t}}function o(){}function a(n){return sa+n in this}function c(n){return n=sa+n,n in this&&delete this[n]}function s(){var n=[];return this.forEach(function(t){n.push(t)}),n}function l(){var n=0;for(var t in this)t.charCodeAt(0)===la&&++n;return n}function f(){for(var n in this)if(n.charCodeAt(0)===la)return!1;return!0}function h(){}function g(n,t,r){return function(){var e=r.apply(t,arguments);return e===t?n:e}}function p(n,t){if(t in n)return t;t=t.charAt(0).toUpperCase()+t.substring(1);for(var r=0,e=fa.length;e>r;++r){var u=fa[r]+t;if(u in n)return u}}function v(){}function d(){}function m(n){function t(){for(var t,e=r,u=-1,i=e.length;++u<i;)(t=e[u].on)&&t.apply(this,arguments);return n}var r=[],e=new o;return t.on=function(t,u){var i,o=e.get(t);return arguments.length<2?o&&o.on:(o&&(o.on=null,r=r.slice(0,i=r.indexOf(o)).concat(r.slice(i+1)),e.remove(t)),u&&r.push(e.set(t,{on:u})),n)},t}function y(){Bo.event.preventDefault()}function x(){for(var n,t=Bo.event;n=t.sourceEvent;)t=n;return t}function M(n){for(var t=new d,r=0,e=arguments.length;++r<e;)t[arguments[r]]=m(t);return t.of=function(r,e){return function(u){try{var i=u.sourceEvent=Bo.event;u.target=n,Bo.event=u,t[u.type].apply(r,e)}finally{Bo.event=i}}},t}function _(n){return ga(n,ya),n}function b(n){return"function"==typeof n?n:function(){return pa(n,this)}}function w(n){return"function"==typeof n?n:function(){return va(n,this)}}function S(n,t){function r(){this.removeAttribute(n)}function e(){this.removeAttributeNS(n.space,n.local)}function u(){this.setAttribute(n,t)}function i(){this.setAttributeNS(n.space,n.local,t)}function o(){var r=t.apply(this,arguments);null==r?this.removeAttribute(n):this.setAttribute(n,r)}function a(){var r=t.apply(this,arguments);null==r?this.removeAttributeNS(n.space,n.local):this.setAttributeNS(n.space,n.local,r)}return n=Bo.ns.qualify(n),null==t?n.local?e:r:"function"==typeof t?n.local?a:o:n.local?i:u}function k(n){return n.trim().replace(/\s+/g," ")}function E(n){return new RegExp("(?:^|\\s+)"+Bo.requote(n)+"(?:\\s+|$)","g")}function A(n){return n.trim().split(/^|\s+/)}function C(n,t){function r(){for(var r=-1;++r<u;)n[r](this,t)}function e(){for(var r=-1,e=t.apply(this,arguments);++r<u;)n[r](this,e)}n=A(n).map(N);var u=n.length;return"function"==typeof t?e:r}function N(n){var t=E(n);return function(r,e){if(u=r.classList)return e?u.add(n):u.remove(n);var u=r.getAttribute("class")||"";e?(t.lastIndex=0,t.test(u)||r.setAttribute("class",k(u+" "+n))):r.setAttribute("class",k(u.replace(t," ")))}}function z(n,t,r){function e(){this.style.removeProperty(n)}function u(){this.style.setProperty(n,t,r)}function i(){var e=t.apply(this,arguments);null==e?this.style.removeProperty(n):this.style.setProperty(n,e,r)}return null==t?e:"function"==typeof t?i:u}function L(n,t){function r(){delete this[n]}function e(){this[n]=t}function u(){var r=t.apply(this,arguments);null==r?delete this[n]:this[n]=r}return null==t?r:"function"==typeof t?u:e}function T(n){return"function"==typeof n?n:(n=Bo.ns.qualify(n)).local?function(){return this.ownerDocument.createElementNS(n.space,n.local)}:function(){return this.ownerDocument.createElementNS(this.namespaceURI,n)}}function q(n){return{__data__:n}}function R(n){return function(){return ma(this,n)}}function D(t){return arguments.length||(t=n),function(n,r){return n&&r?t(n.__data__,r.__data__):!n-!r}}function P(n,t){for(var r=0,e=n.length;e>r;r++)for(var u,i=n[r],o=0,a=i.length;a>o;o++)(u=i[o])&&t(u,o,r);return n}function U(n){return ga(n,Ma),n}function j(n){var t,r;return function(e,u,i){var o,a=n[i].update,c=a.length;for(i!=r&&(r=i,t=0),u>=t&&(t=u+1);!(o=a[t])&&++t<c;);return o}}function H(){var n=this.__transition__;n&&++n.active}function F(n,t,r){function e(){var t=this[o];t&&(this.removeEventListener(n,t,t.$),delete this[o])}function u(){var u=c(t,Wo(arguments));e.call(this),this.addEventListener(n,this[o]=u,u.$=r),u._=t}function i(){var t,r=new RegExp("^__on([^.]+)"+Bo.requote(n)+"$");for(var e in this)if(t=e.match(r)){var u=this[e];this.removeEventListener(t[1],u,u.$),delete this[e]}}var o="__on"+n,a=n.indexOf("."),c=O;a>0&&(n=n.substring(0,a));var s=ba.get(n);return s&&(n=s,c=I),a?t?u:e:t?v:i}function O(n,t){return function(r){var e=Bo.event;Bo.event=r,t[0]=this.__data__;try{n.apply(this,t)}finally{Bo.event=e}}}function I(n,t){var r=O(n,t);return function(n){var t=this,e=n.relatedTarget;e&&(e===t||8&e.compareDocumentPosition(t))||r.call(t,n)}}function Y(){var n=".dragsuppress-"+ ++Sa,t="click"+n,r=Bo.select(Qo).on("touchmove"+n,y).on("dragstart"+n,y).on("selectstart"+n,y);if(wa){var e=Ko.style,u=e[wa];e[wa]="none"}return function(i){function o(){r.on(t,null)}r.on(n,null),wa&&(e[wa]=u),i&&(r.on(t,function(){y(),o()},!0),setTimeout(o,0))}}function Z(n,t){t.changedTouches&&(t=t.changedTouches[0]);var r=n.ownerSVGElement||n;if(r.createSVGPoint){var e=r.createSVGPoint();return e.x=t.clientX,e.y=t.clientY,e=e.matrixTransform(n.getScreenCTM().inverse()),[e.x,e.y]}var u=n.getBoundingClientRect();return[t.clientX-u.left-n.clientLeft,t.clientY-u.top-n.clientTop]}function V(){return Bo.event.changedTouches[0].identifier}function $(){return Bo.event.target}function X(){return Qo}function B(n){return n>0?1:0>n?-1:0}function J(n,t,r){return(t[0]-n[0])*(r[1]-n[1])-(t[1]-n[1])*(r[0]-n[0])}function W(n){return n>1?0:-1>n?ka:Math.acos(n)}function G(n){return n>1?Aa:-1>n?-Aa:Math.asin(n)}function K(n){return((n=Math.exp(n))-1/n)/2}function Q(n){return((n=Math.exp(n))+1/n)/2}function nt(n){return((n=Math.exp(2*n))-1)/(n+1)}function tt(n){return(n=Math.sin(n/2))*n}function rt(){}function et(n,t,r){return new ut(n,t,r)}function ut(n,t,r){this.h=n,this.s=t,this.l=r}function it(n,t,r){function e(n){return n>360?n-=360:0>n&&(n+=360),60>n?i+(o-i)*n/60:180>n?o:240>n?i+(o-i)*(240-n)/60:i}function u(n){return Math.round(255*e(n))}var i,o;return n=isNaN(n)?0:(n%=360)<0?n+360:n,t=isNaN(t)?0:0>t?0:t>1?1:t,r=0>r?0:r>1?1:r,o=.5>=r?r*(1+t):r+t-r*t,i=2*r-o,yt(u(n+120),u(n),u(n-120))}function ot(n,t,r){return new at(n,t,r)}function at(n,t,r){this.h=n,this.c=t,this.l=r}function ct(n,t,r){return isNaN(n)&&(n=0),isNaN(t)&&(t=0),st(r,Math.cos(n*=za)*t,Math.sin(n)*t)}function st(n,t,r){return new lt(n,t,r)}function lt(n,t,r){this.l=n,this.a=t,this.b=r}function ft(n,t,r){var e=(n+16)/116,u=e+t/500,i=e-r/200;return u=gt(u)*Oa,e=gt(e)*Ia,i=gt(i)*Ya,yt(vt(3.2404542*u-1.5371385*e-.4985314*i),vt(-.969266*u+1.8760108*e+.041556*i),vt(.0556434*u-.2040259*e+1.0572252*i))}function ht(n,t,r){return n>0?ot(Math.atan2(r,t)*La,Math.sqrt(t*t+r*r),n):ot(0/0,0/0,n)}function gt(n){return n>.206893034?n*n*n:(n-4/29)/7.787037}function pt(n){return n>.008856?Math.pow(n,1/3):7.787037*n+4/29}function vt(n){return Math.round(255*(.00304>=n?12.92*n:1.055*Math.pow(n,1/2.4)-.055))}function dt(n){return yt(n>>16,255&n>>8,255&n)}function mt(n){return dt(n)+""}function yt(n,t,r){return new xt(n,t,r)}function xt(n,t,r){this.r=n,this.g=t,this.b=r}function Mt(n){return 16>n?"0"+Math.max(0,n).toString(16):Math.min(255,n).toString(16)}function _t(n,t,r){var e,u,i,o=0,a=0,c=0;if(e=/([a-z]+)\((.*)\)/i.exec(n))switch(u=e[2].split(","),e[1]){case"hsl":return r(parseFloat(u[0]),parseFloat(u[1])/100,parseFloat(u[2])/100);case"rgb":return t(kt(u[0]),kt(u[1]),kt(u[2]))}return(i=$a.get(n))?t(i.r,i.g,i.b):(null==n||"#"!==n.charAt(0)||isNaN(i=parseInt(n.substring(1),16))||(4===n.length?(o=(3840&i)>>4,o=o>>4|o,a=240&i,a=a>>4|a,c=15&i,c=c<<4|c):7===n.length&&(o=(16711680&i)>>16,a=(65280&i)>>8,c=255&i)),t(o,a,c))}function bt(n,t,r){var e,u,i=Math.min(n/=255,t/=255,r/=255),o=Math.max(n,t,r),a=o-i,c=(o+i)/2;return a?(u=.5>c?a/(o+i):a/(2-o-i),e=n==o?(t-r)/a+(r>t?6:0):t==o?(r-n)/a+2:(n-t)/a+4,e*=60):(e=0/0,u=c>0&&1>c?0:e),et(e,u,c)}function wt(n,t,r){n=St(n),t=St(t),r=St(r);var e=pt((.4124564*n+.3575761*t+.1804375*r)/Oa),u=pt((.2126729*n+.7151522*t+.072175*r)/Ia),i=pt((.0193339*n+.119192*t+.9503041*r)/Ya);return st(116*u-16,500*(e-u),200*(u-i))}function St(n){return(n/=255)<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function kt(n){var t=parseFloat(n);return"%"===n.charAt(n.length-1)?Math.round(2.55*t):t}function Et(n){return"function"==typeof n?n:function(){return n}}function At(n){return n}function Ct(n){return function(t,r,e){return 2===arguments.length&&"function"==typeof r&&(e=r,r=null),Nt(t,r,n,e)}}function Nt(n,t,r,e){function u(){var n,t=c.status;if(!t&&c.responseText||t>=200&&300>t||304===t){try{n=r.call(i,c)}catch(e){return o.error.call(i,e),void 0}o.load.call(i,n)}else o.error.call(i,c)}var i={},o=Bo.dispatch("beforesend","progress","load","error"),a={},c=new XMLHttpRequest,s=null;return!Qo.XDomainRequest||"withCredentials"in c||!/^(http(s)?:)?\/\//.test(n)||(c=new XDomainRequest),"onload"in c?c.onload=c.onerror=u:c.onreadystatechange=function(){c.readyState>3&&u()},c.onprogress=function(n){var t=Bo.event;Bo.event=n;try{o.progress.call(i,c)}finally{Bo.event=t}},i.header=function(n,t){return n=(n+"").toLowerCase(),arguments.length<2?a[n]:(null==t?delete a[n]:a[n]=t+"",i)},i.mimeType=function(n){return arguments.length?(t=null==n?null:n+"",i):t},i.responseType=function(n){return arguments.length?(s=n,i):s},i.response=function(n){return r=n,i},["get","post"].forEach(function(n){i[n]=function(){return i.send.apply(i,[n].concat(Wo(arguments)))}}),i.send=function(r,e,u){if(2===arguments.length&&"function"==typeof e&&(u=e,e=null),c.open(r,n,!0),null==t||"accept"in a||(a.accept=t+",*/*"),c.setRequestHeader)for(var l in a)c.setRequestHeader(l,a[l]);return null!=t&&c.overrideMimeType&&c.overrideMimeType(t),null!=s&&(c.responseType=s),null!=u&&i.on("error",u).on("load",function(n){u(null,n)}),o.beforesend.call(i,c),c.send(null==e?null:e),i},i.abort=function(){return c.abort(),i},Bo.rebind(i,o,"on"),null==e?i:i.get(zt(e))}function zt(n){return 1===n.length?function(t,r){n(null==t?r:null)}:n}function Lt(){var n=Tt(),t=qt()-n;t>24?(isFinite(t)&&(clearTimeout(Wa),Wa=setTimeout(Lt,t)),Ja=0):(Ja=1,Ka(Lt))}function Tt(){var n=Date.now();for(Ga=Xa;Ga;)n>=Ga.t&&(Ga.f=Ga.c(n-Ga.t)),Ga=Ga.n;return n}function qt(){for(var n,t=Xa,r=1/0;t;)t.f?t=n?n.n=t.n:Xa=t.n:(t.t<r&&(r=t.t),t=(n=t).n);return Ba=n,r}function Rt(n,t){return t-(n?Math.ceil(Math.log(n)/Math.LN10):1)}function Dt(n,t){var r=Math.pow(10,3*ca(8-t));return{scale:t>8?function(n){return n/r}:function(n){return n*r},symbol:n}}function Pt(n){var t=n.decimal,r=n.thousands,e=n.grouping,u=n.currency,i=e?function(n){for(var t=n.length,u=[],i=0,o=e[0];t>0&&o>0;)u.push(n.substring(t-=o,t+o)),o=e[i=(i+1)%e.length];return u.reverse().join(r)}:At;return function(n){var r=nc.exec(n),e=r[1]||" ",o=r[2]||">",a=r[3]||"",c=r[4]||"",s=r[5],l=+r[6],f=r[7],h=r[8],g=r[9],p=1,v="",d="",m=!1;switch(h&&(h=+h.substring(1)),(s||"0"===e&&"="===o)&&(s=e="0",o="=",f&&(l-=Math.floor((l-1)/4))),g){case"n":f=!0,g="g";break;case"%":p=100,d="%",g="f";break;case"p":p=100,d="%",g="r";break;case"b":case"o":case"x":case"X":"#"===c&&(v="0"+g.toLowerCase());case"c":case"d":m=!0,h=0;break;case"s":p=-1,g="r"}"$"===c&&(v=u[0],d=u[1]),"r"!=g||h||(g="g"),null!=h&&("g"==g?h=Math.max(1,Math.min(21,h)):("e"==g||"f"==g)&&(h=Math.max(0,Math.min(20,h)))),g=tc.get(g)||Ut;var y=s&&f;return function(n){var r=d;if(m&&n%1)return"";var u=0>n||0===n&&0>1/n?(n=-n,"-"):a;if(0>p){var c=Bo.formatPrefix(n,h);n=c.scale(n),r=c.symbol+d}else n*=p;n=g(n,h);var x=n.lastIndexOf("."),M=0>x?n:n.substring(0,x),_=0>x?"":t+n.substring(x+1);!s&&f&&(M=i(M));var b=v.length+M.length+_.length+(y?0:u.length),w=l>b?new Array(b=l-b+1).join(e):"";return y&&(M=i(w+M)),u+=v,n=M+_,("<"===o?u+n+w:">"===o?w+u+n:"^"===o?w.substring(0,b>>=1)+u+n+w.substring(b):u+(y?n:w+n))+r}}}function Ut(n){return n+""}function jt(){this._=new Date(arguments.length>1?Date.UTC.apply(this,arguments):arguments[0])}function Ht(n,t,r){function e(t){var r=n(t),e=i(r,1);return e-t>t-r?r:e}function u(r){return t(r=n(new ec(r-1)),1),r}function i(n,r){return t(n=new ec(+n),r),n}function o(n,e,i){var o=u(n),a=[];if(i>1)for(;e>o;)r(o)%i||a.push(new Date(+o)),t(o,1);else for(;e>o;)a.push(new Date(+o)),t(o,1);return a}function a(n,t,r){try{ec=jt;var e=new jt;return e._=n,o(e,t,r)}finally{ec=Date}}n.floor=n,n.round=e,n.ceil=u,n.offset=i,n.range=o;var c=n.utc=Ft(n);return c.floor=c,c.round=Ft(e),c.ceil=Ft(u),c.offset=Ft(i),c.range=a,n}function Ft(n){return function(t,r){try{ec=jt;var e=new jt;return e._=t,n(e,r)._}finally{ec=Date}}}function Ot(n){function t(n){function t(t){for(var r,u,i,o=[],a=-1,c=0;++a<e;)37===n.charCodeAt(a)&&(o.push(n.substring(c,a)),null!=(u=ic[r=n.charAt(++a)])&&(r=n.charAt(++a)),(i=C[r])&&(r=i(t,null==u?"e"===r?" ":"0":u)),o.push(r),c=a+1);return o.push(n.substring(c,a)),o.join("")}var e=n.length;return t.parse=function(t){var e={y:1900,m:0,d:1,H:0,M:0,S:0,L:0,Z:null},u=r(e,n,t,0);if(u!=t.length)return null;"p"in e&&(e.H=e.H%12+12*e.p);var i=null!=e.Z&&ec!==jt,o=new(i?jt:ec);return"j"in e?o.setFullYear(e.y,0,e.j):"w"in e&&("W"in e||"U"in e)?(o.setFullYear(e.y,0,1),o.setFullYear(e.y,0,"W"in e?(e.w+6)%7+7*e.W-(o.getDay()+5)%7:e.w+7*e.U-(o.getDay()+6)%7)):o.setFullYear(e.y,e.m,e.d),o.setHours(e.H+Math.floor(e.Z/100),e.M+e.Z%100,e.S,e.L),i?o._:o},t.toString=function(){return n},t}function r(n,t,r,e){for(var u,i,o,a=0,c=t.length,s=r.length;c>a;){if(e>=s)return-1;if(u=t.charCodeAt(a++),37===u){if(o=t.charAt(a++),i=N[o in ic?t.charAt(a++):o],!i||(e=i(n,r,e))<0)return-1}else if(u!=r.charCodeAt(e++))return-1}return e}function e(n,t,r){b.lastIndex=0;var e=b.exec(t.substring(r));return e?(n.w=w.get(e[0].toLowerCase()),r+e[0].length):-1}function u(n,t,r){M.lastIndex=0;var e=M.exec(t.substring(r));return e?(n.w=_.get(e[0].toLowerCase()),r+e[0].length):-1}function i(n,t,r){E.lastIndex=0;var e=E.exec(t.substring(r));return e?(n.m=A.get(e[0].toLowerCase()),r+e[0].length):-1}function o(n,t,r){S.lastIndex=0;var e=S.exec(t.substring(r));return e?(n.m=k.get(e[0].toLowerCase()),r+e[0].length):-1}function a(n,t,e){return r(n,C.c.toString(),t,e)}function c(n,t,e){return r(n,C.x.toString(),t,e)}function s(n,t,e){return r(n,C.X.toString(),t,e)}function l(n,t,r){var e=x.get(t.substring(r,r+=2).toLowerCase());return null==e?-1:(n.p=e,r)}var f=n.dateTime,h=n.date,g=n.time,p=n.periods,v=n.days,d=n.shortDays,m=n.months,y=n.shortMonths;t.utc=function(n){function r(n){try{ec=jt;var t=new ec;return t._=n,e(t)}finally{ec=Date}}var e=t(n);return r.parse=function(n){try{ec=jt;var t=e.parse(n);return t&&t._}finally{ec=Date}},r.toString=e.toString,r},t.multi=t.utc.multi=ar;var x=Bo.map(),M=Yt(v),_=Zt(v),b=Yt(d),w=Zt(d),S=Yt(m),k=Zt(m),E=Yt(y),A=Zt(y);p.forEach(function(n,t){x.set(n.toLowerCase(),t)});var C={a:function(n){return d[n.getDay()]},A:function(n){return v[n.getDay()]},b:function(n){return y[n.getMonth()]},B:function(n){return m[n.getMonth()]},c:t(f),d:function(n,t){return It(n.getDate(),t,2)},e:function(n,t){return It(n.getDate(),t,2)},H:function(n,t){return It(n.getHours(),t,2)},I:function(n,t){return It(n.getHours()%12||12,t,2)},j:function(n,t){return It(1+rc.dayOfYear(n),t,3)},L:function(n,t){return It(n.getMilliseconds(),t,3)},m:function(n,t){return It(n.getMonth()+1,t,2)},M:function(n,t){return It(n.getMinutes(),t,2)},p:function(n){return p[+(n.getHours()>=12)]},S:function(n,t){return It(n.getSeconds(),t,2)},U:function(n,t){return It(rc.sundayOfYear(n),t,2)},w:function(n){return n.getDay()},W:function(n,t){return It(rc.mondayOfYear(n),t,2)},x:t(h),X:t(g),y:function(n,t){return It(n.getFullYear()%100,t,2)},Y:function(n,t){return It(n.getFullYear()%1e4,t,4)},Z:ir,"%":function(){return"%"}},N={a:e,A:u,b:i,B:o,c:a,d:Qt,e:Qt,H:tr,I:tr,j:nr,L:ur,m:Kt,M:rr,p:l,S:er,U:$t,w:Vt,W:Xt,x:c,X:s,y:Jt,Y:Bt,Z:Wt,"%":or};return t}function It(n,t,r){var e=0>n?"-":"",u=(e?-n:n)+"",i=u.length;return e+(r>i?new Array(r-i+1).join(t)+u:u)}function Yt(n){return new RegExp("^(?:"+n.map(Bo.requote).join("|")+")","i")}function Zt(n){for(var t=new o,r=-1,e=n.length;++r<e;)t.set(n[r].toLowerCase(),r);return t}function Vt(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r,r+1));return e?(n.w=+e[0],r+e[0].length):-1}function $t(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r));return e?(n.U=+e[0],r+e[0].length):-1}function Xt(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r));return e?(n.W=+e[0],r+e[0].length):-1}function Bt(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r,r+4));return e?(n.y=+e[0],r+e[0].length):-1}function Jt(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r,r+2));return e?(n.y=Gt(+e[0]),r+e[0].length):-1}function Wt(n,t,r){return/^[+-]\d{4}$/.test(t=t.substring(r,r+5))?(n.Z=-t,r+5):-1}function Gt(n){return n+(n>68?1900:2e3)}function Kt(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r,r+2));return e?(n.m=e[0]-1,r+e[0].length):-1}function Qt(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r,r+2));return e?(n.d=+e[0],r+e[0].length):-1}function nr(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r,r+3));return e?(n.j=+e[0],r+e[0].length):-1}function tr(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r,r+2));return e?(n.H=+e[0],r+e[0].length):-1}function rr(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r,r+2));return e?(n.M=+e[0],r+e[0].length):-1}function er(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r,r+2));return e?(n.S=+e[0],r+e[0].length):-1}function ur(n,t,r){oc.lastIndex=0;var e=oc.exec(t.substring(r,r+3));return e?(n.L=+e[0],r+e[0].length):-1}function ir(n){var t=n.getTimezoneOffset(),r=t>0?"-":"+",e=~~(ca(t)/60),u=ca(t)%60;return r+It(e,"0",2)+It(u,"0",2)}function or(n,t,r){ac.lastIndex=0;var e=ac.exec(t.substring(r,r+1));return e?r+e[0].length:-1}function ar(n){for(var t=n.length,r=-1;++r<t;)n[r][0]=this(n[r][0]);return function(t){for(var r=0,e=n[r];!e[1](t);)e=n[++r];return e[0](t)}}function cr(){}function sr(n,t,r){var e=r.s=n+t,u=e-n,i=e-u;r.t=n-i+(t-u)}function lr(n,t){n&&fc.hasOwnProperty(n.type)&&fc[n.type](n,t)}function fr(n,t,r){var e,u=-1,i=n.length-r;for(t.lineStart();++u<i;)e=n[u],t.point(e[0],e[1],e[2]);t.lineEnd()}function hr(n,t){var r=-1,e=n.length;for(t.polygonStart();++r<e;)fr(n[r],t,1);t.polygonEnd()}function gr(){function n(n,t){n*=za,t=t*za/2+ka/4;var r=n-e,o=r>=0?1:-1,a=o*r,c=Math.cos(t),s=Math.sin(t),l=i*s,f=u*c+l*Math.cos(a),h=l*o*Math.sin(a);gc.add(Math.atan2(h,f)),e=n,u=c,i=s}var t,r,e,u,i;pc.point=function(o,a){pc.point=n,e=(t=o)*za,u=Math.cos(a=(r=a)*za/2+ka/4),i=Math.sin(a)},pc.lineEnd=function(){n(t,r)}}function pr(n){var t=n[0],r=n[1],e=Math.cos(r);return[e*Math.cos(t),e*Math.sin(t),Math.sin(r)]}function vr(n,t){return n[0]*t[0]+n[1]*t[1]+n[2]*t[2]}function dr(n,t){return[n[1]*t[2]-n[2]*t[1],n[2]*t[0]-n[0]*t[2],n[0]*t[1]-n[1]*t[0]]}function mr(n,t){n[0]+=t[0],n[1]+=t[1],n[2]+=t[2]}function yr(n,t){return[n[0]*t,n[1]*t,n[2]*t]}function xr(n){var t=Math.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2]);n[0]/=t,n[1]/=t,n[2]/=t}function Mr(n){return[Math.atan2(n[1],n[0]),G(n[2])]}function _r(n,t){return ca(n[0]-t[0])<Ca&&ca(n[1]-t[1])<Ca}function br(n,t){n*=za;var r=Math.cos(t*=za);wr(r*Math.cos(n),r*Math.sin(n),Math.sin(t))}function wr(n,t,r){++vc,mc+=(n-mc)/vc,yc+=(t-yc)/vc,xc+=(r-xc)/vc}function Sr(){function n(n,u){n*=za;var i=Math.cos(u*=za),o=i*Math.cos(n),a=i*Math.sin(n),c=Math.sin(u),s=Math.atan2(Math.sqrt((s=r*c-e*a)*s+(s=e*o-t*c)*s+(s=t*a-r*o)*s),t*o+r*a+e*c);dc+=s,Mc+=s*(t+(t=o)),_c+=s*(r+(r=a)),bc+=s*(e+(e=c)),wr(t,r,e)}var t,r,e;Ec.point=function(u,i){u*=za;var o=Math.cos(i*=za);t=o*Math.cos(u),r=o*Math.sin(u),e=Math.sin(i),Ec.point=n,wr(t,r,e)}}function kr(){Ec.point=br}function Er(){function n(n,t){n*=za;var r=Math.cos(t*=za),o=r*Math.cos(n),a=r*Math.sin(n),c=Math.sin(t),s=u*c-i*a,l=i*o-e*c,f=e*a-u*o,h=Math.sqrt(s*s+l*l+f*f),g=e*o+u*a+i*c,p=h&&-W(g)/h,v=Math.atan2(h,g);wc+=p*s,Sc+=p*l,kc+=p*f,dc+=v,Mc+=v*(e+(e=o)),_c+=v*(u+(u=a)),bc+=v*(i+(i=c)),wr(e,u,i)}var t,r,e,u,i;Ec.point=function(o,a){t=o,r=a,Ec.point=n,o*=za;var c=Math.cos(a*=za);e=c*Math.cos(o),u=c*Math.sin(o),i=Math.sin(a),wr(e,u,i)},Ec.lineEnd=function(){n(t,r),Ec.lineEnd=kr,Ec.point=br}}function Ar(){return!0}function Cr(n,t,r,e,u){var i=[],o=[];if(n.forEach(function(n){if(!((t=n.length-1)<=0)){var t,r=n[0],e=n[t];if(_r(r,e)){u.lineStart();for(var a=0;t>a;++a)u.point((r=n[a])[0],r[1]);return u.lineEnd(),void 0}var c=new zr(r,n,null,!0),s=new zr(r,null,c,!1);c.o=s,i.push(c),o.push(s),c=new zr(e,n,null,!1),s=new zr(e,null,c,!0),c.o=s,i.push(c),o.push(s)}}),o.sort(t),Nr(i),Nr(o),i.length){for(var a=0,c=r,s=o.length;s>a;++a)o[a].e=c=!c;for(var l,f,h=i[0];;){for(var g=h,p=!0;g.v;)if((g=g.n)===h)return;l=g.z,u.lineStart();do{if(g.v=g.o.v=!0,g.e){if(p)for(var a=0,s=l.length;s>a;++a)u.point((f=l[a])[0],f[1]);else e(g.x,g.n.x,1,u);g=g.n}else{if(p){l=g.p.z;for(var a=l.length-1;a>=0;--a)u.point((f=l[a])[0],f[1])}else e(g.x,g.p.x,-1,u);g=g.p}g=g.o,l=g.z,p=!p}while(!g.v);u.lineEnd()}}}function Nr(n){if(t=n.length){for(var t,r,e=0,u=n[0];++e<t;)u.n=r=n[e],r.p=u,u=r;u.n=r=n[0],r.p=u}}function zr(n,t,r,e){this.x=n,this.z=t,this.o=r,this.e=e,this.v=!1,this.n=this.p=null}function Lr(n,t,r,e){return function(u,i){function o(t,r){var e=u(t,r);n(t=e[0],r=e[1])&&i.point(t,r)}function a(n,t){var r=u(n,t);d.point(r[0],r[1])}function c(){y.point=a,d.lineStart()}function s(){y.point=o,d.lineEnd()}function l(n,t){v.push([n,t]);var r=u(n,t);M.point(r[0],r[1])}function f(){M.lineStart(),v=[]}function h(){l(v[0][0],v[0][1]),M.lineEnd();var n,t=M.clean(),r=x.buffer(),e=r.length;if(v.pop(),p.push(v),v=null,e)if(1&t){n=r[0];var u,e=n.length-1,o=-1;if(e>0){for(_||(i.polygonStart(),_=!0),i.lineStart();++o<e;)i.point((u=n[o])[0],u[1]);i.lineEnd()}}else e>1&&2&t&&r.push(r.pop().concat(r.shift())),g.push(r.filter(Tr))}var g,p,v,d=t(i),m=u.invert(e[0],e[1]),y={point:o,lineStart:c,lineEnd:s,polygonStart:function(){y.point=l,y.lineStart=f,y.lineEnd=h,g=[],p=[]},polygonEnd:function(){y.point=o,y.lineStart=c,y.lineEnd=s,g=Bo.merge(g);var n=Dr(m,p);g.length?(_||(i.polygonStart(),_=!0),Cr(g,Rr,n,r,i)):n&&(_||(i.polygonStart(),_=!0),i.lineStart(),r(null,null,1,i),i.lineEnd()),_&&(i.polygonEnd(),_=!1),g=p=null},sphere:function(){i.polygonStart(),i.lineStart(),r(null,null,1,i),i.lineEnd(),i.polygonEnd()}},x=qr(),M=t(x),_=!1;return y}}function Tr(n){return n.length>1}function qr(){var n,t=[];return{lineStart:function(){t.push(n=[])},point:function(t,r){n.push([t,r])},lineEnd:v,buffer:function(){var r=t;return t=[],n=null,r},rejoin:function(){t.length>1&&t.push(t.pop().concat(t.shift()))}}}function Rr(n,t){return((n=n.x)[0]<0?n[1]-Aa-Ca:Aa-n[1])-((t=t.x)[0]<0?t[1]-Aa-Ca:Aa-t[1])}function Dr(n,t){var r=n[0],e=n[1],u=[Math.sin(r),-Math.cos(r),0],i=0,o=0;gc.reset();for(var a=0,c=t.length;c>a;++a){var s=t[a],l=s.length;if(l)for(var f=s[0],h=f[0],g=f[1]/2+ka/4,p=Math.sin(g),v=Math.cos(g),d=1;;){d===l&&(d=0),n=s[d];var m=n[0],y=n[1]/2+ka/4,x=Math.sin(y),M=Math.cos(y),_=m-h,b=_>=0?1:-1,w=b*_,S=w>ka,k=p*x;if(gc.add(Math.atan2(k*b*Math.sin(w),v*M+k*Math.cos(w))),i+=S?_+b*Ea:_,S^h>=r^m>=r){var E=dr(pr(f),pr(n));xr(E);var A=dr(u,E);xr(A);var C=(S^_>=0?-1:1)*G(A[2]);(e>C||e===C&&(E[0]||E[1]))&&(o+=S^_>=0?1:-1)}if(!d++)break;h=m,p=x,v=M,f=n}}return(-Ca>i||Ca>i&&0>gc)^1&o}function Pr(n){var t,r=0/0,e=0/0,u=0/0;return{lineStart:function(){n.lineStart(),t=1},point:function(i,o){var a=i>0?ka:-ka,c=ca(i-r);ca(c-ka)<Ca?(n.point(r,e=(e+o)/2>0?Aa:-Aa),n.point(u,e),n.lineEnd(),n.lineStart(),n.point(a,e),n.point(i,e),t=0):u!==a&&c>=ka&&(ca(r-u)<Ca&&(r-=u*Ca),ca(i-a)<Ca&&(i-=a*Ca),e=Ur(r,e,i,o),n.point(u,e),n.lineEnd(),n.lineStart(),n.point(a,e),t=0),n.point(r=i,e=o),u=a},lineEnd:function(){n.lineEnd(),r=e=0/0},clean:function(){return 2-t}}}function Ur(n,t,r,e){var u,i,o=Math.sin(n-r);return ca(o)>Ca?Math.atan((Math.sin(t)*(i=Math.cos(e))*Math.sin(r)-Math.sin(e)*(u=Math.cos(t))*Math.sin(n))/(u*i*o)):(t+e)/2}function jr(n,t,r,e){var u;if(null==n)u=r*Aa,e.point(-ka,u),e.point(0,u),e.point(ka,u),e.point(ka,0),e.point(ka,-u),e.point(0,-u),e.point(-ka,-u),e.point(-ka,0),e.point(-ka,u);else if(ca(n[0]-t[0])>Ca){var i=n[0]<t[0]?ka:-ka;u=r*i/2,e.point(-i,u),e.point(0,u),e.point(i,u)}else e.point(t[0],t[1])}function Hr(n){function t(n,t){return Math.cos(n)*Math.cos(t)>i}function r(n){var r,i,c,s,l;return{lineStart:function(){s=c=!1,l=1},point:function(f,h){var g,p=[f,h],v=t(f,h),d=o?v?0:u(f,h):v?u(f+(0>f?ka:-ka),h):0;if(!r&&(s=c=v)&&n.lineStart(),v!==c&&(g=e(r,p),(_r(r,g)||_r(p,g))&&(p[0]+=Ca,p[1]+=Ca,v=t(p[0],p[1]))),v!==c)l=0,v?(n.lineStart(),g=e(p,r),n.point(g[0],g[1])):(g=e(r,p),n.point(g[0],g[1]),n.lineEnd()),r=g;else if(a&&r&&o^v){var m;d&i||!(m=e(p,r,!0))||(l=0,o?(n.lineStart(),n.point(m[0][0],m[0][1]),n.point(m[1][0],m[1][1]),n.lineEnd()):(n.point(m[1][0],m[1][1]),n.lineEnd(),n.lineStart(),n.point(m[0][0],m[0][1])))}!v||r&&_r(r,p)||n.point(p[0],p[1]),r=p,c=v,i=d},lineEnd:function(){c&&n.lineEnd(),r=null},clean:function(){return l|(s&&c)<<1}}}function e(n,t,r){var e=pr(n),u=pr(t),o=[1,0,0],a=dr(e,u),c=vr(a,a),s=a[0],l=c-s*s;if(!l)return!r&&n;var f=i*c/l,h=-i*s/l,g=dr(o,a),p=yr(o,f),v=yr(a,h);mr(p,v);var d=g,m=vr(p,d),y=vr(d,d),x=m*m-y*(vr(p,p)-1);if(!(0>x)){var M=Math.sqrt(x),_=yr(d,(-m-M)/y);if(mr(_,p),_=Mr(_),!r)return _;var b,w=n[0],S=t[0],k=n[1],E=t[1];w>S&&(b=w,w=S,S=b);var A=S-w,C=ca(A-ka)<Ca,N=C||Ca>A;if(!C&&k>E&&(b=k,k=E,E=b),N?C?k+E>0^_[1]<(ca(_[0]-w)<Ca?k:E):k<=_[1]&&_[1]<=E:A>ka^(w<=_[0]&&_[0]<=S)){var z=yr(d,(-m+M)/y);return mr(z,p),[_,Mr(z)]}}}function u(t,r){var e=o?n:ka-n,u=0;return-e>t?u|=1:t>e&&(u|=2),-e>r?u|=4:r>e&&(u|=8),u}var i=Math.cos(n),o=i>0,a=ca(i)>Ca,c=ge(n,6*za);return Lr(t,r,c,o?[0,-n]:[-ka,n-ka])}function Fr(n,t,r,e){return function(u){var i,o=u.a,a=u.b,c=o.x,s=o.y,l=a.x,f=a.y,h=0,g=1,p=l-c,v=f-s;if(i=n-c,p||!(i>0)){if(i/=p,0>p){if(h>i)return;g>i&&(g=i)}else if(p>0){if(i>g)return;i>h&&(h=i)}if(i=r-c,p||!(0>i)){if(i/=p,0>p){if(i>g)return;i>h&&(h=i)}else if(p>0){if(h>i)return;g>i&&(g=i)}if(i=t-s,v||!(i>0)){if(i/=v,0>v){if(h>i)return;g>i&&(g=i)}else if(v>0){if(i>g)return;i>h&&(h=i)}if(i=e-s,v||!(0>i)){if(i/=v,0>v){if(i>g)return;i>h&&(h=i)}else if(v>0){if(h>i)return;g>i&&(g=i)}return h>0&&(u.a={x:c+h*p,y:s+h*v}),1>g&&(u.b={x:c+g*p,y:s+g*v}),u}}}}}}function Or(n,t,r,e){function u(e,u){return ca(e[0]-n)<Ca?u>0?0:3:ca(e[0]-r)<Ca?u>0?2:1:ca(e[1]-t)<Ca?u>0?1:0:u>0?3:2}function i(n,t){return o(n.x,t.x)}function o(n,t){var r=u(n,1),e=u(t,1);return r!==e?r-e:0===r?t[1]-n[1]:1===r?n[0]-t[0]:2===r?n[1]-t[1]:t[0]-n[0]}return function(a){function c(n){for(var t=0,r=d.length,e=n[1],u=0;r>u;++u)for(var i,o=1,a=d[u],c=a.length,s=a[0];c>o;++o)i=a[o],s[1]<=e?i[1]>e&&J(s,i,n)>0&&++t:i[1]<=e&&J(s,i,n)<0&&--t,s=i;return 0!==t}function s(i,a,c,s){var l=0,f=0;if(null==i||(l=u(i,c))!==(f=u(a,c))||o(i,a)<0^c>0){do s.point(0===l||3===l?n:r,l>1?e:t);while((l=(l+c+4)%4)!==f)}else s.point(a[0],a[1])}function l(u,i){return u>=n&&r>=u&&i>=t&&e>=i}function f(n,t){l(n,t)&&a.point(n,t)}function h(){N.point=p,d&&d.push(m=[]),S=!0,w=!1,_=b=0/0}function g(){v&&(p(y,x),M&&w&&A.rejoin(),v.push(A.buffer())),N.point=f,w&&a.lineEnd()}function p(n,t){n=Math.max(-Cc,Math.min(Cc,n)),t=Math.max(-Cc,Math.min(Cc,t));var r=l(n,t);if(d&&m.push([n,t]),S)y=n,x=t,M=r,S=!1,r&&(a.lineStart(),a.point(n,t));else if(r&&w)a.point(n,t);else{var e={a:{x:_,y:b},b:{x:n,y:t}};C(e)?(w||(a.lineStart(),a.point(e.a.x,e.a.y)),a.point(e.b.x,e.b.y),r||a.lineEnd(),k=!1):r&&(a.lineStart(),a.point(n,t),k=!1)}_=n,b=t,w=r}var v,d,m,y,x,M,_,b,w,S,k,E=a,A=qr(),C=Fr(n,t,r,e),N={point:f,lineStart:h,lineEnd:g,polygonStart:function(){a=A,v=[],d=[],k=!0},polygonEnd:function(){a=E,v=Bo.merge(v);var t=c([n,e]),r=k&&t,u=v.length;(r||u)&&(a.polygonStart(),r&&(a.lineStart(),s(null,null,1,a),a.lineEnd()),u&&Cr(v,i,t,s,a),a.polygonEnd()),v=d=m=null}};return N}}function Ir(n,t){function r(r,e){return r=n(r,e),t(r[0],r[1])}return n.invert&&t.invert&&(r.invert=function(r,e){return r=t.invert(r,e),r&&n.invert(r[0],r[1])}),r}function Yr(n){var t=0,r=ka/3,e=ie(n),u=e(t,r);return u.parallels=function(n){return arguments.length?e(t=n[0]*ka/180,r=n[1]*ka/180):[180*(t/ka),180*(r/ka)]},u}function Zr(n,t){function r(n,t){var r=Math.sqrt(i-2*u*Math.sin(t))/u;return[r*Math.sin(n*=u),o-r*Math.cos(n)]}var e=Math.sin(n),u=(e+Math.sin(t))/2,i=1+e*(2*u-e),o=Math.sqrt(i)/u;return r.invert=function(n,t){var r=o-t;return[Math.atan2(n,r)/u,G((i-(n*n+r*r)*u*u)/(2*u))]},r}function Vr(){function n(n,t){zc+=u*n-e*t,e=n,u=t}var t,r,e,u;Dc.point=function(i,o){Dc.point=n,t=e=i,r=u=o},Dc.lineEnd=function(){n(t,r)}}function $r(n,t){Lc>n&&(Lc=n),n>qc&&(qc=n),Tc>t&&(Tc=t),t>Rc&&(Rc=t)}function Xr(){function n(n,t){o.push("M",n,",",t,i)}function t(n,t){o.push("M",n,",",t),a.point=r}function r(n,t){o.push("L",n,",",t)}function e(){a.point=n}function u(){o.push("Z")}var i=Br(4.5),o=[],a={point:n,lineStart:function(){a.point=t},lineEnd:e,polygonStart:function(){a.lineEnd=u},polygonEnd:function(){a.lineEnd=e,a.point=n},pointRadius:function(n){return i=Br(n),a},result:function(){if(o.length){var n=o.join("");return o=[],n}}};return a}function Br(n){return"m0,"+n+"a"+n+","+n+" 0 1,1 0,"+-2*n+"a"+n+","+n+" 0 1,1 0,"+2*n+"z"}function Jr(n,t){mc+=n,yc+=t,++xc}function Wr(){function n(n,e){var u=n-t,i=e-r,o=Math.sqrt(u*u+i*i);Mc+=o*(t+n)/2,_c+=o*(r+e)/2,bc+=o,Jr(t=n,r=e)}var t,r;Uc.point=function(e,u){Uc.point=n,Jr(t=e,r=u)}}function Gr(){Uc.point=Jr}function Kr(){function n(n,t){var r=n-e,i=t-u,o=Math.sqrt(r*r+i*i);Mc+=o*(e+n)/2,_c+=o*(u+t)/2,bc+=o,o=u*n-e*t,wc+=o*(e+n),Sc+=o*(u+t),kc+=3*o,Jr(e=n,u=t)}var t,r,e,u;Uc.point=function(i,o){Uc.point=n,Jr(t=e=i,r=u=o)},Uc.lineEnd=function(){n(t,r)}}function Qr(n){function t(t,r){n.moveTo(t,r),n.arc(t,r,o,0,Ea)}function r(t,r){n.moveTo(t,r),a.point=e}function e(t,r){n.lineTo(t,r)}function u(){a.point=t}function i(){n.closePath()}var o=4.5,a={point:t,lineStart:function(){a.point=r},lineEnd:u,polygonStart:function(){a.lineEnd=i},polygonEnd:function(){a.lineEnd=u,a.point=t},pointRadius:function(n){return o=n,a},result:v};return a}function ne(n){function t(n){return(a?e:r)(n)}function r(t){return ee(t,function(r,e){r=n(r,e),t.point(r[0],r[1])})}function e(t){function r(r,e){r=n(r,e),t.point(r[0],r[1])}function e(){x=0/0,S.point=i,t.lineStart()}function i(r,e){var i=pr([r,e]),o=n(r,e);u(x,M,y,_,b,w,x=o[0],M=o[1],y=r,_=i[0],b=i[1],w=i[2],a,t),t.point(x,M)}function o(){S.point=r,t.lineEnd()}function c(){e(),S.point=s,S.lineEnd=l}function s(n,t){i(f=n,h=t),g=x,p=M,v=_,d=b,m=w,S.point=i}function l(){u(x,M,y,_,b,w,g,p,f,v,d,m,a,t),S.lineEnd=o,o()}var f,h,g,p,v,d,m,y,x,M,_,b,w,S={point:r,lineStart:e,lineEnd:o,polygonStart:function(){t.polygonStart(),S.lineStart=c},polygonEnd:function(){t.polygonEnd(),S.lineStart=e}};return S}function u(t,r,e,a,c,s,l,f,h,g,p,v,d,m){var y=l-t,x=f-r,M=y*y+x*x;if(M>4*i&&d--){var _=a+g,b=c+p,w=s+v,S=Math.sqrt(_*_+b*b+w*w),k=Math.asin(w/=S),E=ca(ca(w)-1)<Ca||ca(e-h)<Ca?(e+h)/2:Math.atan2(b,_),A=n(E,k),C=A[0],N=A[1],z=C-t,L=N-r,T=x*z-y*L;(T*T/M>i||ca((y*z+x*L)/M-.5)>.3||o>a*g+c*p+s*v)&&(u(t,r,e,a,c,s,C,N,E,_/=S,b/=S,w,d,m),m.point(C,N),u(C,N,E,_,b,w,l,f,h,g,p,v,d,m))}}var i=.5,o=Math.cos(30*za),a=16;return t.precision=function(n){return arguments.length?(a=(i=n*n)>0&&16,t):Math.sqrt(i)},t}function te(n){var t=ne(function(t,r){return n([t*La,r*La])});return function(n){return oe(t(n))}}function re(n){this.stream=n}function ee(n,t){return{point:t,sphere:function(){n.sphere()},lineStart:function(){n.lineStart()},lineEnd:function(){n.lineEnd()},polygonStart:function(){n.polygonStart()},polygonEnd:function(){n.polygonEnd()}}}function ue(n){return ie(function(){return n})()}function ie(n){function t(n){return n=a(n[0]*za,n[1]*za),[n[0]*h+c,s-n[1]*h]}function r(n){return n=a.invert((n[0]-c)/h,(s-n[1])/h),n&&[n[0]*La,n[1]*La]}function e(){a=Ir(o=se(m,y,x),i);var n=i(v,d);return c=g-n[0]*h,s=p+n[1]*h,u()
}function u(){return l&&(l.valid=!1,l=null),t}var i,o,a,c,s,l,f=ne(function(n,t){return n=i(n,t),[n[0]*h+c,s-n[1]*h]}),h=150,g=480,p=250,v=0,d=0,m=0,y=0,x=0,M=Ac,_=At,b=null,w=null;return t.stream=function(n){return l&&(l.valid=!1),l=oe(M(o,f(_(n)))),l.valid=!0,l},t.clipAngle=function(n){return arguments.length?(M=null==n?(b=n,Ac):Hr((b=+n)*za),u()):b},t.clipExtent=function(n){return arguments.length?(w=n,_=n?Or(n[0][0],n[0][1],n[1][0],n[1][1]):At,u()):w},t.scale=function(n){return arguments.length?(h=+n,e()):h},t.translate=function(n){return arguments.length?(g=+n[0],p=+n[1],e()):[g,p]},t.center=function(n){return arguments.length?(v=n[0]%360*za,d=n[1]%360*za,e()):[v*La,d*La]},t.rotate=function(n){return arguments.length?(m=n[0]%360*za,y=n[1]%360*za,x=n.length>2?n[2]%360*za:0,e()):[m*La,y*La,x*La]},Bo.rebind(t,f,"precision"),function(){return i=n.apply(this,arguments),t.invert=i.invert&&r,e()}}function oe(n){return ee(n,function(t,r){n.point(t*za,r*za)})}function ae(n,t){return[n,t]}function ce(n,t){return[n>ka?n-Ea:-ka>n?n+Ea:n,t]}function se(n,t,r){return n?t||r?Ir(fe(n),he(t,r)):fe(n):t||r?he(t,r):ce}function le(n){return function(t,r){return t+=n,[t>ka?t-Ea:-ka>t?t+Ea:t,r]}}function fe(n){var t=le(n);return t.invert=le(-n),t}function he(n,t){function r(n,t){var r=Math.cos(t),a=Math.cos(n)*r,c=Math.sin(n)*r,s=Math.sin(t),l=s*e+a*u;return[Math.atan2(c*i-l*o,a*e-s*u),G(l*i+c*o)]}var e=Math.cos(n),u=Math.sin(n),i=Math.cos(t),o=Math.sin(t);return r.invert=function(n,t){var r=Math.cos(t),a=Math.cos(n)*r,c=Math.sin(n)*r,s=Math.sin(t),l=s*i-c*o;return[Math.atan2(c*i+s*o,a*e+l*u),G(l*e-a*u)]},r}function ge(n,t){var r=Math.cos(n),e=Math.sin(n);return function(u,i,o,a){var c=o*t;null!=u?(u=pe(r,u),i=pe(r,i),(o>0?i>u:u>i)&&(u+=o*Ea)):(u=n+o*Ea,i=n-.5*c);for(var s,l=u;o>0?l>i:i>l;l-=c)a.point((s=Mr([r,-e*Math.cos(l),-e*Math.sin(l)]))[0],s[1])}}function pe(n,t){var r=pr(t);r[0]-=n,xr(r);var e=W(-r[1]);return((-r[2]<0?-e:e)+2*Math.PI-Ca)%(2*Math.PI)}function ve(n,t,r){var e=Bo.range(n,t-Ca,r).concat(t);return function(n){return e.map(function(t){return[n,t]})}}function de(n,t,r){var e=Bo.range(n,t-Ca,r).concat(t);return function(n){return e.map(function(t){return[t,n]})}}function me(n){return n.source}function ye(n){return n.target}function xe(n,t,r,e){var u=Math.cos(t),i=Math.sin(t),o=Math.cos(e),a=Math.sin(e),c=u*Math.cos(n),s=u*Math.sin(n),l=o*Math.cos(r),f=o*Math.sin(r),h=2*Math.asin(Math.sqrt(tt(e-t)+u*o*tt(r-n))),g=1/Math.sin(h),p=h?function(n){var t=Math.sin(n*=h)*g,r=Math.sin(h-n)*g,e=r*c+t*l,u=r*s+t*f,o=r*i+t*a;return[Math.atan2(u,e)*La,Math.atan2(o,Math.sqrt(e*e+u*u))*La]}:function(){return[n*La,t*La]};return p.distance=h,p}function Me(){function n(n,u){var i=Math.sin(u*=za),o=Math.cos(u),a=ca((n*=za)-t),c=Math.cos(a);jc+=Math.atan2(Math.sqrt((a=o*Math.sin(a))*a+(a=e*i-r*o*c)*a),r*i+e*o*c),t=n,r=i,e=o}var t,r,e;Hc.point=function(u,i){t=u*za,r=Math.sin(i*=za),e=Math.cos(i),Hc.point=n},Hc.lineEnd=function(){Hc.point=Hc.lineEnd=v}}function _e(n,t){function r(t,r){var e=Math.cos(t),u=Math.cos(r),i=n(e*u);return[i*u*Math.sin(t),i*Math.sin(r)]}return r.invert=function(n,r){var e=Math.sqrt(n*n+r*r),u=t(e),i=Math.sin(u),o=Math.cos(u);return[Math.atan2(n*i,e*o),Math.asin(e&&r*i/e)]},r}function be(n,t){function r(n,t){o>0?-Aa+Ca>t&&(t=-Aa+Ca):t>Aa-Ca&&(t=Aa-Ca);var r=o/Math.pow(u(t),i);return[r*Math.sin(i*n),o-r*Math.cos(i*n)]}var e=Math.cos(n),u=function(n){return Math.tan(ka/4+n/2)},i=n===t?Math.sin(n):Math.log(e/Math.cos(t))/Math.log(u(t)/u(n)),o=e*Math.pow(u(n),i)/i;return i?(r.invert=function(n,t){var r=o-t,e=B(i)*Math.sqrt(n*n+r*r);return[Math.atan2(n,r)/i,2*Math.atan(Math.pow(o/e,1/i))-Aa]},r):Se}function we(n,t){function r(n,t){var r=i-t;return[r*Math.sin(u*n),i-r*Math.cos(u*n)]}var e=Math.cos(n),u=n===t?Math.sin(n):(e-Math.cos(t))/(t-n),i=e/u+n;return ca(u)<Ca?ae:(r.invert=function(n,t){var r=i-t;return[Math.atan2(n,r)/u,i-B(u)*Math.sqrt(n*n+r*r)]},r)}function Se(n,t){return[n,Math.log(Math.tan(ka/4+t/2))]}function ke(n){var t,r=ue(n),e=r.scale,u=r.translate,i=r.clipExtent;return r.scale=function(){var n=e.apply(r,arguments);return n===r?t?r.clipExtent(null):r:n},r.translate=function(){var n=u.apply(r,arguments);return n===r?t?r.clipExtent(null):r:n},r.clipExtent=function(n){var o=i.apply(r,arguments);if(o===r){if(t=null==n){var a=ka*e(),c=u();i([[c[0]-a,c[1]-a],[c[0]+a,c[1]+a]])}}else t&&(o=null);return o},r.clipExtent(null)}function Ee(n,t){return[Math.log(Math.tan(ka/4+t/2)),-n]}function Ae(n){return n[0]}function Ce(n){return n[1]}function Ne(n){for(var t=n.length,r=[0,1],e=2,u=2;t>u;u++){for(;e>1&&J(n[r[e-2]],n[r[e-1]],n[u])<=0;)--e;r[e++]=u}return r.slice(0,e)}function ze(n,t){return n[0]-t[0]||n[1]-t[1]}function Le(n,t,r){return(r[0]-t[0])*(n[1]-t[1])<(r[1]-t[1])*(n[0]-t[0])}function Te(n,t,r,e){var u=n[0],i=r[0],o=t[0]-u,a=e[0]-i,c=n[1],s=r[1],l=t[1]-c,f=e[1]-s,h=(a*(c-s)-f*(u-i))/(f*o-a*l);return[u+h*o,c+h*l]}function qe(n){var t=n[0],r=n[n.length-1];return!(t[0]-r[0]||t[1]-r[1])}function Re(){tu(this),this.edge=this.site=this.circle=null}function De(n){var t=Gc.pop()||new Re;return t.site=n,t}function Pe(n){$e(n),Bc.remove(n),Gc.push(n),tu(n)}function Ue(n){var t=n.circle,r=t.x,e=t.cy,u={x:r,y:e},i=n.P,o=n.N,a=[n];Pe(n);for(var c=i;c.circle&&ca(r-c.circle.x)<Ca&&ca(e-c.circle.cy)<Ca;)i=c.P,a.unshift(c),Pe(c),c=i;a.unshift(c),$e(c);for(var s=o;s.circle&&ca(r-s.circle.x)<Ca&&ca(e-s.circle.cy)<Ca;)o=s.N,a.push(s),Pe(s),s=o;a.push(s),$e(s);var l,f=a.length;for(l=1;f>l;++l)s=a[l],c=a[l-1],Ke(s.edge,c.site,s.site,u);c=a[0],s=a[f-1],s.edge=We(c.site,s.site,null,u),Ve(c),Ve(s)}function je(n){for(var t,r,e,u,i=n.x,o=n.y,a=Bc._;a;)if(e=He(a,o)-i,e>Ca)a=a.L;else{if(u=i-Fe(a,o),!(u>Ca)){e>-Ca?(t=a.P,r=a):u>-Ca?(t=a,r=a.N):t=r=a;break}if(!a.R){t=a;break}a=a.R}var c=De(n);if(Bc.insert(t,c),t||r){if(t===r)return $e(t),r=De(t.site),Bc.insert(c,r),c.edge=r.edge=We(t.site,c.site),Ve(t),Ve(r),void 0;if(!r)return c.edge=We(t.site,c.site),void 0;$e(t),$e(r);var s=t.site,l=s.x,f=s.y,h=n.x-l,g=n.y-f,p=r.site,v=p.x-l,d=p.y-f,m=2*(h*d-g*v),y=h*h+g*g,x=v*v+d*d,M={x:(d*y-g*x)/m+l,y:(h*x-v*y)/m+f};Ke(r.edge,s,p,M),c.edge=We(s,n,null,M),r.edge=We(n,p,null,M),Ve(t),Ve(r)}}function He(n,t){var r=n.site,e=r.x,u=r.y,i=u-t;if(!i)return e;var o=n.P;if(!o)return-1/0;r=o.site;var a=r.x,c=r.y,s=c-t;if(!s)return a;var l=a-e,f=1/i-1/s,h=l/s;return f?(-h+Math.sqrt(h*h-2*f*(l*l/(-2*s)-c+s/2+u-i/2)))/f+e:(e+a)/2}function Fe(n,t){var r=n.N;if(r)return He(r,t);var e=n.site;return e.y===t?e.x:1/0}function Oe(n){this.site=n,this.edges=[]}function Ie(n){for(var t,r,e,u,i,o,a,c,s,l,f=n[0][0],h=n[1][0],g=n[0][1],p=n[1][1],v=Xc,d=v.length;d--;)if(i=v[d],i&&i.prepare())for(a=i.edges,c=a.length,o=0;c>o;)l=a[o].end(),e=l.x,u=l.y,s=a[++o%c].start(),t=s.x,r=s.y,(ca(e-t)>Ca||ca(u-r)>Ca)&&(a.splice(o,0,new Qe(Ge(i.site,l,ca(e-f)<Ca&&p-u>Ca?{x:f,y:ca(t-f)<Ca?r:p}:ca(u-p)<Ca&&h-e>Ca?{x:ca(r-p)<Ca?t:h,y:p}:ca(e-h)<Ca&&u-g>Ca?{x:h,y:ca(t-h)<Ca?r:g}:ca(u-g)<Ca&&e-f>Ca?{x:ca(r-g)<Ca?t:f,y:g}:null),i.site,null)),++c)}function Ye(n,t){return t.angle-n.angle}function Ze(){tu(this),this.x=this.y=this.arc=this.site=this.cy=null}function Ve(n){var t=n.P,r=n.N;if(t&&r){var e=t.site,u=n.site,i=r.site;if(e!==i){var o=u.x,a=u.y,c=e.x-o,s=e.y-a,l=i.x-o,f=i.y-a,h=2*(c*f-s*l);if(!(h>=-Na)){var g=c*c+s*s,p=l*l+f*f,v=(f*g-s*p)/h,d=(c*p-l*g)/h,f=d+a,m=Kc.pop()||new Ze;m.arc=n,m.site=u,m.x=v+o,m.y=f+Math.sqrt(v*v+d*d),m.cy=f,n.circle=m;for(var y=null,x=Wc._;x;)if(m.y<x.y||m.y===x.y&&m.x<=x.x){if(!x.L){y=x.P;break}x=x.L}else{if(!x.R){y=x;break}x=x.R}Wc.insert(y,m),y||(Jc=m)}}}}function $e(n){var t=n.circle;t&&(t.P||(Jc=t.N),Wc.remove(t),Kc.push(t),tu(t),n.circle=null)}function Xe(n){for(var t,r=$c,e=Fr(n[0][0],n[0][1],n[1][0],n[1][1]),u=r.length;u--;)t=r[u],(!Be(t,n)||!e(t)||ca(t.a.x-t.b.x)<Ca&&ca(t.a.y-t.b.y)<Ca)&&(t.a=t.b=null,r.splice(u,1))}function Be(n,t){var r=n.b;if(r)return!0;var e,u,i=n.a,o=t[0][0],a=t[1][0],c=t[0][1],s=t[1][1],l=n.l,f=n.r,h=l.x,g=l.y,p=f.x,v=f.y,d=(h+p)/2,m=(g+v)/2;if(v===g){if(o>d||d>=a)return;if(h>p){if(i){if(i.y>=s)return}else i={x:d,y:c};r={x:d,y:s}}else{if(i){if(i.y<c)return}else i={x:d,y:s};r={x:d,y:c}}}else if(e=(h-p)/(v-g),u=m-e*d,-1>e||e>1)if(h>p){if(i){if(i.y>=s)return}else i={x:(c-u)/e,y:c};r={x:(s-u)/e,y:s}}else{if(i){if(i.y<c)return}else i={x:(s-u)/e,y:s};r={x:(c-u)/e,y:c}}else if(v>g){if(i){if(i.x>=a)return}else i={x:o,y:e*o+u};r={x:a,y:e*a+u}}else{if(i){if(i.x<o)return}else i={x:a,y:e*a+u};r={x:o,y:e*o+u}}return n.a=i,n.b=r,!0}function Je(n,t){this.l=n,this.r=t,this.a=this.b=null}function We(n,t,r,e){var u=new Je(n,t);return $c.push(u),r&&Ke(u,n,t,r),e&&Ke(u,t,n,e),Xc[n.i].edges.push(new Qe(u,n,t)),Xc[t.i].edges.push(new Qe(u,t,n)),u}function Ge(n,t,r){var e=new Je(n,null);return e.a=t,e.b=r,$c.push(e),e}function Ke(n,t,r,e){n.a||n.b?n.l===r?n.b=e:n.a=e:(n.a=e,n.l=t,n.r=r)}function Qe(n,t,r){var e=n.a,u=n.b;this.edge=n,this.site=t,this.angle=r?Math.atan2(r.y-t.y,r.x-t.x):n.l===t?Math.atan2(u.x-e.x,e.y-u.y):Math.atan2(e.x-u.x,u.y-e.y)}function nu(){this._=null}function tu(n){n.U=n.C=n.L=n.R=n.P=n.N=null}function ru(n,t){var r=t,e=t.R,u=r.U;u?u.L===r?u.L=e:u.R=e:n._=e,e.U=u,r.U=e,r.R=e.L,r.R&&(r.R.U=r),e.L=r}function eu(n,t){var r=t,e=t.L,u=r.U;u?u.L===r?u.L=e:u.R=e:n._=e,e.U=u,r.U=e,r.L=e.R,r.L&&(r.L.U=r),e.R=r}function uu(n){for(;n.L;)n=n.L;return n}function iu(n,t){var r,e,u,i=n.sort(ou).pop();for($c=[],Xc=new Array(n.length),Bc=new nu,Wc=new nu;;)if(u=Jc,i&&(!u||i.y<u.y||i.y===u.y&&i.x<u.x))(i.x!==r||i.y!==e)&&(Xc[i.i]=new Oe(i),je(i),r=i.x,e=i.y),i=n.pop();else{if(!u)break;Ue(u.arc)}t&&(Xe(t),Ie(t));var o={cells:Xc,edges:$c};return Bc=Wc=$c=Xc=null,o}function ou(n,t){return t.y-n.y||t.x-n.x}function au(n,t,r){return(n.x-r.x)*(t.y-n.y)-(n.x-t.x)*(r.y-n.y)}function cu(n){return n.x}function su(n){return n.y}function lu(){return{leaf:!0,nodes:[],point:null,x:null,y:null}}function fu(n,t,r,e,u,i){if(!n(t,r,e,u,i)){var o=.5*(r+u),a=.5*(e+i),c=t.nodes;c[0]&&fu(n,c[0],r,e,o,a),c[1]&&fu(n,c[1],o,e,u,a),c[2]&&fu(n,c[2],r,a,o,i),c[3]&&fu(n,c[3],o,a,u,i)}}function hu(n,t){n=Bo.rgb(n),t=Bo.rgb(t);var r=n.r,e=n.g,u=n.b,i=t.r-r,o=t.g-e,a=t.b-u;return function(n){return"#"+Mt(Math.round(r+i*n))+Mt(Math.round(e+o*n))+Mt(Math.round(u+a*n))}}function gu(n,t){var r,e={},u={};for(r in n)r in t?e[r]=du(n[r],t[r]):u[r]=n[r];for(r in t)r in n||(u[r]=t[r]);return function(n){for(r in e)u[r]=e[r](n);return u}}function pu(n,t){return t-=n=+n,function(r){return n+t*r}}function vu(n,t){var r,e,u,i=ns.lastIndex=ts.lastIndex=0,o=-1,a=[],c=[];for(n+="",t+="";(r=ns.exec(n))&&(e=ts.exec(t));)(u=e.index)>i&&(u=t.substring(i,u),a[o]?a[o]+=u:a[++o]=u),(r=r[0])===(e=e[0])?a[o]?a[o]+=e:a[++o]=e:(a[++o]=null,c.push({i:o,x:pu(r,e)})),i=ts.lastIndex;return i<t.length&&(u=t.substring(i),a[o]?a[o]+=u:a[++o]=u),a.length<2?c[0]?(t=c[0].x,function(n){return t(n)+""}):function(){return t}:(t=c.length,function(n){for(var r,e=0;t>e;++e)a[(r=c[e]).i]=r.x(n);return a.join("")})}function du(n,t){for(var r,e=Bo.interpolators.length;--e>=0&&!(r=Bo.interpolators[e](n,t)););return r}function mu(n,t){var r,e=[],u=[],i=n.length,o=t.length,a=Math.min(n.length,t.length);for(r=0;a>r;++r)e.push(du(n[r],t[r]));for(;i>r;++r)u[r]=n[r];for(;o>r;++r)u[r]=t[r];return function(n){for(r=0;a>r;++r)u[r]=e[r](n);return u}}function yu(n){return function(t){return 0>=t?0:t>=1?1:n(t)}}function xu(n){return function(t){return 1-n(1-t)}}function Mu(n){return function(t){return.5*(.5>t?n(2*t):2-n(2-2*t))}}function _u(n){return n*n}function bu(n){return n*n*n}function wu(n){if(0>=n)return 0;if(n>=1)return 1;var t=n*n,r=t*n;return 4*(.5>n?r:3*(n-t)+r-.75)}function Su(n){return function(t){return Math.pow(t,n)}}function ku(n){return 1-Math.cos(n*Aa)}function Eu(n){return Math.pow(2,10*(n-1))}function Au(n){return 1-Math.sqrt(1-n*n)}function Cu(n,t){var r;return arguments.length<2&&(t=.45),arguments.length?r=t/Ea*Math.asin(1/n):(n=1,r=t/4),function(e){return 1+n*Math.pow(2,-10*e)*Math.sin((e-r)*Ea/t)}}function Nu(n){return n||(n=1.70158),function(t){return t*t*((n+1)*t-n)}}function zu(n){return 1/2.75>n?7.5625*n*n:2/2.75>n?7.5625*(n-=1.5/2.75)*n+.75:2.5/2.75>n?7.5625*(n-=2.25/2.75)*n+.9375:7.5625*(n-=2.625/2.75)*n+.984375}function Lu(n,t){n=Bo.hcl(n),t=Bo.hcl(t);var r=n.h,e=n.c,u=n.l,i=t.h-r,o=t.c-e,a=t.l-u;return isNaN(o)&&(o=0,e=isNaN(e)?t.c:e),isNaN(i)?(i=0,r=isNaN(r)?t.h:r):i>180?i-=360:-180>i&&(i+=360),function(n){return ct(r+i*n,e+o*n,u+a*n)+""}}function Tu(n,t){n=Bo.hsl(n),t=Bo.hsl(t);var r=n.h,e=n.s,u=n.l,i=t.h-r,o=t.s-e,a=t.l-u;return isNaN(o)&&(o=0,e=isNaN(e)?t.s:e),isNaN(i)?(i=0,r=isNaN(r)?t.h:r):i>180?i-=360:-180>i&&(i+=360),function(n){return it(r+i*n,e+o*n,u+a*n)+""}}function qu(n,t){n=Bo.lab(n),t=Bo.lab(t);var r=n.l,e=n.a,u=n.b,i=t.l-r,o=t.a-e,a=t.b-u;return function(n){return ft(r+i*n,e+o*n,u+a*n)+""}}function Ru(n,t){return t-=n,function(r){return Math.round(n+t*r)}}function Du(n){var t=[n.a,n.b],r=[n.c,n.d],e=Uu(t),u=Pu(t,r),i=Uu(ju(r,t,-u))||0;t[0]*r[1]<r[0]*t[1]&&(t[0]*=-1,t[1]*=-1,e*=-1,u*=-1),this.rotate=(e?Math.atan2(t[1],t[0]):Math.atan2(-r[0],r[1]))*La,this.translate=[n.e,n.f],this.scale=[e,i],this.skew=i?Math.atan2(u,i)*La:0}function Pu(n,t){return n[0]*t[0]+n[1]*t[1]}function Uu(n){var t=Math.sqrt(Pu(n,n));return t&&(n[0]/=t,n[1]/=t),t}function ju(n,t,r){return n[0]+=r*t[0],n[1]+=r*t[1],n}function Hu(n,t){var r,e=[],u=[],i=Bo.transform(n),o=Bo.transform(t),a=i.translate,c=o.translate,s=i.rotate,l=o.rotate,f=i.skew,h=o.skew,g=i.scale,p=o.scale;return a[0]!=c[0]||a[1]!=c[1]?(e.push("translate(",null,",",null,")"),u.push({i:1,x:pu(a[0],c[0])},{i:3,x:pu(a[1],c[1])})):c[0]||c[1]?e.push("translate("+c+")"):e.push(""),s!=l?(s-l>180?l+=360:l-s>180&&(s+=360),u.push({i:e.push(e.pop()+"rotate(",null,")")-2,x:pu(s,l)})):l&&e.push(e.pop()+"rotate("+l+")"),f!=h?u.push({i:e.push(e.pop()+"skewX(",null,")")-2,x:pu(f,h)}):h&&e.push(e.pop()+"skewX("+h+")"),g[0]!=p[0]||g[1]!=p[1]?(r=e.push(e.pop()+"scale(",null,",",null,")"),u.push({i:r-4,x:pu(g[0],p[0])},{i:r-2,x:pu(g[1],p[1])})):(1!=p[0]||1!=p[1])&&e.push(e.pop()+"scale("+p+")"),r=u.length,function(n){for(var t,i=-1;++i<r;)e[(t=u[i]).i]=t.x(n);return e.join("")}}function Fu(n,t){return t=t-(n=+n)?1/(t-n):0,function(r){return(r-n)*t}}function Ou(n,t){return t=t-(n=+n)?1/(t-n):0,function(r){return Math.max(0,Math.min(1,(r-n)*t))}}function Iu(n){for(var t=n.source,r=n.target,e=Zu(t,r),u=[t];t!==e;)t=t.parent,u.push(t);for(var i=u.length;r!==e;)u.splice(i,0,r),r=r.parent;return u}function Yu(n){for(var t=[],r=n.parent;null!=r;)t.push(n),n=r,r=r.parent;return t.push(n),t}function Zu(n,t){if(n===t)return n;for(var r=Yu(n),e=Yu(t),u=r.pop(),i=e.pop(),o=null;u===i;)o=u,u=r.pop(),i=e.pop();return o}function Vu(n){n.fixed|=2}function $u(n){n.fixed&=-7}function Xu(n){n.fixed|=4,n.px=n.x,n.py=n.y}function Bu(n){n.fixed&=-5}function Ju(n,t,r){var e=0,u=0;if(n.charge=0,!n.leaf)for(var i,o=n.nodes,a=o.length,c=-1;++c<a;)i=o[c],null!=i&&(Ju(i,t,r),n.charge+=i.charge,e+=i.charge*i.cx,u+=i.charge*i.cy);if(n.point){n.leaf||(n.point.x+=Math.random()-.5,n.point.y+=Math.random()-.5);var s=t*r[n.point.index];n.charge+=n.pointCharge=s,e+=s*n.point.x,u+=s*n.point.y}n.cx=e/n.charge,n.cy=u/n.charge}function Wu(n,t){return Bo.rebind(n,t,"sort","children","value"),n.nodes=n,n.links=ri,n}function Gu(n,t){for(var r=[n];null!=(n=r.pop());)if(t(n),(u=n.children)&&(e=u.length))for(var e,u;--e>=0;)r.push(u[e])}function Ku(n,t){for(var r=[n],e=[];null!=(n=r.pop());)if(e.push(n),(i=n.children)&&(u=i.length))for(var u,i,o=-1;++o<u;)r.push(i[o]);for(;null!=(n=e.pop());)t(n)}function Qu(n){return n.children}function ni(n){return n.value}function ti(n,t){return t.value-n.value}function ri(n){return Bo.merge(n.map(function(n){return(n.children||[]).map(function(t){return{source:n,target:t}})}))}function ei(n){return n.x}function ui(n){return n.y}function ii(n,t,r){n.y0=t,n.y=r}function oi(n){return Bo.range(n.length)}function ai(n){for(var t=-1,r=n[0].length,e=[];++t<r;)e[t]=0;return e}function ci(n){for(var t,r=1,e=0,u=n[0][1],i=n.length;i>r;++r)(t=n[r][1])>u&&(e=r,u=t);return e}function si(n){return n.reduce(li,0)}function li(n,t){return n+t[1]}function fi(n,t){return hi(n,Math.ceil(Math.log(t.length)/Math.LN2+1))}function hi(n,t){for(var r=-1,e=+n[0],u=(n[1]-e)/t,i=[];++r<=t;)i[r]=u*r+e;return i}function gi(n){return[Bo.min(n),Bo.max(n)]}function pi(n,t){return n.value-t.value}function vi(n,t){var r=n._pack_next;n._pack_next=t,t._pack_prev=n,t._pack_next=r,r._pack_prev=t}function di(n,t){n._pack_next=t,t._pack_prev=n}function mi(n,t){var r=t.x-n.x,e=t.y-n.y,u=n.r+t.r;return.999*u*u>r*r+e*e}function yi(n){function t(n){l=Math.min(n.x-n.r,l),f=Math.max(n.x+n.r,f),h=Math.min(n.y-n.r,h),g=Math.max(n.y+n.r,g)}if((r=n.children)&&(s=r.length)){var r,e,u,i,o,a,c,s,l=1/0,f=-1/0,h=1/0,g=-1/0;if(r.forEach(xi),e=r[0],e.x=-e.r,e.y=0,t(e),s>1&&(u=r[1],u.x=u.r,u.y=0,t(u),s>2))for(i=r[2],bi(e,u,i),t(i),vi(e,i),e._pack_prev=i,vi(i,u),u=e._pack_next,o=3;s>o;o++){bi(e,u,i=r[o]);var p=0,v=1,d=1;for(a=u._pack_next;a!==u;a=a._pack_next,v++)if(mi(a,i)){p=1;break}if(1==p)for(c=e._pack_prev;c!==a._pack_prev&&!mi(c,i);c=c._pack_prev,d++);p?(d>v||v==d&&u.r<e.r?di(e,u=a):di(e=c,u),o--):(vi(e,i),u=i,t(i))}var m=(l+f)/2,y=(h+g)/2,x=0;for(o=0;s>o;o++)i=r[o],i.x-=m,i.y-=y,x=Math.max(x,i.r+Math.sqrt(i.x*i.x+i.y*i.y));n.r=x,r.forEach(Mi)}}function xi(n){n._pack_next=n._pack_prev=n}function Mi(n){delete n._pack_next,delete n._pack_prev}function _i(n,t,r,e){var u=n.children;if(n.x=t+=e*n.x,n.y=r+=e*n.y,n.r*=e,u)for(var i=-1,o=u.length;++i<o;)_i(u[i],t,r,e)}function bi(n,t,r){var e=n.r+r.r,u=t.x-n.x,i=t.y-n.y;if(e&&(u||i)){var o=t.r+r.r,a=u*u+i*i;o*=o,e*=e;var c=.5+(e-o)/(2*a),s=Math.sqrt(Math.max(0,2*o*(e+a)-(e-=a)*e-o*o))/(2*a);r.x=n.x+c*u+s*i,r.y=n.y+c*i-s*u}else r.x=n.x+e,r.y=n.y}function wi(n,t){return n.parent==t.parent?1:2}function Si(n){var t=n.children;return t.length?t[0]:n.t}function ki(n){var t,r=n.children;return(t=r.length)?r[t-1]:n.t}function Ei(n,t,r){var e=r/(t.i-n.i);t.c-=e,t.s+=r,n.c+=e,t.z+=r,t.m+=r}function Ai(n){for(var t,r=0,e=0,u=n.children,i=u.length;--i>=0;)t=u[i],t.z+=r,t.m+=r,r+=t.s+(e+=t.c)}function Ci(n,t,r){return n.a.parent===t.parent?n.a:r}function Ni(n){return 1+Bo.max(n,function(n){return n.y})}function zi(n){return n.reduce(function(n,t){return n+t.x},0)/n.length}function Li(n){var t=n.children;return t&&t.length?Li(t[0]):n}function Ti(n){var t,r=n.children;return r&&(t=r.length)?Ti(r[t-1]):n}function qi(n){return{x:n.x,y:n.y,dx:n.dx,dy:n.dy}}function Ri(n,t){var r=n.x+t[3],e=n.y+t[0],u=n.dx-t[1]-t[3],i=n.dy-t[0]-t[2];return 0>u&&(r+=u/2,u=0),0>i&&(e+=i/2,i=0),{x:r,y:e,dx:u,dy:i}}function Di(n){var t=n[0],r=n[n.length-1];return r>t?[t,r]:[r,t]}function Pi(n){return n.rangeExtent?n.rangeExtent():Di(n.range())}function Ui(n,t,r,e){var u=r(n[0],n[1]),i=e(t[0],t[1]);return function(n){return i(u(n))}}function ji(n,t){var r,e=0,u=n.length-1,i=n[e],o=n[u];return i>o&&(r=e,e=u,u=r,r=i,i=o,o=r),n[e]=t.floor(i),n[u]=t.ceil(o),n}function Hi(n){return n?{floor:function(t){return Math.floor(t/n)*n},ceil:function(t){return Math.ceil(t/n)*n}}:hs}function Fi(n,t,r,e){var u=[],i=[],o=0,a=Math.min(n.length,t.length)-1;for(n[a]<n[0]&&(n=n.slice().reverse(),t=t.slice().reverse());++o<=a;)u.push(r(n[o-1],n[o])),i.push(e(t[o-1],t[o]));return function(t){var r=Bo.bisect(n,t,1,a)-1;return i[r](u[r](t))}}function Oi(n,t,r,e){function u(){var u=Math.min(n.length,t.length)>2?Fi:Ui,c=e?Ou:Fu;return o=u(n,t,c,r),a=u(t,n,c,du),i}function i(n){return o(n)}var o,a;return i.invert=function(n){return a(n)},i.domain=function(t){return arguments.length?(n=t.map(Number),u()):n},i.range=function(n){return arguments.length?(t=n,u()):t},i.rangeRound=function(n){return i.range(n).interpolate(Ru)},i.clamp=function(n){return arguments.length?(e=n,u()):e},i.interpolate=function(n){return arguments.length?(r=n,u()):r},i.ticks=function(t){return Vi(n,t)},i.tickFormat=function(t,r){return $i(n,t,r)},i.nice=function(t){return Yi(n,t),u()},i.copy=function(){return Oi(n,t,r,e)},u()}function Ii(n,t){return Bo.rebind(n,t,"range","rangeRound","interpolate","clamp")}function Yi(n,t){return ji(n,Hi(Zi(n,t)[2]))}function Zi(n,t){null==t&&(t=10);var r=Di(n),e=r[1]-r[0],u=Math.pow(10,Math.floor(Math.log(e/t)/Math.LN10)),i=t/e*u;return.15>=i?u*=10:.35>=i?u*=5:.75>=i&&(u*=2),r[0]=Math.ceil(r[0]/u)*u,r[1]=Math.floor(r[1]/u)*u+.5*u,r[2]=u,r}function Vi(n,t){return Bo.range.apply(Bo,Zi(n,t))}function $i(n,t,r){var e=Zi(n,t);if(r){var u=nc.exec(r);if(u.shift(),"s"===u[8]){var i=Bo.formatPrefix(Math.max(ca(e[0]),ca(e[1])));return u[7]||(u[7]="."+Xi(i.scale(e[2]))),u[8]="f",r=Bo.format(u.join("")),function(n){return r(i.scale(n))+i.symbol}}u[7]||(u[7]="."+Bi(u[8],e)),r=u.join("")}else r=",."+Xi(e[2])+"f";return Bo.format(r)}function Xi(n){return-Math.floor(Math.log(n)/Math.LN10+.01)}function Bi(n,t){var r=Xi(t[2]);return n in gs?Math.abs(r-Xi(Math.max(ca(t[0]),ca(t[1]))))+ +("e"!==n):r-2*("%"===n)}function Ji(n,t,r,e){function u(n){return(r?Math.log(0>n?0:n):-Math.log(n>0?0:-n))/Math.log(t)}function i(n){return r?Math.pow(t,n):-Math.pow(t,-n)}function o(t){return n(u(t))}return o.invert=function(t){return i(n.invert(t))},o.domain=function(t){return arguments.length?(r=t[0]>=0,n.domain((e=t.map(Number)).map(u)),o):e},o.base=function(r){return arguments.length?(t=+r,n.domain(e.map(u)),o):t},o.nice=function(){var t=ji(e.map(u),r?Math:vs);return n.domain(t),e=t.map(i),o},o.ticks=function(){var n=Di(e),o=[],a=n[0],c=n[1],s=Math.floor(u(a)),l=Math.ceil(u(c)),f=t%1?2:t;if(isFinite(l-s)){if(r){for(;l>s;s++)for(var h=1;f>h;h++)o.push(i(s)*h);o.push(i(s))}else for(o.push(i(s));s++<l;)for(var h=f-1;h>0;h--)o.push(i(s)*h);for(s=0;o[s]<a;s++);for(l=o.length;o[l-1]>c;l--);o=o.slice(s,l)}return o},o.tickFormat=function(n,t){if(!arguments.length)return ps;arguments.length<2?t=ps:"function"!=typeof t&&(t=Bo.format(t));var e,a=Math.max(.1,n/o.ticks().length),c=r?(e=1e-12,Math.ceil):(e=-1e-12,Math.floor);return function(n){return n/i(c(u(n)+e))<=a?t(n):""}},o.copy=function(){return Ji(n.copy(),t,r,e)},Ii(o,n)}function Wi(n,t,r){function e(t){return n(u(t))}var u=Gi(t),i=Gi(1/t);return e.invert=function(t){return i(n.invert(t))},e.domain=function(t){return arguments.length?(n.domain((r=t.map(Number)).map(u)),e):r},e.ticks=function(n){return Vi(r,n)},e.tickFormat=function(n,t){return $i(r,n,t)},e.nice=function(n){return e.domain(Yi(r,n))},e.exponent=function(o){return arguments.length?(u=Gi(t=o),i=Gi(1/t),n.domain(r.map(u)),e):t},e.copy=function(){return Wi(n.copy(),t,r)},Ii(e,n)}function Gi(n){return function(t){return 0>t?-Math.pow(-t,n):Math.pow(t,n)}}function Ki(n,t){function r(r){return i[((u.get(r)||("range"===t.t?u.set(r,n.push(r)):0/0))-1)%i.length]}function e(t,r){return Bo.range(n.length).map(function(n){return t+r*n})}var u,i,a;return r.domain=function(e){if(!arguments.length)return n;n=[],u=new o;for(var i,a=-1,c=e.length;++a<c;)u.has(i=e[a])||u.set(i,n.push(i));return r[t.t].apply(r,t.a)},r.range=function(n){return arguments.length?(i=n,a=0,t={t:"range",a:arguments},r):i},r.rangePoints=function(u,o){arguments.length<2&&(o=0);var c=u[0],s=u[1],l=(s-c)/(Math.max(1,n.length-1)+o);return i=e(n.length<2?(c+s)/2:c+l*o/2,l),a=0,t={t:"rangePoints",a:arguments},r},r.rangeBands=function(u,o,c){arguments.length<2&&(o=0),arguments.length<3&&(c=o);var s=u[1]<u[0],l=u[s-0],f=u[1-s],h=(f-l)/(n.length-o+2*c);return i=e(l+h*c,h),s&&i.reverse(),a=h*(1-o),t={t:"rangeBands",a:arguments},r},r.rangeRoundBands=function(u,o,c){arguments.length<2&&(o=0),arguments.length<3&&(c=o);var s=u[1]<u[0],l=u[s-0],f=u[1-s],h=Math.floor((f-l)/(n.length-o+2*c)),g=f-l-(n.length-o)*h;return i=e(l+Math.round(g/2),h),s&&i.reverse(),a=Math.round(h*(1-o)),t={t:"rangeRoundBands",a:arguments},r},r.rangeBand=function(){return a},r.rangeExtent=function(){return Di(t.a[0])},r.copy=function(){return Ki(n,t)},r.domain(n)}function Qi(r,e){function u(){var n=0,t=e.length;for(o=[];++n<t;)o[n-1]=Bo.quantile(r,n/t);return i}function i(n){return isNaN(n=+n)?void 0:e[Bo.bisect(o,n)]}var o;return i.domain=function(e){return arguments.length?(r=e.filter(t).sort(n),u()):r},i.range=function(n){return arguments.length?(e=n,u()):e},i.quantiles=function(){return o},i.invertExtent=function(n){return n=e.indexOf(n),0>n?[0/0,0/0]:[n>0?o[n-1]:r[0],n<o.length?o[n]:r[r.length-1]]},i.copy=function(){return Qi(r,e)},u()}function no(n,t,r){function e(t){return r[Math.max(0,Math.min(o,Math.floor(i*(t-n))))]}function u(){return i=r.length/(t-n),o=r.length-1,e}var i,o;return e.domain=function(r){return arguments.length?(n=+r[0],t=+r[r.length-1],u()):[n,t]},e.range=function(n){return arguments.length?(r=n,u()):r},e.invertExtent=function(t){return t=r.indexOf(t),t=0>t?0/0:t/i+n,[t,t+1/i]},e.copy=function(){return no(n,t,r)},u()}function to(n,t){function r(r){return r>=r?t[Bo.bisect(n,r)]:void 0}return r.domain=function(t){return arguments.length?(n=t,r):n},r.range=function(n){return arguments.length?(t=n,r):t},r.invertExtent=function(r){return r=t.indexOf(r),[n[r-1],n[r]]},r.copy=function(){return to(n,t)},r}function ro(n){function t(n){return+n}return t.invert=t,t.domain=t.range=function(r){return arguments.length?(n=r.map(t),t):n},t.ticks=function(t){return Vi(n,t)},t.tickFormat=function(t,r){return $i(n,t,r)},t.copy=function(){return ro(n)},t}function eo(n){return n.innerRadius}function uo(n){return n.outerRadius}function io(n){return n.startAngle}function oo(n){return n.endAngle}function ao(n){function t(t){function o(){s.push("M",i(n(l),a))}for(var c,s=[],l=[],f=-1,h=t.length,g=Et(r),p=Et(e);++f<h;)u.call(this,c=t[f],f)?l.push([+g.call(this,c,f),+p.call(this,c,f)]):l.length&&(o(),l=[]);return l.length&&o(),s.length?s.join(""):null}var r=Ae,e=Ce,u=Ar,i=co,o=i.key,a=.7;return t.x=function(n){return arguments.length?(r=n,t):r},t.y=function(n){return arguments.length?(e=n,t):e},t.defined=function(n){return arguments.length?(u=n,t):u},t.interpolate=function(n){return arguments.length?(o="function"==typeof n?i=n:(i=bs.get(n)||co).key,t):o},t.tension=function(n){return arguments.length?(a=n,t):a},t}function co(n){return n.join("L")}function so(n){return co(n)+"Z"}function lo(n){for(var t=0,r=n.length,e=n[0],u=[e[0],",",e[1]];++t<r;)u.push("H",(e[0]+(e=n[t])[0])/2,"V",e[1]);return r>1&&u.push("H",e[0]),u.join("")}function fo(n){for(var t=0,r=n.length,e=n[0],u=[e[0],",",e[1]];++t<r;)u.push("V",(e=n[t])[1],"H",e[0]);return u.join("")}function ho(n){for(var t=0,r=n.length,e=n[0],u=[e[0],",",e[1]];++t<r;)u.push("H",(e=n[t])[0],"V",e[1]);return u.join("")}function go(n,t){return n.length<4?co(n):n[1]+mo(n.slice(1,n.length-1),yo(n,t))}function po(n,t){return n.length<3?co(n):n[0]+mo((n.push(n[0]),n),yo([n[n.length-2]].concat(n,[n[1]]),t))}function vo(n,t){return n.length<3?co(n):n[0]+mo(n,yo(n,t))}function mo(n,t){if(t.length<1||n.length!=t.length&&n.length!=t.length+2)return co(n);var r=n.length!=t.length,e="",u=n[0],i=n[1],o=t[0],a=o,c=1;if(r&&(e+="Q"+(i[0]-2*o[0]/3)+","+(i[1]-2*o[1]/3)+","+i[0]+","+i[1],u=n[1],c=2),t.length>1){a=t[1],i=n[c],c++,e+="C"+(u[0]+o[0])+","+(u[1]+o[1])+","+(i[0]-a[0])+","+(i[1]-a[1])+","+i[0]+","+i[1];for(var s=2;s<t.length;s++,c++)i=n[c],a=t[s],e+="S"+(i[0]-a[0])+","+(i[1]-a[1])+","+i[0]+","+i[1]}if(r){var l=n[c];e+="Q"+(i[0]+2*a[0]/3)+","+(i[1]+2*a[1]/3)+","+l[0]+","+l[1]}return e}function yo(n,t){for(var r,e=[],u=(1-t)/2,i=n[0],o=n[1],a=1,c=n.length;++a<c;)r=i,i=o,o=n[a],e.push([u*(o[0]-r[0]),u*(o[1]-r[1])]);return e}function xo(n){if(n.length<3)return co(n);var t=1,r=n.length,e=n[0],u=e[0],i=e[1],o=[u,u,u,(e=n[1])[0]],a=[i,i,i,e[1]],c=[u,",",i,"L",wo(ks,o),",",wo(ks,a)];for(n.push(n[r-1]);++t<=r;)e=n[t],o.shift(),o.push(e[0]),a.shift(),a.push(e[1]),So(c,o,a);return n.pop(),c.push("L",e),c.join("")}function Mo(n){if(n.length<4)return co(n);for(var t,r=[],e=-1,u=n.length,i=[0],o=[0];++e<3;)t=n[e],i.push(t[0]),o.push(t[1]);for(r.push(wo(ks,i)+","+wo(ks,o)),--e;++e<u;)t=n[e],i.shift(),i.push(t[0]),o.shift(),o.push(t[1]),So(r,i,o);return r.join("")}function _o(n){for(var t,r,e=-1,u=n.length,i=u+4,o=[],a=[];++e<4;)r=n[e%u],o.push(r[0]),a.push(r[1]);for(t=[wo(ks,o),",",wo(ks,a)],--e;++e<i;)r=n[e%u],o.shift(),o.push(r[0]),a.shift(),a.push(r[1]),So(t,o,a);return t.join("")}function bo(n,t){var r=n.length-1;if(r)for(var e,u,i=n[0][0],o=n[0][1],a=n[r][0]-i,c=n[r][1]-o,s=-1;++s<=r;)e=n[s],u=s/r,e[0]=t*e[0]+(1-t)*(i+u*a),e[1]=t*e[1]+(1-t)*(o+u*c);return xo(n)}function wo(n,t){return n[0]*t[0]+n[1]*t[1]+n[2]*t[2]+n[3]*t[3]}function So(n,t,r){n.push("C",wo(ws,t),",",wo(ws,r),",",wo(Ss,t),",",wo(Ss,r),",",wo(ks,t),",",wo(ks,r))}function ko(n,t){return(t[1]-n[1])/(t[0]-n[0])}function Eo(n){for(var t=0,r=n.length-1,e=[],u=n[0],i=n[1],o=e[0]=ko(u,i);++t<r;)e[t]=(o+(o=ko(u=i,i=n[t+1])))/2;return e[t]=o,e}function Ao(n){for(var t,r,e,u,i=[],o=Eo(n),a=-1,c=n.length-1;++a<c;)t=ko(n[a],n[a+1]),ca(t)<Ca?o[a]=o[a+1]=0:(r=o[a]/t,e=o[a+1]/t,u=r*r+e*e,u>9&&(u=3*t/Math.sqrt(u),o[a]=u*r,o[a+1]=u*e));for(a=-1;++a<=c;)u=(n[Math.min(c,a+1)][0]-n[Math.max(0,a-1)][0])/(6*(1+o[a]*o[a])),i.push([u||0,o[a]*u||0]);return i}function Co(n){return n.length<3?co(n):n[0]+mo(n,Ao(n))}function No(n){for(var t,r,e,u=-1,i=n.length;++u<i;)t=n[u],r=t[0],e=t[1]+Ms,t[0]=r*Math.cos(e),t[1]=r*Math.sin(e);return n}function zo(n){function t(t){function c(){v.push("M",a(n(m),f),l,s(n(d.reverse()),f),"Z")}for(var h,g,p,v=[],d=[],m=[],y=-1,x=t.length,M=Et(r),_=Et(u),b=r===e?function(){return g}:Et(e),w=u===i?function(){return p}:Et(i);++y<x;)o.call(this,h=t[y],y)?(d.push([g=+M.call(this,h,y),p=+_.call(this,h,y)]),m.push([+b.call(this,h,y),+w.call(this,h,y)])):d.length&&(c(),d=[],m=[]);return d.length&&c(),v.length?v.join(""):null}var r=Ae,e=Ae,u=0,i=Ce,o=Ar,a=co,c=a.key,s=a,l="L",f=.7;return t.x=function(n){return arguments.length?(r=e=n,t):e},t.x0=function(n){return arguments.length?(r=n,t):r},t.x1=function(n){return arguments.length?(e=n,t):e},t.y=function(n){return arguments.length?(u=i=n,t):i},t.y0=function(n){return arguments.length?(u=n,t):u},t.y1=function(n){return arguments.length?(i=n,t):i},t.defined=function(n){return arguments.length?(o=n,t):o},t.interpolate=function(n){return arguments.length?(c="function"==typeof n?a=n:(a=bs.get(n)||co).key,s=a.reverse||a,l=a.closed?"M":"L",t):c},t.tension=function(n){return arguments.length?(f=n,t):f},t}function Lo(n){return n.radius}function To(n){return[n.x,n.y]}function qo(n){return function(){var t=n.apply(this,arguments),r=t[0],e=t[1]+Ms;return[r*Math.cos(e),r*Math.sin(e)]}}function Ro(){return 64}function Do(){return"circle"}function Po(n){var t=Math.sqrt(n/ka);return"M0,"+t+"A"+t+","+t+" 0 1,1 0,"+-t+"A"+t+","+t+" 0 1,1 0,"+t+"Z"}function Uo(n,t){return ga(n,Ls),n.id=t,n}function jo(n,t,r,e){var u=n.id;return P(n,"function"==typeof r?function(n,i,o){n.__transition__[u].tween.set(t,e(r.call(n,n.__data__,i,o)))}:(r=e(r),function(n){n.__transition__[u].tween.set(t,r)}))}function Ho(n){return null==n&&(n=""),function(){this.textContent=n}}function Fo(n,t,r,e){var u=n.__transition__||(n.__transition__={active:0,count:0}),i=u[r];if(!i){var a=e.time;i=u[r]={tween:new o,time:a,ease:e.ease,delay:e.delay,duration:e.duration},++u.count,Bo.timer(function(e){function o(e){return u.active>r?s():(u.active=r,i.event&&i.event.start.call(n,l,t),i.tween.forEach(function(r,e){(e=e.call(n,l,t))&&v.push(e)}),Bo.timer(function(){return p.c=c(e||1)?Ar:c,1},0,a),void 0)}function c(e){if(u.active!==r)return s();for(var o=e/g,a=f(o),c=v.length;c>0;)v[--c].call(n,a);return o>=1?(i.event&&i.event.end.call(n,l,t),s()):void 0}function s(){return--u.count?delete u[r]:delete n.__transition__,1}var l=n.__data__,f=i.ease,h=i.delay,g=i.duration,p=Ga,v=[];return p.t=h+a,e>=h?o(e-h):(p.c=o,void 0)},0,a)}}function Oo(n,t){n.attr("transform",function(n){return"translate("+t(n)+",0)"})}function Io(n,t){n.attr("transform",function(n){return"translate(0,"+t(n)+")"})}function Yo(n){return n.toISOString()}function Zo(n,t,r){function e(t){return n(t)}function u(n,r){var e=n[1]-n[0],u=e/r,i=Bo.bisect(Fs,u);return i==Fs.length?[t.year,Zi(n.map(function(n){return n/31536e6}),r)[2]]:i?t[u/Fs[i-1]<Fs[i]/u?i-1:i]:[Ys,Zi(n,r)[2]]}return e.invert=function(t){return Vo(n.invert(t))
},e.domain=function(t){return arguments.length?(n.domain(t),e):n.domain().map(Vo)},e.nice=function(n,t){function r(r){return!isNaN(r)&&!n.range(r,Vo(+r+1),t).length}var i=e.domain(),o=Di(i),a=null==n?u(o,10):"number"==typeof n&&u(o,n);return a&&(n=a[0],t=a[1]),e.domain(ji(i,t>1?{floor:function(t){for(;r(t=n.floor(t));)t=Vo(t-1);return t},ceil:function(t){for(;r(t=n.ceil(t));)t=Vo(+t+1);return t}}:n))},e.ticks=function(n,t){var r=Di(e.domain()),i=null==n?u(r,10):"number"==typeof n?u(r,n):!n.range&&[{range:n},t];return i&&(n=i[0],t=i[1]),n.range(r[0],Vo(+r[1]+1),1>t?1:t)},e.tickFormat=function(){return r},e.copy=function(){return Zo(n.copy(),t,r)},Ii(e,n)}function Vo(n){return new Date(n)}function $o(n){return JSON.parse(n.responseText)}function Xo(n){var t=Go.createRange();return t.selectNode(Go.body),t.createContextualFragment(n.responseText)}var Bo={version:"3.4.8"};Date.now||(Date.now=function(){return+new Date});var Jo=[].slice,Wo=function(n){return Jo.call(n)},Go=document,Ko=Go.documentElement,Qo=window;try{Wo(Ko.childNodes)[0].nodeType}catch(na){Wo=function(n){for(var t=n.length,r=new Array(t);t--;)r[t]=n[t];return r}}try{Go.createElement("div").style.setProperty("opacity",0,"")}catch(ta){var ra=Qo.Element.prototype,ea=ra.setAttribute,ua=ra.setAttributeNS,ia=Qo.CSSStyleDeclaration.prototype,oa=ia.setProperty;ra.setAttribute=function(n,t){ea.call(this,n,t+"")},ra.setAttributeNS=function(n,t,r){ua.call(this,n,t,r+"")},ia.setProperty=function(n,t,r){oa.call(this,n,t+"",r)}}Bo.ascending=n,Bo.descending=function(n,t){return n>t?-1:t>n?1:t>=n?0:0/0},Bo.min=function(n,t){var r,e,u=-1,i=n.length;if(1===arguments.length){for(;++u<i&&!(null!=(r=n[u])&&r>=r);)r=void 0;for(;++u<i;)null!=(e=n[u])&&r>e&&(r=e)}else{for(;++u<i&&!(null!=(r=t.call(n,n[u],u))&&r>=r);)r=void 0;for(;++u<i;)null!=(e=t.call(n,n[u],u))&&r>e&&(r=e)}return r},Bo.max=function(n,t){var r,e,u=-1,i=n.length;if(1===arguments.length){for(;++u<i&&!(null!=(r=n[u])&&r>=r);)r=void 0;for(;++u<i;)null!=(e=n[u])&&e>r&&(r=e)}else{for(;++u<i&&!(null!=(r=t.call(n,n[u],u))&&r>=r);)r=void 0;for(;++u<i;)null!=(e=t.call(n,n[u],u))&&e>r&&(r=e)}return r},Bo.extent=function(n,t){var r,e,u,i=-1,o=n.length;if(1===arguments.length){for(;++i<o&&!(null!=(r=u=n[i])&&r>=r);)r=u=void 0;for(;++i<o;)null!=(e=n[i])&&(r>e&&(r=e),e>u&&(u=e))}else{for(;++i<o&&!(null!=(r=u=t.call(n,n[i],i))&&r>=r);)r=void 0;for(;++i<o;)null!=(e=t.call(n,n[i],i))&&(r>e&&(r=e),e>u&&(u=e))}return[r,u]},Bo.sum=function(n,t){var r,e=0,u=n.length,i=-1;if(1===arguments.length)for(;++i<u;)isNaN(r=+n[i])||(e+=r);else for(;++i<u;)isNaN(r=+t.call(n,n[i],i))||(e+=r);return e},Bo.mean=function(n,r){var e,u=0,i=n.length,o=-1,a=i;if(1===arguments.length)for(;++o<i;)t(e=n[o])?u+=e:--a;else for(;++o<i;)t(e=r.call(n,n[o],o))?u+=e:--a;return a?u/a:void 0},Bo.quantile=function(n,t){var r=(n.length-1)*t+1,e=Math.floor(r),u=+n[e-1],i=r-e;return i?u+i*(n[e]-u):u},Bo.median=function(r,e){return arguments.length>1&&(r=r.map(e)),r=r.filter(t),r.length?Bo.quantile(r.sort(n),.5):void 0};var aa=r(n);Bo.bisectLeft=aa.left,Bo.bisect=Bo.bisectRight=aa.right,Bo.bisector=function(t){return r(1===t.length?function(r,e){return n(t(r),e)}:t)},Bo.shuffle=function(n){for(var t,r,e=n.length;e;)r=0|Math.random()*e--,t=n[e],n[e]=n[r],n[r]=t;return n},Bo.permute=function(n,t){for(var r=t.length,e=new Array(r);r--;)e[r]=n[t[r]];return e},Bo.pairs=function(n){for(var t,r=0,e=n.length-1,u=n[0],i=new Array(0>e?0:e);e>r;)i[r]=[t=u,u=n[++r]];return i},Bo.zip=function(){if(!(u=arguments.length))return[];for(var n=-1,t=Bo.min(arguments,e),r=new Array(t);++n<t;)for(var u,i=-1,o=r[n]=new Array(u);++i<u;)o[i]=arguments[i][n];return r},Bo.transpose=function(n){return Bo.zip.apply(Bo,n)},Bo.keys=function(n){var t=[];for(var r in n)t.push(r);return t},Bo.values=function(n){var t=[];for(var r in n)t.push(n[r]);return t},Bo.entries=function(n){var t=[];for(var r in n)t.push({key:r,value:n[r]});return t},Bo.merge=function(n){for(var t,r,e,u=n.length,i=-1,o=0;++i<u;)o+=n[i].length;for(r=new Array(o);--u>=0;)for(e=n[u],t=e.length;--t>=0;)r[--o]=e[t];return r};var ca=Math.abs;Bo.range=function(n,t,r){if(arguments.length<3&&(r=1,arguments.length<2&&(t=n,n=0)),1/0===(t-n)/r)throw new Error("infinite range");var e,i=[],o=u(ca(r)),a=-1;if(n*=o,t*=o,r*=o,0>r)for(;(e=n+r*++a)>t;)i.push(e/o);else for(;(e=n+r*++a)<t;)i.push(e/o);return i},Bo.map=function(n){var t=new o;if(n instanceof o)n.forEach(function(n,r){t.set(n,r)});else for(var r in n)t.set(r,n[r]);return t},i(o,{has:a,get:function(n){return this[sa+n]},set:function(n,t){return this[sa+n]=t},remove:c,keys:s,values:function(){var n=[];return this.forEach(function(t,r){n.push(r)}),n},entries:function(){var n=[];return this.forEach(function(t,r){n.push({key:t,value:r})}),n},size:l,empty:f,forEach:function(n){for(var t in this)t.charCodeAt(0)===la&&n.call(this,t.substring(1),this[t])}});var sa="\x00",la=sa.charCodeAt(0);Bo.nest=function(){function n(t,a,c){if(c>=i.length)return e?e.call(u,a):r?a.sort(r):a;for(var s,l,f,h,g=-1,p=a.length,v=i[c++],d=new o;++g<p;)(h=d.get(s=v(l=a[g])))?h.push(l):d.set(s,[l]);return t?(l=t(),f=function(r,e){l.set(r,n(t,e,c))}):(l={},f=function(r,e){l[r]=n(t,e,c)}),d.forEach(f),l}function t(n,r){if(r>=i.length)return n;var e=[],u=a[r++];return n.forEach(function(n,u){e.push({key:n,values:t(u,r)})}),u?e.sort(function(n,t){return u(n.key,t.key)}):e}var r,e,u={},i=[],a=[];return u.map=function(t,r){return n(r,t,0)},u.entries=function(r){return t(n(Bo.map,r,0),0)},u.key=function(n){return i.push(n),u},u.sortKeys=function(n){return a[i.length-1]=n,u},u.sortValues=function(n){return r=n,u},u.rollup=function(n){return e=n,u},u},Bo.set=function(n){var t=new h;if(n)for(var r=0,e=n.length;e>r;++r)t.add(n[r]);return t},i(h,{has:a,add:function(n){return this[sa+n]=!0,n},remove:function(n){return n=sa+n,n in this&&delete this[n]},values:s,size:l,empty:f,forEach:function(n){for(var t in this)t.charCodeAt(0)===la&&n.call(this,t.substring(1))}}),Bo.behavior={},Bo.rebind=function(n,t){for(var r,e=1,u=arguments.length;++e<u;)n[r=arguments[e]]=g(n,t,t[r]);return n};var fa=["webkit","ms","moz","Moz","o","O"];Bo.dispatch=function(){for(var n=new d,t=-1,r=arguments.length;++t<r;)n[arguments[t]]=m(n);return n},d.prototype.on=function(n,t){var r=n.indexOf("."),e="";if(r>=0&&(e=n.substring(r+1),n=n.substring(0,r)),n)return arguments.length<2?this[n].on(e):this[n].on(e,t);if(2===arguments.length){if(null==t)for(n in this)this.hasOwnProperty(n)&&this[n].on(e,null);return this}},Bo.event=null,Bo.requote=function(n){return n.replace(ha,"\\$&")};var ha=/[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g,ga={}.__proto__?function(n,t){n.__proto__=t}:function(n,t){for(var r in t)n[r]=t[r]},pa=function(n,t){return t.querySelector(n)},va=function(n,t){return t.querySelectorAll(n)},da=Ko[p(Ko,"matchesSelector")],ma=function(n,t){return da.call(n,t)};"function"==typeof Sizzle&&(pa=function(n,t){return Sizzle(n,t)[0]||null},va=Sizzle,ma=Sizzle.matchesSelector),Bo.selection=function(){return _a};var ya=Bo.selection.prototype=[];ya.select=function(n){var t,r,e,u,i=[];n=b(n);for(var o=-1,a=this.length;++o<a;){i.push(t=[]),t.parentNode=(e=this[o]).parentNode;for(var c=-1,s=e.length;++c<s;)(u=e[c])?(t.push(r=n.call(u,u.__data__,c,o)),r&&"__data__"in u&&(r.__data__=u.__data__)):t.push(null)}return _(i)},ya.selectAll=function(n){var t,r,e=[];n=w(n);for(var u=-1,i=this.length;++u<i;)for(var o=this[u],a=-1,c=o.length;++a<c;)(r=o[a])&&(e.push(t=Wo(n.call(r,r.__data__,a,u))),t.parentNode=r);return _(e)};var xa={svg:"http://www.w3.org/2000/svg",xhtml:"http://www.w3.org/1999/xhtml",xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};Bo.ns={prefix:xa,qualify:function(n){var t=n.indexOf(":"),r=n;return t>=0&&(r=n.substring(0,t),n=n.substring(t+1)),xa.hasOwnProperty(r)?{space:xa[r],local:n}:n}},ya.attr=function(n,t){if(arguments.length<2){if("string"==typeof n){var r=this.node();return n=Bo.ns.qualify(n),n.local?r.getAttributeNS(n.space,n.local):r.getAttribute(n)}for(t in n)this.each(S(t,n[t]));return this}return this.each(S(n,t))},ya.classed=function(n,t){if(arguments.length<2){if("string"==typeof n){var r=this.node(),e=(n=A(n)).length,u=-1;if(t=r.classList){for(;++u<e;)if(!t.contains(n[u]))return!1}else for(t=r.getAttribute("class");++u<e;)if(!E(n[u]).test(t))return!1;return!0}for(t in n)this.each(C(t,n[t]));return this}return this.each(C(n,t))},ya.style=function(n,t,r){var e=arguments.length;if(3>e){if("string"!=typeof n){2>e&&(t="");for(r in n)this.each(z(r,n[r],t));return this}if(2>e)return Qo.getComputedStyle(this.node(),null).getPropertyValue(n);r=""}return this.each(z(n,t,r))},ya.property=function(n,t){if(arguments.length<2){if("string"==typeof n)return this.node()[n];for(t in n)this.each(L(t,n[t]));return this}return this.each(L(n,t))},ya.text=function(n){return arguments.length?this.each("function"==typeof n?function(){var t=n.apply(this,arguments);this.textContent=null==t?"":t}:null==n?function(){this.textContent=""}:function(){this.textContent=n}):this.node().textContent},ya.html=function(n){return arguments.length?this.each("function"==typeof n?function(){var t=n.apply(this,arguments);this.innerHTML=null==t?"":t}:null==n?function(){this.innerHTML=""}:function(){this.innerHTML=n}):this.node().innerHTML},ya.append=function(n){return n=T(n),this.select(function(){return this.appendChild(n.apply(this,arguments))})},ya.insert=function(n,t){return n=T(n),t=b(t),this.select(function(){return this.insertBefore(n.apply(this,arguments),t.apply(this,arguments)||null)})},ya.remove=function(){return this.each(function(){var n=this.parentNode;n&&n.removeChild(this)})},ya.data=function(n,t){function r(n,r){var e,u,i,a=n.length,f=r.length,h=Math.min(a,f),g=new Array(f),p=new Array(f),v=new Array(a);if(t){var d,m=new o,y=new o,x=[];for(e=-1;++e<a;)d=t.call(u=n[e],u.__data__,e),m.has(d)?v[e]=u:m.set(d,u),x.push(d);for(e=-1;++e<f;)d=t.call(r,i=r[e],e),(u=m.get(d))?(g[e]=u,u.__data__=i):y.has(d)||(p[e]=q(i)),y.set(d,i),m.remove(d);for(e=-1;++e<a;)m.has(x[e])&&(v[e]=n[e])}else{for(e=-1;++e<h;)u=n[e],i=r[e],u?(u.__data__=i,g[e]=u):p[e]=q(i);for(;f>e;++e)p[e]=q(r[e]);for(;a>e;++e)v[e]=n[e]}p.update=g,p.parentNode=g.parentNode=v.parentNode=n.parentNode,c.push(p),s.push(g),l.push(v)}var e,u,i=-1,a=this.length;if(!arguments.length){for(n=new Array(a=(e=this[0]).length);++i<a;)(u=e[i])&&(n[i]=u.__data__);return n}var c=U([]),s=_([]),l=_([]);if("function"==typeof n)for(;++i<a;)r(e=this[i],n.call(e,e.parentNode.__data__,i));else for(;++i<a;)r(e=this[i],n);return s.enter=function(){return c},s.exit=function(){return l},s},ya.datum=function(n){return arguments.length?this.property("__data__",n):this.property("__data__")},ya.filter=function(n){var t,r,e,u=[];"function"!=typeof n&&(n=R(n));for(var i=0,o=this.length;o>i;i++){u.push(t=[]),t.parentNode=(r=this[i]).parentNode;for(var a=0,c=r.length;c>a;a++)(e=r[a])&&n.call(e,e.__data__,a,i)&&t.push(e)}return _(u)},ya.order=function(){for(var n=-1,t=this.length;++n<t;)for(var r,e=this[n],u=e.length-1,i=e[u];--u>=0;)(r=e[u])&&(i&&i!==r.nextSibling&&i.parentNode.insertBefore(r,i),i=r);return this},ya.sort=function(n){n=D.apply(this,arguments);for(var t=-1,r=this.length;++t<r;)this[t].sort(n);return this.order()},ya.each=function(n){return P(this,function(t,r,e){n.call(t,t.__data__,r,e)})},ya.call=function(n){var t=Wo(arguments);return n.apply(t[0]=this,t),this},ya.empty=function(){return!this.node()},ya.node=function(){for(var n=0,t=this.length;t>n;n++)for(var r=this[n],e=0,u=r.length;u>e;e++){var i=r[e];if(i)return i}return null},ya.size=function(){var n=0;return this.each(function(){++n}),n};var Ma=[];Bo.selection.enter=U,Bo.selection.enter.prototype=Ma,Ma.append=ya.append,Ma.empty=ya.empty,Ma.node=ya.node,Ma.call=ya.call,Ma.size=ya.size,Ma.select=function(n){for(var t,r,e,u,i,o=[],a=-1,c=this.length;++a<c;){e=(u=this[a]).update,o.push(t=[]),t.parentNode=u.parentNode;for(var s=-1,l=u.length;++s<l;)(i=u[s])?(t.push(e[s]=r=n.call(u.parentNode,i.__data__,s,a)),r.__data__=i.__data__):t.push(null)}return _(o)},Ma.insert=function(n,t){return arguments.length<2&&(t=j(this)),ya.insert.call(this,n,t)},ya.transition=function(){for(var n,t,r=As||++Ts,e=[],u=Cs||{time:Date.now(),ease:wu,delay:0,duration:250},i=-1,o=this.length;++i<o;){e.push(n=[]);for(var a=this[i],c=-1,s=a.length;++c<s;)(t=a[c])&&Fo(t,c,r,u),n.push(t)}return Uo(e,r)},ya.interrupt=function(){return this.each(H)},Bo.select=function(n){var t=["string"==typeof n?pa(n,Go):n];return t.parentNode=Ko,_([t])},Bo.selectAll=function(n){var t=Wo("string"==typeof n?va(n,Go):n);return t.parentNode=Ko,_([t])};var _a=Bo.select(Ko);ya.on=function(n,t,r){var e=arguments.length;if(3>e){if("string"!=typeof n){2>e&&(t=!1);for(r in n)this.each(F(r,n[r],t));return this}if(2>e)return(e=this.node()["__on"+n])&&e._;r=!1}return this.each(F(n,t,r))};var ba=Bo.map({mouseenter:"mouseover",mouseleave:"mouseout"});ba.forEach(function(n){"on"+n in Go&&ba.remove(n)});var wa="onselectstart"in Go?null:p(Ko.style,"userSelect"),Sa=0;Bo.mouse=function(n){return Z(n,x())},Bo.touches=function(n,t){return arguments.length<2&&(t=x().touches),t?Wo(t).map(function(t){var r=Z(n,t);return r.identifier=t.identifier,r}):[]},Bo.behavior.drag=function(){function n(){this.on("mousedown.drag",u).on("touchstart.drag",i)}function t(n,t,u,i,o){return function(){function a(){var n,r,e=t(h,v);e&&(n=e[0]-x[0],r=e[1]-x[1],p|=n|r,x=e,g({type:"drag",x:e[0]+s[0],y:e[1]+s[1],dx:n,dy:r}))}function c(){t(h,v)&&(m.on(i+d,null).on(o+d,null),y(p&&Bo.event.target===f),g({type:"dragend"}))}var s,l=this,f=Bo.event.target,h=l.parentNode,g=r.of(l,arguments),p=0,v=n(),d=".drag"+(null==v?"":"-"+v),m=Bo.select(u()).on(i+d,a).on(o+d,c),y=Y(),x=t(h,v);e?(s=e.apply(l,arguments),s=[s.x-x[0],s.y-x[1]]):s=[0,0],g({type:"dragstart"})}}var r=M(n,"drag","dragstart","dragend"),e=null,u=t(v,Bo.mouse,X,"mousemove","mouseup"),i=t(V,Bo.touch,$,"touchmove","touchend");return n.origin=function(t){return arguments.length?(e=t,n):e},Bo.rebind(n,r,"on")};var ka=Math.PI,Ea=2*ka,Aa=ka/2,Ca=1e-6,Na=Ca*Ca,za=ka/180,La=180/ka,Ta=Math.SQRT2,qa=2,Ra=4;Bo.interpolateZoom=function(n,t){function r(n){var t=n*y;if(m){var r=Q(v),o=i/(qa*h)*(r*nt(Ta*t+v)-K(v));return[e+o*s,u+o*l,i*r/Q(Ta*t+v)]}return[e+n*s,u+n*l,i*Math.exp(Ta*t)]}var e=n[0],u=n[1],i=n[2],o=t[0],a=t[1],c=t[2],s=o-e,l=a-u,f=s*s+l*l,h=Math.sqrt(f),g=(c*c-i*i+Ra*f)/(2*i*qa*h),p=(c*c-i*i-Ra*f)/(2*c*qa*h),v=Math.log(Math.sqrt(g*g+1)-g),d=Math.log(Math.sqrt(p*p+1)-p),m=d-v,y=(m||Math.log(c/i))/Ta;return r.duration=1e3*y,r},Bo.behavior.zoom=function(){function n(n){n.on(A,s).on(Ua+".zoom",f).on(C,h).on("dblclick.zoom",g).on(z,l)}function t(n){return[(n[0]-S.x)/S.k,(n[1]-S.y)/S.k]}function r(n){return[n[0]*S.k+S.x,n[1]*S.k+S.y]}function e(n){S.k=Math.max(E[0],Math.min(E[1],n))}function u(n,t){t=r(t),S.x+=n[0]-t[0],S.y+=n[1]-t[1]}function i(){_&&_.domain(x.range().map(function(n){return(n-S.x)/S.k}).map(x.invert)),w&&w.domain(b.range().map(function(n){return(n-S.y)/S.k}).map(b.invert))}function o(n){n({type:"zoomstart"})}function a(n){i(),n({type:"zoom",scale:S.k,translate:[S.x,S.y]})}function c(n){n({type:"zoomend"})}function s(){function n(){l=1,u(Bo.mouse(e),g),a(s)}function r(){f.on(C,Qo===e?h:null).on(N,null),p(l&&Bo.event.target===i),c(s)}var e=this,i=Bo.event.target,s=L.of(e,arguments),l=0,f=Bo.select(Qo).on(C,n).on(N,r),g=t(Bo.mouse(e)),p=Y();H.call(e),o(s)}function l(){function n(){var n=Bo.touches(g);return h=S.k,n.forEach(function(n){n.identifier in v&&(v[n.identifier]=t(n))}),n}function r(){var t=Bo.event.target;Bo.select(t).on(M,i).on(_,f),b.push(t);for(var r=Bo.event.changedTouches,o=0,c=r.length;c>o;++o)v[r[o].identifier]=null;var s=n(),l=Date.now();if(1===s.length){if(500>l-m){var h=s[0],g=v[h.identifier];e(2*S.k),u(h,g),y(),a(p)}m=l}else if(s.length>1){var h=s[0],x=s[1],w=h[0]-x[0],k=h[1]-x[1];d=w*w+k*k}}function i(){for(var n,t,r,i,o=Bo.touches(g),c=0,s=o.length;s>c;++c,i=null)if(r=o[c],i=v[r.identifier]){if(t)break;n=r,t=i}if(i){var l=(l=r[0]-n[0])*l+(l=r[1]-n[1])*l,f=d&&Math.sqrt(l/d);n=[(n[0]+r[0])/2,(n[1]+r[1])/2],t=[(t[0]+i[0])/2,(t[1]+i[1])/2],e(f*h)}m=null,u(n,t),a(p)}function f(){if(Bo.event.touches.length){for(var t=Bo.event.changedTouches,r=0,e=t.length;e>r;++r)delete v[t[r].identifier];for(var u in v)return void n()}Bo.selectAll(b).on(x,null),w.on(A,s).on(z,l),k(),c(p)}var h,g=this,p=L.of(g,arguments),v={},d=0,x=".zoom-"+Bo.event.changedTouches[0].identifier,M="touchmove"+x,_="touchend"+x,b=[],w=Bo.select(g).on(A,null).on(z,r),k=Y();H.call(g),r(),o(p)}function f(){var n=L.of(this,arguments);d?clearTimeout(d):(H.call(this),o(n)),d=setTimeout(function(){d=null,c(n)},50),y();var r=v||Bo.mouse(this);p||(p=t(r)),e(Math.pow(2,.002*Da())*S.k),u(r,p),a(n)}function h(){p=null}function g(){var n=L.of(this,arguments),r=Bo.mouse(this),i=t(r),s=Math.log(S.k)/Math.LN2;o(n),e(Math.pow(2,Bo.event.shiftKey?Math.ceil(s)-1:Math.floor(s)+1)),u(r,i),a(n),c(n)}var p,v,d,m,x,_,b,w,S={x:0,y:0,k:1},k=[960,500],E=Pa,A="mousedown.zoom",C="mousemove.zoom",N="mouseup.zoom",z="touchstart.zoom",L=M(n,"zoomstart","zoom","zoomend");return n.event=function(n){n.each(function(){var n=L.of(this,arguments),t=S;As?Bo.select(this).transition().each("start.zoom",function(){S=this.__chart__||{x:0,y:0,k:1},o(n)}).tween("zoom:zoom",function(){var r=k[0],e=k[1],u=r/2,i=e/2,o=Bo.interpolateZoom([(u-S.x)/S.k,(i-S.y)/S.k,r/S.k],[(u-t.x)/t.k,(i-t.y)/t.k,r/t.k]);return function(t){var e=o(t),c=r/e[2];this.__chart__=S={x:u-e[0]*c,y:i-e[1]*c,k:c},a(n)}}).each("end.zoom",function(){c(n)}):(this.__chart__=S,o(n),a(n),c(n))})},n.translate=function(t){return arguments.length?(S={x:+t[0],y:+t[1],k:S.k},i(),n):[S.x,S.y]},n.scale=function(t){return arguments.length?(S={x:S.x,y:S.y,k:+t},i(),n):S.k},n.scaleExtent=function(t){return arguments.length?(E=null==t?Pa:[+t[0],+t[1]],n):E},n.center=function(t){return arguments.length?(v=t&&[+t[0],+t[1]],n):v},n.size=function(t){return arguments.length?(k=t&&[+t[0],+t[1]],n):k},n.x=function(t){return arguments.length?(_=t,x=t.copy(),S={x:0,y:0,k:1},n):_},n.y=function(t){return arguments.length?(w=t,b=t.copy(),S={x:0,y:0,k:1},n):w},Bo.rebind(n,L,"on")};var Da,Pa=[0,1/0],Ua="onwheel"in Go?(Da=function(){return-Bo.event.deltaY*(Bo.event.deltaMode?120:1)},"wheel"):"onmousewheel"in Go?(Da=function(){return Bo.event.wheelDelta},"mousewheel"):(Da=function(){return-Bo.event.detail},"MozMousePixelScroll");rt.prototype.toString=function(){return this.rgb()+""},Bo.hsl=function(n,t,r){return 1===arguments.length?n instanceof ut?et(n.h,n.s,n.l):_t(""+n,bt,et):et(+n,+t,+r)};var ja=ut.prototype=new rt;ja.brighter=function(n){return n=Math.pow(.7,arguments.length?n:1),et(this.h,this.s,this.l/n)},ja.darker=function(n){return n=Math.pow(.7,arguments.length?n:1),et(this.h,this.s,n*this.l)},ja.rgb=function(){return it(this.h,this.s,this.l)},Bo.hcl=function(n,t,r){return 1===arguments.length?n instanceof at?ot(n.h,n.c,n.l):n instanceof lt?ht(n.l,n.a,n.b):ht((n=wt((n=Bo.rgb(n)).r,n.g,n.b)).l,n.a,n.b):ot(+n,+t,+r)};var Ha=at.prototype=new rt;Ha.brighter=function(n){return ot(this.h,this.c,Math.min(100,this.l+Fa*(arguments.length?n:1)))},Ha.darker=function(n){return ot(this.h,this.c,Math.max(0,this.l-Fa*(arguments.length?n:1)))},Ha.rgb=function(){return ct(this.h,this.c,this.l).rgb()},Bo.lab=function(n,t,r){return 1===arguments.length?n instanceof lt?st(n.l,n.a,n.b):n instanceof at?ct(n.l,n.c,n.h):wt((n=Bo.rgb(n)).r,n.g,n.b):st(+n,+t,+r)};var Fa=18,Oa=.95047,Ia=1,Ya=1.08883,Za=lt.prototype=new rt;Za.brighter=function(n){return st(Math.min(100,this.l+Fa*(arguments.length?n:1)),this.a,this.b)},Za.darker=function(n){return st(Math.max(0,this.l-Fa*(arguments.length?n:1)),this.a,this.b)},Za.rgb=function(){return ft(this.l,this.a,this.b)},Bo.rgb=function(n,t,r){return 1===arguments.length?n instanceof xt?yt(n.r,n.g,n.b):_t(""+n,yt,it):yt(~~n,~~t,~~r)};var Va=xt.prototype=new rt;Va.brighter=function(n){n=Math.pow(.7,arguments.length?n:1);var t=this.r,r=this.g,e=this.b,u=30;return t||r||e?(t&&u>t&&(t=u),r&&u>r&&(r=u),e&&u>e&&(e=u),yt(Math.min(255,~~(t/n)),Math.min(255,~~(r/n)),Math.min(255,~~(e/n)))):yt(u,u,u)},Va.darker=function(n){return n=Math.pow(.7,arguments.length?n:1),yt(~~(n*this.r),~~(n*this.g),~~(n*this.b))},Va.hsl=function(){return bt(this.r,this.g,this.b)},Va.toString=function(){return"#"+Mt(this.r)+Mt(this.g)+Mt(this.b)};var $a=Bo.map({aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074});$a.forEach(function(n,t){$a.set(n,dt(t))}),Bo.functor=Et,Bo.xhr=Ct(At),Bo.dsv=function(n,t){function r(n,r,i){arguments.length<3&&(i=r,r=null);var o=Nt(n,t,null==r?e:u(r),i);return o.row=function(n){return arguments.length?o.response(null==(r=n)?e:u(n)):r},o}function e(n){return r.parse(n.responseText)}function u(n){return function(t){return r.parse(t.responseText,n)}}function i(t){return t.map(o).join(n)}function o(n){return a.test(n)?'"'+n.replace(/\"/g,'""')+'"':n}var a=new RegExp('["'+n+"\n]"),c=n.charCodeAt(0);return r.parse=function(n,t){var e;return r.parseRows(n,function(n,r){if(e)return e(n,r-1);var u=new Function("d","return {"+n.map(function(n,t){return JSON.stringify(n)+": d["+t+"]"}).join(",")+"}");e=t?function(n,r){return t(u(n),r)}:u})},r.parseRows=function(n,t){function r(){if(l>=s)return o;if(u)return u=!1,i;var t=l;if(34===n.charCodeAt(t)){for(var r=t;r++<s;)if(34===n.charCodeAt(r)){if(34!==n.charCodeAt(r+1))break;++r}l=r+2;var e=n.charCodeAt(r+1);return 13===e?(u=!0,10===n.charCodeAt(r+2)&&++l):10===e&&(u=!0),n.substring(t+1,r).replace(/""/g,'"')}for(;s>l;){var e=n.charCodeAt(l++),a=1;if(10===e)u=!0;else if(13===e)u=!0,10===n.charCodeAt(l)&&(++l,++a);else if(e!==c)continue;return n.substring(t,l-a)}return n.substring(t)}for(var e,u,i={},o={},a=[],s=n.length,l=0,f=0;(e=r())!==o;){for(var h=[];e!==i&&e!==o;)h.push(e),e=r();(!t||(h=t(h,f++)))&&a.push(h)}return a},r.format=function(t){if(Array.isArray(t[0]))return r.formatRows(t);var e=new h,u=[];return t.forEach(function(n){for(var t in n)e.has(t)||u.push(e.add(t))}),[u.map(o).join(n)].concat(t.map(function(t){return u.map(function(n){return o(t[n])}).join(n)})).join("\n")},r.formatRows=function(n){return n.map(i).join("\n")},r},Bo.csv=Bo.dsv(",","text/csv"),Bo.tsv=Bo.dsv("	","text/tab-separated-values"),Bo.touch=function(n,t,r){if(arguments.length<3&&(r=t,t=x().changedTouches),t)for(var e,u=0,i=t.length;i>u;++u)if((e=t[u]).identifier===r)return Z(n,e)};var Xa,Ba,Ja,Wa,Ga,Ka=Qo[p(Qo,"requestAnimationFrame")]||function(n){setTimeout(n,17)};Bo.timer=function(n,t,r){var e=arguments.length;2>e&&(t=0),3>e&&(r=Date.now());var u=r+t,i={c:n,t:u,f:!1,n:null};Ba?Ba.n=i:Xa=i,Ba=i,Ja||(Wa=clearTimeout(Wa),Ja=1,Ka(Lt))},Bo.timer.flush=function(){Tt(),qt()},Bo.round=function(n,t){return t?Math.round(n*(t=Math.pow(10,t)))/t:Math.round(n)};var Qa=["y","z","a","f","p","n","\xb5","m","","k","M","G","T","P","E","Z","Y"].map(Dt);Bo.formatPrefix=function(n,t){var r=0;return n&&(0>n&&(n*=-1),t&&(n=Bo.round(n,Rt(n,t))),r=1+Math.floor(1e-12+Math.log(n)/Math.LN10),r=Math.max(-24,Math.min(24,3*Math.floor((r-1)/3)))),Qa[8+r/3]};var nc=/(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i,tc=Bo.map({b:function(n){return n.toString(2)},c:function(n){return String.fromCharCode(n)},o:function(n){return n.toString(8)},x:function(n){return n.toString(16)},X:function(n){return n.toString(16).toUpperCase()},g:function(n,t){return n.toPrecision(t)},e:function(n,t){return n.toExponential(t)},f:function(n,t){return n.toFixed(t)},r:function(n,t){return(n=Bo.round(n,Rt(n,t))).toFixed(Math.max(0,Math.min(20,Rt(n*(1+1e-15),t))))}}),rc=Bo.time={},ec=Date;jt.prototype={getDate:function(){return this._.getUTCDate()},getDay:function(){return this._.getUTCDay()},getFullYear:function(){return this._.getUTCFullYear()},getHours:function(){return this._.getUTCHours()},getMilliseconds:function(){return this._.getUTCMilliseconds()},getMinutes:function(){return this._.getUTCMinutes()},getMonth:function(){return this._.getUTCMonth()},getSeconds:function(){return this._.getUTCSeconds()},getTime:function(){return this._.getTime()},getTimezoneOffset:function(){return 0},valueOf:function(){return this._.valueOf()},setDate:function(){uc.setUTCDate.apply(this._,arguments)},setDay:function(){uc.setUTCDay.apply(this._,arguments)},setFullYear:function(){uc.setUTCFullYear.apply(this._,arguments)},setHours:function(){uc.setUTCHours.apply(this._,arguments)},setMilliseconds:function(){uc.setUTCMilliseconds.apply(this._,arguments)},setMinutes:function(){uc.setUTCMinutes.apply(this._,arguments)},setMonth:function(){uc.setUTCMonth.apply(this._,arguments)},setSeconds:function(){uc.setUTCSeconds.apply(this._,arguments)},setTime:function(){uc.setTime.apply(this._,arguments)}};var uc=Date.prototype;rc.year=Ht(function(n){return n=rc.day(n),n.setMonth(0,1),n},function(n,t){n.setFullYear(n.getFullYear()+t)},function(n){return n.getFullYear()}),rc.years=rc.year.range,rc.years.utc=rc.year.utc.range,rc.day=Ht(function(n){var t=new ec(2e3,0);return t.setFullYear(n.getFullYear(),n.getMonth(),n.getDate()),t},function(n,t){n.setDate(n.getDate()+t)},function(n){return n.getDate()-1}),rc.days=rc.day.range,rc.days.utc=rc.day.utc.range,rc.dayOfYear=function(n){var t=rc.year(n);return Math.floor((n-t-6e4*(n.getTimezoneOffset()-t.getTimezoneOffset()))/864e5)},["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].forEach(function(n,t){t=7-t;var r=rc[n]=Ht(function(n){return(n=rc.day(n)).setDate(n.getDate()-(n.getDay()+t)%7),n},function(n,t){n.setDate(n.getDate()+7*Math.floor(t))},function(n){var r=rc.year(n).getDay();return Math.floor((rc.dayOfYear(n)+(r+t)%7)/7)-(r!==t)});rc[n+"s"]=r.range,rc[n+"s"].utc=r.utc.range,rc[n+"OfYear"]=function(n){var r=rc.year(n).getDay();return Math.floor((rc.dayOfYear(n)+(r+t)%7)/7)}}),rc.week=rc.sunday,rc.weeks=rc.sunday.range,rc.weeks.utc=rc.sunday.utc.range,rc.weekOfYear=rc.sundayOfYear;var ic={"-":"",_:" ",0:"0"},oc=/^\s*\d+/,ac=/^%/;Bo.locale=function(n){return{numberFormat:Pt(n),timeFormat:Ot(n)}};var cc=Bo.locale({decimal:".",thousands:",",grouping:[3],currency:["$",""],dateTime:"%a %b %e %X %Y",date:"%m/%d/%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]});Bo.format=cc.numberFormat,Bo.geo={},cr.prototype={s:0,t:0,add:function(n){sr(n,this.t,sc),sr(sc.s,this.s,this),this.s?this.t+=sc.t:this.s=sc.t},reset:function(){this.s=this.t=0},valueOf:function(){return this.s}};var sc=new cr;Bo.geo.stream=function(n,t){n&&lc.hasOwnProperty(n.type)?lc[n.type](n,t):lr(n,t)};var lc={Feature:function(n,t){lr(n.geometry,t)},FeatureCollection:function(n,t){for(var r=n.features,e=-1,u=r.length;++e<u;)lr(r[e].geometry,t)}},fc={Sphere:function(n,t){t.sphere()},Point:function(n,t){n=n.coordinates,t.point(n[0],n[1],n[2])},MultiPoint:function(n,t){for(var r=n.coordinates,e=-1,u=r.length;++e<u;)n=r[e],t.point(n[0],n[1],n[2])},LineString:function(n,t){fr(n.coordinates,t,0)},MultiLineString:function(n,t){for(var r=n.coordinates,e=-1,u=r.length;++e<u;)fr(r[e],t,0)},Polygon:function(n,t){hr(n.coordinates,t)},MultiPolygon:function(n,t){for(var r=n.coordinates,e=-1,u=r.length;++e<u;)hr(r[e],t)},GeometryCollection:function(n,t){for(var r=n.geometries,e=-1,u=r.length;++e<u;)lr(r[e],t)}};Bo.geo.area=function(n){return hc=0,Bo.geo.stream(n,pc),hc};var hc,gc=new cr,pc={sphere:function(){hc+=4*ka},point:v,lineStart:v,lineEnd:v,polygonStart:function(){gc.reset(),pc.lineStart=gr},polygonEnd:function(){var n=2*gc;hc+=0>n?4*ka+n:n,pc.lineStart=pc.lineEnd=pc.point=v}};Bo.geo.bounds=function(){function n(n,t){x.push(M=[l=n,h=n]),f>t&&(f=t),t>g&&(g=t)}function t(t,r){var e=pr([t*za,r*za]);if(m){var u=dr(m,e),i=[u[1],-u[0],0],o=dr(i,u);xr(o),o=Mr(o);var c=t-p,s=c>0?1:-1,v=o[0]*La*s,d=ca(c)>180;if(d^(v>s*p&&s*t>v)){var y=o[1]*La;y>g&&(g=y)}else if(v=(v+360)%360-180,d^(v>s*p&&s*t>v)){var y=-o[1]*La;f>y&&(f=y)}else f>r&&(f=r),r>g&&(g=r);d?p>t?a(l,t)>a(l,h)&&(h=t):a(t,h)>a(l,h)&&(l=t):h>=l?(l>t&&(l=t),t>h&&(h=t)):t>p?a(l,t)>a(l,h)&&(h=t):a(t,h)>a(l,h)&&(l=t)}else n(t,r);m=e,p=t}function r(){_.point=t}function e(){M[0]=l,M[1]=h,_.point=n,m=null}function u(n,r){if(m){var e=n-p;y+=ca(e)>180?e+(e>0?360:-360):e}else v=n,d=r;pc.point(n,r),t(n,r)}function i(){pc.lineStart()}function o(){u(v,d),pc.lineEnd(),ca(y)>Ca&&(l=-(h=180)),M[0]=l,M[1]=h,m=null}function a(n,t){return(t-=n)<0?t+360:t}function c(n,t){return n[0]-t[0]}function s(n,t){return t[0]<=t[1]?t[0]<=n&&n<=t[1]:n<t[0]||t[1]<n}var l,f,h,g,p,v,d,m,y,x,M,_={point:n,lineStart:r,lineEnd:e,polygonStart:function(){_.point=u,_.lineStart=i,_.lineEnd=o,y=0,pc.polygonStart()},polygonEnd:function(){pc.polygonEnd(),_.point=n,_.lineStart=r,_.lineEnd=e,0>gc?(l=-(h=180),f=-(g=90)):y>Ca?g=90:-Ca>y&&(f=-90),M[0]=l,M[1]=h}};return function(n){g=h=-(l=f=1/0),x=[],Bo.geo.stream(n,_);var t=x.length;if(t){x.sort(c);for(var r,e=1,u=x[0],i=[u];t>e;++e)r=x[e],s(r[0],u)||s(r[1],u)?(a(u[0],r[1])>a(u[0],u[1])&&(u[1]=r[1]),a(r[0],u[1])>a(u[0],u[1])&&(u[0]=r[0])):i.push(u=r);for(var o,r,p=-1/0,t=i.length-1,e=0,u=i[t];t>=e;u=r,++e)r=i[e],(o=a(u[1],r[0]))>p&&(p=o,l=r[0],h=u[1])}return x=M=null,1/0===l||1/0===f?[[0/0,0/0],[0/0,0/0]]:[[l,f],[h,g]]
}}(),Bo.geo.centroid=function(n){vc=dc=mc=yc=xc=Mc=_c=bc=wc=Sc=kc=0,Bo.geo.stream(n,Ec);var t=wc,r=Sc,e=kc,u=t*t+r*r+e*e;return Na>u&&(t=Mc,r=_c,e=bc,Ca>dc&&(t=mc,r=yc,e=xc),u=t*t+r*r+e*e,Na>u)?[0/0,0/0]:[Math.atan2(r,t)*La,G(e/Math.sqrt(u))*La]};var vc,dc,mc,yc,xc,Mc,_c,bc,wc,Sc,kc,Ec={sphere:v,point:br,lineStart:Sr,lineEnd:kr,polygonStart:function(){Ec.lineStart=Er},polygonEnd:function(){Ec.lineStart=Sr}},Ac=Lr(Ar,Pr,jr,[-ka,-ka/2]),Cc=1e9;Bo.geo.clipExtent=function(){var n,t,r,e,u,i,o={stream:function(n){return u&&(u.valid=!1),u=i(n),u.valid=!0,u},extent:function(a){return arguments.length?(i=Or(n=+a[0][0],t=+a[0][1],r=+a[1][0],e=+a[1][1]),u&&(u.valid=!1,u=null),o):[[n,t],[r,e]]}};return o.extent([[0,0],[960,500]])},(Bo.geo.conicEqualArea=function(){return Yr(Zr)}).raw=Zr,Bo.geo.albers=function(){return Bo.geo.conicEqualArea().rotate([96,0]).center([-.6,38.7]).parallels([29.5,45.5]).scale(1070)},Bo.geo.albersUsa=function(){function n(n){var i=n[0],o=n[1];return t=null,r(i,o),t||(e(i,o),t)||u(i,o),t}var t,r,e,u,i=Bo.geo.albers(),o=Bo.geo.conicEqualArea().rotate([154,0]).center([-2,58.5]).parallels([55,65]),a=Bo.geo.conicEqualArea().rotate([157,0]).center([-3,19.9]).parallels([8,18]),c={point:function(n,r){t=[n,r]}};return n.invert=function(n){var t=i.scale(),r=i.translate(),e=(n[0]-r[0])/t,u=(n[1]-r[1])/t;return(u>=.12&&.234>u&&e>=-.425&&-.214>e?o:u>=.166&&.234>u&&e>=-.214&&-.115>e?a:i).invert(n)},n.stream=function(n){var t=i.stream(n),r=o.stream(n),e=a.stream(n);return{point:function(n,u){t.point(n,u),r.point(n,u),e.point(n,u)},sphere:function(){t.sphere(),r.sphere(),e.sphere()},lineStart:function(){t.lineStart(),r.lineStart(),e.lineStart()},lineEnd:function(){t.lineEnd(),r.lineEnd(),e.lineEnd()},polygonStart:function(){t.polygonStart(),r.polygonStart(),e.polygonStart()},polygonEnd:function(){t.polygonEnd(),r.polygonEnd(),e.polygonEnd()}}},n.precision=function(t){return arguments.length?(i.precision(t),o.precision(t),a.precision(t),n):i.precision()},n.scale=function(t){return arguments.length?(i.scale(t),o.scale(.35*t),a.scale(t),n.translate(i.translate())):i.scale()},n.translate=function(t){if(!arguments.length)return i.translate();var s=i.scale(),l=+t[0],f=+t[1];return r=i.translate(t).clipExtent([[l-.455*s,f-.238*s],[l+.455*s,f+.238*s]]).stream(c).point,e=o.translate([l-.307*s,f+.201*s]).clipExtent([[l-.425*s+Ca,f+.12*s+Ca],[l-.214*s-Ca,f+.234*s-Ca]]).stream(c).point,u=a.translate([l-.205*s,f+.212*s]).clipExtent([[l-.214*s+Ca,f+.166*s+Ca],[l-.115*s-Ca,f+.234*s-Ca]]).stream(c).point,n},n.scale(1070)};var Nc,zc,Lc,Tc,qc,Rc,Dc={point:v,lineStart:v,lineEnd:v,polygonStart:function(){zc=0,Dc.lineStart=Vr},polygonEnd:function(){Dc.lineStart=Dc.lineEnd=Dc.point=v,Nc+=ca(zc/2)}},Pc={point:$r,lineStart:v,lineEnd:v,polygonStart:v,polygonEnd:v},Uc={point:Jr,lineStart:Wr,lineEnd:Gr,polygonStart:function(){Uc.lineStart=Kr},polygonEnd:function(){Uc.point=Jr,Uc.lineStart=Wr,Uc.lineEnd=Gr}};Bo.geo.path=function(){function n(n){return n&&("function"==typeof a&&i.pointRadius(+a.apply(this,arguments)),o&&o.valid||(o=u(i)),Bo.geo.stream(n,o)),i.result()}function t(){return o=null,n}var r,e,u,i,o,a=4.5;return n.area=function(n){return Nc=0,Bo.geo.stream(n,u(Dc)),Nc},n.centroid=function(n){return mc=yc=xc=Mc=_c=bc=wc=Sc=kc=0,Bo.geo.stream(n,u(Uc)),kc?[wc/kc,Sc/kc]:bc?[Mc/bc,_c/bc]:xc?[mc/xc,yc/xc]:[0/0,0/0]},n.bounds=function(n){return qc=Rc=-(Lc=Tc=1/0),Bo.geo.stream(n,u(Pc)),[[Lc,Tc],[qc,Rc]]},n.projection=function(n){return arguments.length?(u=(r=n)?n.stream||te(n):At,t()):r},n.context=function(n){return arguments.length?(i=null==(e=n)?new Xr:new Qr(n),"function"!=typeof a&&i.pointRadius(a),t()):e},n.pointRadius=function(t){return arguments.length?(a="function"==typeof t?t:(i.pointRadius(+t),+t),n):a},n.projection(Bo.geo.albersUsa()).context(null)},Bo.geo.transform=function(n){return{stream:function(t){var r=new re(t);for(var e in n)r[e]=n[e];return r}}},re.prototype={point:function(n,t){this.stream.point(n,t)},sphere:function(){this.stream.sphere()},lineStart:function(){this.stream.lineStart()},lineEnd:function(){this.stream.lineEnd()},polygonStart:function(){this.stream.polygonStart()},polygonEnd:function(){this.stream.polygonEnd()}},Bo.geo.projection=ue,Bo.geo.projectionMutator=ie,(Bo.geo.equirectangular=function(){return ue(ae)}).raw=ae.invert=ae,Bo.geo.rotation=function(n){function t(t){return t=n(t[0]*za,t[1]*za),t[0]*=La,t[1]*=La,t}return n=se(n[0]%360*za,n[1]*za,n.length>2?n[2]*za:0),t.invert=function(t){return t=n.invert(t[0]*za,t[1]*za),t[0]*=La,t[1]*=La,t},t},ce.invert=ae,Bo.geo.circle=function(){function n(){var n="function"==typeof e?e.apply(this,arguments):e,t=se(-n[0]*za,-n[1]*za,0).invert,u=[];return r(null,null,1,{point:function(n,r){u.push(n=t(n,r)),n[0]*=La,n[1]*=La}}),{type:"Polygon",coordinates:[u]}}var t,r,e=[0,0],u=6;return n.origin=function(t){return arguments.length?(e=t,n):e},n.angle=function(e){return arguments.length?(r=ge((t=+e)*za,u*za),n):t},n.precision=function(e){return arguments.length?(r=ge(t*za,(u=+e)*za),n):u},n.angle(90)},Bo.geo.distance=function(n,t){var r,e=(t[0]-n[0])*za,u=n[1]*za,i=t[1]*za,o=Math.sin(e),a=Math.cos(e),c=Math.sin(u),s=Math.cos(u),l=Math.sin(i),f=Math.cos(i);return Math.atan2(Math.sqrt((r=f*o)*r+(r=s*l-c*f*a)*r),c*l+s*f*a)},Bo.geo.graticule=function(){function n(){return{type:"MultiLineString",coordinates:t()}}function t(){return Bo.range(Math.ceil(i/d)*d,u,d).map(h).concat(Bo.range(Math.ceil(s/m)*m,c,m).map(g)).concat(Bo.range(Math.ceil(e/p)*p,r,p).filter(function(n){return ca(n%d)>Ca}).map(l)).concat(Bo.range(Math.ceil(a/v)*v,o,v).filter(function(n){return ca(n%m)>Ca}).map(f))}var r,e,u,i,o,a,c,s,l,f,h,g,p=10,v=p,d=90,m=360,y=2.5;return n.lines=function(){return t().map(function(n){return{type:"LineString",coordinates:n}})},n.outline=function(){return{type:"Polygon",coordinates:[h(i).concat(g(c).slice(1),h(u).reverse().slice(1),g(s).reverse().slice(1))]}},n.extent=function(t){return arguments.length?n.majorExtent(t).minorExtent(t):n.minorExtent()},n.majorExtent=function(t){return arguments.length?(i=+t[0][0],u=+t[1][0],s=+t[0][1],c=+t[1][1],i>u&&(t=i,i=u,u=t),s>c&&(t=s,s=c,c=t),n.precision(y)):[[i,s],[u,c]]},n.minorExtent=function(t){return arguments.length?(e=+t[0][0],r=+t[1][0],a=+t[0][1],o=+t[1][1],e>r&&(t=e,e=r,r=t),a>o&&(t=a,a=o,o=t),n.precision(y)):[[e,a],[r,o]]},n.step=function(t){return arguments.length?n.majorStep(t).minorStep(t):n.minorStep()},n.majorStep=function(t){return arguments.length?(d=+t[0],m=+t[1],n):[d,m]},n.minorStep=function(t){return arguments.length?(p=+t[0],v=+t[1],n):[p,v]},n.precision=function(t){return arguments.length?(y=+t,l=ve(a,o,90),f=de(e,r,y),h=ve(s,c,90),g=de(i,u,y),n):y},n.majorExtent([[-180,-90+Ca],[180,90-Ca]]).minorExtent([[-180,-80-Ca],[180,80+Ca]])},Bo.geo.greatArc=function(){function n(){return{type:"LineString",coordinates:[t||e.apply(this,arguments),r||u.apply(this,arguments)]}}var t,r,e=me,u=ye;return n.distance=function(){return Bo.geo.distance(t||e.apply(this,arguments),r||u.apply(this,arguments))},n.source=function(r){return arguments.length?(e=r,t="function"==typeof r?null:r,n):e},n.target=function(t){return arguments.length?(u=t,r="function"==typeof t?null:t,n):u},n.precision=function(){return arguments.length?n:0},n},Bo.geo.interpolate=function(n,t){return xe(n[0]*za,n[1]*za,t[0]*za,t[1]*za)},Bo.geo.length=function(n){return jc=0,Bo.geo.stream(n,Hc),jc};var jc,Hc={sphere:v,point:v,lineStart:Me,lineEnd:v,polygonStart:v,polygonEnd:v},Fc=_e(function(n){return Math.sqrt(2/(1+n))},function(n){return 2*Math.asin(n/2)});(Bo.geo.azimuthalEqualArea=function(){return ue(Fc)}).raw=Fc;var Oc=_e(function(n){var t=Math.acos(n);return t&&t/Math.sin(t)},At);(Bo.geo.azimuthalEquidistant=function(){return ue(Oc)}).raw=Oc,(Bo.geo.conicConformal=function(){return Yr(be)}).raw=be,(Bo.geo.conicEquidistant=function(){return Yr(we)}).raw=we;var Ic=_e(function(n){return 1/n},Math.atan);(Bo.geo.gnomonic=function(){return ue(Ic)}).raw=Ic,Se.invert=function(n,t){return[n,2*Math.atan(Math.exp(t))-Aa]},(Bo.geo.mercator=function(){return ke(Se)}).raw=Se;var Yc=_e(function(){return 1},Math.asin);(Bo.geo.orthographic=function(){return ue(Yc)}).raw=Yc;var Zc=_e(function(n){return 1/(1+n)},function(n){return 2*Math.atan(n)});(Bo.geo.stereographic=function(){return ue(Zc)}).raw=Zc,Ee.invert=function(n,t){return[-t,2*Math.atan(Math.exp(n))-Aa]},(Bo.geo.transverseMercator=function(){var n=ke(Ee),t=n.center,r=n.rotate;return n.center=function(n){return n?t([-n[1],n[0]]):(n=t(),[-n[1],n[0]])},n.rotate=function(n){return n?r([n[0],n[1],n.length>2?n[2]+90:90]):(n=r(),[n[0],n[1],n[2]-90])},n.rotate([0,0])}).raw=Ee,Bo.geom={},Bo.geom.hull=function(n){function t(n){if(n.length<3)return[];var t,u=Et(r),i=Et(e),o=n.length,a=[],c=[];for(t=0;o>t;t++)a.push([+u.call(this,n[t],t),+i.call(this,n[t],t),t]);for(a.sort(ze),t=0;o>t;t++)c.push([a[t][0],-a[t][1]]);var s=Ne(a),l=Ne(c),f=l[0]===s[0],h=l[l.length-1]===s[s.length-1],g=[];for(t=s.length-1;t>=0;--t)g.push(n[a[s[t]][2]]);for(t=+f;t<l.length-h;++t)g.push(n[a[l[t]][2]]);return g}var r=Ae,e=Ce;return arguments.length?t(n):(t.x=function(n){return arguments.length?(r=n,t):r},t.y=function(n){return arguments.length?(e=n,t):e},t)},Bo.geom.polygon=function(n){return ga(n,Vc),n};var Vc=Bo.geom.polygon.prototype=[];Vc.area=function(){for(var n,t=-1,r=this.length,e=this[r-1],u=0;++t<r;)n=e,e=this[t],u+=n[1]*e[0]-n[0]*e[1];return.5*u},Vc.centroid=function(n){var t,r,e=-1,u=this.length,i=0,o=0,a=this[u-1];for(arguments.length||(n=-1/(6*this.area()));++e<u;)t=a,a=this[e],r=t[0]*a[1]-a[0]*t[1],i+=(t[0]+a[0])*r,o+=(t[1]+a[1])*r;return[i*n,o*n]},Vc.clip=function(n){for(var t,r,e,u,i,o,a=qe(n),c=-1,s=this.length-qe(this),l=this[s-1];++c<s;){for(t=n.slice(),n.length=0,u=this[c],i=t[(e=t.length-a)-1],r=-1;++r<e;)o=t[r],Le(o,l,u)?(Le(i,l,u)||n.push(Te(i,o,l,u)),n.push(o)):Le(i,l,u)&&n.push(Te(i,o,l,u)),i=o;a&&n.push(n[0]),l=u}return n};var $c,Xc,Bc,Jc,Wc,Gc=[],Kc=[];Oe.prototype.prepare=function(){for(var n,t=this.edges,r=t.length;r--;)n=t[r].edge,n.b&&n.a||t.splice(r,1);return t.sort(Ye),t.length},Qe.prototype={start:function(){return this.edge.l===this.site?this.edge.a:this.edge.b},end:function(){return this.edge.l===this.site?this.edge.b:this.edge.a}},nu.prototype={insert:function(n,t){var r,e,u;if(n){if(t.P=n,t.N=n.N,n.N&&(n.N.P=t),n.N=t,n.R){for(n=n.R;n.L;)n=n.L;n.L=t}else n.R=t;r=n}else this._?(n=uu(this._),t.P=null,t.N=n,n.P=n.L=t,r=n):(t.P=t.N=null,this._=t,r=null);for(t.L=t.R=null,t.U=r,t.C=!0,n=t;r&&r.C;)e=r.U,r===e.L?(u=e.R,u&&u.C?(r.C=u.C=!1,e.C=!0,n=e):(n===r.R&&(ru(this,r),n=r,r=n.U),r.C=!1,e.C=!0,eu(this,e))):(u=e.L,u&&u.C?(r.C=u.C=!1,e.C=!0,n=e):(n===r.L&&(eu(this,r),n=r,r=n.U),r.C=!1,e.C=!0,ru(this,e))),r=n.U;this._.C=!1},remove:function(n){n.N&&(n.N.P=n.P),n.P&&(n.P.N=n.N),n.N=n.P=null;var t,r,e,u=n.U,i=n.L,o=n.R;if(r=i?o?uu(o):i:o,u?u.L===n?u.L=r:u.R=r:this._=r,i&&o?(e=r.C,r.C=n.C,r.L=i,i.U=r,r!==o?(u=r.U,r.U=n.U,n=r.R,u.L=n,r.R=o,o.U=r):(r.U=u,u=r,n=r.R)):(e=n.C,n=r),n&&(n.U=u),!e){if(n&&n.C)return n.C=!1,void 0;do{if(n===this._)break;if(n===u.L){if(t=u.R,t.C&&(t.C=!1,u.C=!0,ru(this,u),t=u.R),t.L&&t.L.C||t.R&&t.R.C){t.R&&t.R.C||(t.L.C=!1,t.C=!0,eu(this,t),t=u.R),t.C=u.C,u.C=t.R.C=!1,ru(this,u),n=this._;break}}else if(t=u.L,t.C&&(t.C=!1,u.C=!0,eu(this,u),t=u.L),t.L&&t.L.C||t.R&&t.R.C){t.L&&t.L.C||(t.R.C=!1,t.C=!0,ru(this,t),t=u.L),t.C=u.C,u.C=t.L.C=!1,eu(this,u),n=this._;break}t.C=!0,n=u,u=u.U}while(!n.C);n&&(n.C=!1)}}},Bo.geom.voronoi=function(n){function t(n){var t=new Array(n.length),e=a[0][0],u=a[0][1],i=a[1][0],o=a[1][1];return iu(r(n),a).cells.forEach(function(r,a){var c=r.edges,s=r.site,l=t[a]=c.length?c.map(function(n){var t=n.start();return[t.x,t.y]}):s.x>=e&&s.x<=i&&s.y>=u&&s.y<=o?[[e,o],[i,o],[i,u],[e,u]]:[];l.point=n[a]}),t}function r(n){return n.map(function(n,t){return{x:Math.round(i(n,t)/Ca)*Ca,y:Math.round(o(n,t)/Ca)*Ca,i:t}})}var e=Ae,u=Ce,i=e,o=u,a=Qc;return n?t(n):(t.links=function(n){return iu(r(n)).edges.filter(function(n){return n.l&&n.r}).map(function(t){return{source:n[t.l.i],target:n[t.r.i]}})},t.triangles=function(n){var t=[];return iu(r(n)).cells.forEach(function(r,e){for(var u,i,o=r.site,a=r.edges.sort(Ye),c=-1,s=a.length,l=a[s-1].edge,f=l.l===o?l.r:l.l;++c<s;)u=l,i=f,l=a[c].edge,f=l.l===o?l.r:l.l,e<i.i&&e<f.i&&au(o,i,f)<0&&t.push([n[e],n[i.i],n[f.i]])}),t},t.x=function(n){return arguments.length?(i=Et(e=n),t):e},t.y=function(n){return arguments.length?(o=Et(u=n),t):u},t.clipExtent=function(n){return arguments.length?(a=null==n?Qc:n,t):a===Qc?null:a},t.size=function(n){return arguments.length?t.clipExtent(n&&[[0,0],n]):a===Qc?null:a&&a[1]},t)};var Qc=[[-1e6,-1e6],[1e6,1e6]];Bo.geom.delaunay=function(n){return Bo.geom.voronoi().triangles(n)},Bo.geom.quadtree=function(n,t,r,e,u){function i(n){function i(n,t,r,e,u,i,o,a){if(!isNaN(r)&&!isNaN(e))if(n.leaf){var c=n.x,l=n.y;if(null!=c)if(ca(c-r)+ca(l-e)<.01)s(n,t,r,e,u,i,o,a);else{var f=n.point;n.x=n.y=n.point=null,s(n,f,c,l,u,i,o,a),s(n,t,r,e,u,i,o,a)}else n.x=r,n.y=e,n.point=t}else s(n,t,r,e,u,i,o,a)}function s(n,t,r,e,u,o,a,c){var s=.5*(u+a),l=.5*(o+c),f=r>=s,h=e>=l,g=(h<<1)+f;n.leaf=!1,n=n.nodes[g]||(n.nodes[g]=lu()),f?u=s:a=s,h?o=l:c=l,i(n,t,r,e,u,o,a,c)}var l,f,h,g,p,v,d,m,y,x=Et(a),M=Et(c);if(null!=t)v=t,d=r,m=e,y=u;else if(m=y=-(v=d=1/0),f=[],h=[],p=n.length,o)for(g=0;p>g;++g)l=n[g],l.x<v&&(v=l.x),l.y<d&&(d=l.y),l.x>m&&(m=l.x),l.y>y&&(y=l.y),f.push(l.x),h.push(l.y);else for(g=0;p>g;++g){var _=+x(l=n[g],g),b=+M(l,g);v>_&&(v=_),d>b&&(d=b),_>m&&(m=_),b>y&&(y=b),f.push(_),h.push(b)}var w=m-v,S=y-d;w>S?y=d+w:m=v+S;var k=lu();if(k.add=function(n){i(k,n,+x(n,++g),+M(n,g),v,d,m,y)},k.visit=function(n){fu(n,k,v,d,m,y)},g=-1,null==t){for(;++g<p;)i(k,n[g],f[g],h[g],v,d,m,y);--g}else n.forEach(k.add);return f=h=n=l=null,k}var o,a=Ae,c=Ce;return(o=arguments.length)?(a=cu,c=su,3===o&&(u=r,e=t,r=t=0),i(n)):(i.x=function(n){return arguments.length?(a=n,i):a},i.y=function(n){return arguments.length?(c=n,i):c},i.extent=function(n){return arguments.length?(null==n?t=r=e=u=null:(t=+n[0][0],r=+n[0][1],e=+n[1][0],u=+n[1][1]),i):null==t?null:[[t,r],[e,u]]},i.size=function(n){return arguments.length?(null==n?t=r=e=u=null:(t=r=0,e=+n[0],u=+n[1]),i):null==t?null:[e-t,u-r]},i)},Bo.interpolateRgb=hu,Bo.interpolateObject=gu,Bo.interpolateNumber=pu,Bo.interpolateString=vu;var ns=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,ts=new RegExp(ns.source,"g");Bo.interpolate=du,Bo.interpolators=[function(n,t){var r=typeof t;return("string"===r?$a.has(t)||/^(#|rgb\(|hsl\()/.test(t)?hu:vu:t instanceof rt?hu:Array.isArray(t)?mu:"object"===r&&isNaN(t)?gu:pu)(n,t)}],Bo.interpolateArray=mu;var rs=function(){return At},es=Bo.map({linear:rs,poly:Su,quad:function(){return _u},cubic:function(){return bu},sin:function(){return ku},exp:function(){return Eu},circle:function(){return Au},elastic:Cu,back:Nu,bounce:function(){return zu}}),us=Bo.map({"in":At,out:xu,"in-out":Mu,"out-in":function(n){return Mu(xu(n))}});Bo.ease=function(n){var t=n.indexOf("-"),r=t>=0?n.substring(0,t):n,e=t>=0?n.substring(t+1):"in";return r=es.get(r)||rs,e=us.get(e)||At,yu(e(r.apply(null,Jo.call(arguments,1))))},Bo.interpolateHcl=Lu,Bo.interpolateHsl=Tu,Bo.interpolateLab=qu,Bo.interpolateRound=Ru,Bo.transform=function(n){var t=Go.createElementNS(Bo.ns.prefix.svg,"g");return(Bo.transform=function(n){if(null!=n){t.setAttribute("transform",n);var r=t.transform.baseVal.consolidate()}return new Du(r?r.matrix:is)})(n)},Du.prototype.toString=function(){return"translate("+this.translate+")rotate("+this.rotate+")skewX("+this.skew+")scale("+this.scale+")"};var is={a:1,b:0,c:0,d:1,e:0,f:0};Bo.interpolateTransform=Hu,Bo.layout={},Bo.layout.bundle=function(){return function(n){for(var t=[],r=-1,e=n.length;++r<e;)t.push(Iu(n[r]));return t}},Bo.layout.chord=function(){function n(){var n,s,f,h,g,p={},v=[],d=Bo.range(i),m=[];for(r=[],e=[],n=0,h=-1;++h<i;){for(s=0,g=-1;++g<i;)s+=u[h][g];v.push(s),m.push(Bo.range(i)),n+=s}for(o&&d.sort(function(n,t){return o(v[n],v[t])}),a&&m.forEach(function(n,t){n.sort(function(n,r){return a(u[t][n],u[t][r])})}),n=(Ea-l*i)/n,s=0,h=-1;++h<i;){for(f=s,g=-1;++g<i;){var y=d[h],x=m[y][g],M=u[y][x],_=s,b=s+=M*n;p[y+"-"+x]={index:y,subindex:x,startAngle:_,endAngle:b,value:M}}e[y]={index:y,startAngle:f,endAngle:s,value:(s-f)/n},s+=l}for(h=-1;++h<i;)for(g=h-1;++g<i;){var w=p[h+"-"+g],S=p[g+"-"+h];(w.value||S.value)&&r.push(w.value<S.value?{source:S,target:w}:{source:w,target:S})}c&&t()}function t(){r.sort(function(n,t){return c((n.source.value+n.target.value)/2,(t.source.value+t.target.value)/2)})}var r,e,u,i,o,a,c,s={},l=0;return s.matrix=function(n){return arguments.length?(i=(u=n)&&u.length,r=e=null,s):u},s.padding=function(n){return arguments.length?(l=n,r=e=null,s):l},s.sortGroups=function(n){return arguments.length?(o=n,r=e=null,s):o},s.sortSubgroups=function(n){return arguments.length?(a=n,r=null,s):a},s.sortChords=function(n){return arguments.length?(c=n,r&&t(),s):c},s.chords=function(){return r||n(),r},s.groups=function(){return e||n(),e},s},Bo.layout.force=function(){function n(n){return function(t,r,e,u){if(t.point!==n){var i=t.cx-n.x,o=t.cy-n.y,a=u-r,c=i*i+o*o;if(c>a*a/d){if(p>c){var s=t.charge/c;n.px-=i*s,n.py-=o*s}return!0}if(t.point&&c&&p>c){var s=t.pointCharge/c;n.px-=i*s,n.py-=o*s}}return!t.charge}}function t(n){n.px=Bo.event.x,n.py=Bo.event.y,a.resume()}var r,e,u,i,o,a={},c=Bo.dispatch("start","tick","end"),s=[1,1],l=.9,f=os,h=as,g=-30,p=cs,v=.1,d=.64,m=[],y=[];return a.tick=function(){if((e*=.99)<.005)return c.end({type:"end",alpha:e=0}),!0;var t,r,a,f,h,p,d,x,M,_=m.length,b=y.length;for(r=0;b>r;++r)a=y[r],f=a.source,h=a.target,x=h.x-f.x,M=h.y-f.y,(p=x*x+M*M)&&(p=e*i[r]*((p=Math.sqrt(p))-u[r])/p,x*=p,M*=p,h.x-=x*(d=f.weight/(h.weight+f.weight)),h.y-=M*d,f.x+=x*(d=1-d),f.y+=M*d);if((d=e*v)&&(x=s[0]/2,M=s[1]/2,r=-1,d))for(;++r<_;)a=m[r],a.x+=(x-a.x)*d,a.y+=(M-a.y)*d;if(g)for(Ju(t=Bo.geom.quadtree(m),e,o),r=-1;++r<_;)(a=m[r]).fixed||t.visit(n(a));for(r=-1;++r<_;)a=m[r],a.fixed?(a.x=a.px,a.y=a.py):(a.x-=(a.px-(a.px=a.x))*l,a.y-=(a.py-(a.py=a.y))*l);c.tick({type:"tick",alpha:e})},a.nodes=function(n){return arguments.length?(m=n,a):m},a.links=function(n){return arguments.length?(y=n,a):y},a.size=function(n){return arguments.length?(s=n,a):s},a.linkDistance=function(n){return arguments.length?(f="function"==typeof n?n:+n,a):f},a.distance=a.linkDistance,a.linkStrength=function(n){return arguments.length?(h="function"==typeof n?n:+n,a):h},a.friction=function(n){return arguments.length?(l=+n,a):l},a.charge=function(n){return arguments.length?(g="function"==typeof n?n:+n,a):g},a.chargeDistance=function(n){return arguments.length?(p=n*n,a):Math.sqrt(p)},a.gravity=function(n){return arguments.length?(v=+n,a):v},a.theta=function(n){return arguments.length?(d=n*n,a):Math.sqrt(d)},a.alpha=function(n){return arguments.length?(n=+n,e?e=n>0?n:0:n>0&&(c.start({type:"start",alpha:e=n}),Bo.timer(a.tick)),a):e},a.start=function(){function n(n,e){if(!r){for(r=new Array(c),a=0;c>a;++a)r[a]=[];for(a=0;s>a;++a){var u=y[a];r[u.source.index].push(u.target),r[u.target.index].push(u.source)}}for(var i,o=r[t],a=-1,s=o.length;++a<s;)if(!isNaN(i=o[a][n]))return i;return Math.random()*e}var t,r,e,c=m.length,l=y.length,p=s[0],v=s[1];for(t=0;c>t;++t)(e=m[t]).index=t,e.weight=0;for(t=0;l>t;++t)e=y[t],"number"==typeof e.source&&(e.source=m[e.source]),"number"==typeof e.target&&(e.target=m[e.target]),++e.source.weight,++e.target.weight;for(t=0;c>t;++t)e=m[t],isNaN(e.x)&&(e.x=n("x",p)),isNaN(e.y)&&(e.y=n("y",v)),isNaN(e.px)&&(e.px=e.x),isNaN(e.py)&&(e.py=e.y);if(u=[],"function"==typeof f)for(t=0;l>t;++t)u[t]=+f.call(this,y[t],t);else for(t=0;l>t;++t)u[t]=f;if(i=[],"function"==typeof h)for(t=0;l>t;++t)i[t]=+h.call(this,y[t],t);else for(t=0;l>t;++t)i[t]=h;if(o=[],"function"==typeof g)for(t=0;c>t;++t)o[t]=+g.call(this,m[t],t);else for(t=0;c>t;++t)o[t]=g;return a.resume()},a.resume=function(){return a.alpha(.1)},a.stop=function(){return a.alpha(0)},a.drag=function(){return r||(r=Bo.behavior.drag().origin(At).on("dragstart.force",Vu).on("drag.force",t).on("dragend.force",$u)),arguments.length?(this.on("mouseover.force",Xu).on("mouseout.force",Bu).call(r),void 0):r},Bo.rebind(a,c,"on")};var os=20,as=1,cs=1/0;Bo.layout.hierarchy=function(){function n(u){var i,o=[u],a=[];for(u.depth=0;null!=(i=o.pop());)if(a.push(i),(s=r.call(n,i,i.depth))&&(c=s.length)){for(var c,s,l;--c>=0;)o.push(l=s[c]),l.parent=i,l.depth=i.depth+1;e&&(i.value=0),i.children=s}else e&&(i.value=+e.call(n,i,i.depth)||0),delete i.children;return Ku(u,function(n){var r,u;t&&(r=n.children)&&r.sort(t),e&&(u=n.parent)&&(u.value+=n.value)}),a}var t=ti,r=Qu,e=ni;return n.sort=function(r){return arguments.length?(t=r,n):t},n.children=function(t){return arguments.length?(r=t,n):r},n.value=function(t){return arguments.length?(e=t,n):e},n.revalue=function(t){return e&&(Gu(t,function(n){n.children&&(n.value=0)}),Ku(t,function(t){var r;t.children||(t.value=+e.call(n,t,t.depth)||0),(r=t.parent)&&(r.value+=t.value)})),t},n},Bo.layout.partition=function(){function n(t,r,e,u){var i=t.children;if(t.x=r,t.y=t.depth*u,t.dx=e,t.dy=u,i&&(o=i.length)){var o,a,c,s=-1;for(e=t.value?e/t.value:0;++s<o;)n(a=i[s],r,c=a.value*e,u),r+=c}}function t(n){var r=n.children,e=0;if(r&&(u=r.length))for(var u,i=-1;++i<u;)e=Math.max(e,t(r[i]));return 1+e}function r(r,i){var o=e.call(this,r,i);return n(o[0],0,u[0],u[1]/t(o[0])),o}var e=Bo.layout.hierarchy(),u=[1,1];return r.size=function(n){return arguments.length?(u=n,r):u},Wu(r,e)},Bo.layout.pie=function(){function n(i){var o=i.map(function(r,e){return+t.call(n,r,e)}),a=+("function"==typeof e?e.apply(this,arguments):e),c=(("function"==typeof u?u.apply(this,arguments):u)-a)/Bo.sum(o),s=Bo.range(i.length);null!=r&&s.sort(r===ss?function(n,t){return o[t]-o[n]}:function(n,t){return r(i[n],i[t])});var l=[];return s.forEach(function(n){var t;l[n]={data:i[n],value:t=o[n],startAngle:a,endAngle:a+=t*c}}),l}var t=Number,r=ss,e=0,u=Ea;return n.value=function(r){return arguments.length?(t=r,n):t},n.sort=function(t){return arguments.length?(r=t,n):r},n.startAngle=function(t){return arguments.length?(e=t,n):e},n.endAngle=function(t){return arguments.length?(u=t,n):u},n};var ss={};Bo.layout.stack=function(){function n(a,c){var s=a.map(function(r,e){return t.call(n,r,e)}),l=s.map(function(t){return t.map(function(t,r){return[i.call(n,t,r),o.call(n,t,r)]})}),f=r.call(n,l,c);s=Bo.permute(s,f),l=Bo.permute(l,f);var h,g,p,v=e.call(n,l,c),d=s.length,m=s[0].length;for(g=0;m>g;++g)for(u.call(n,s[0][g],p=v[g],l[0][g][1]),h=1;d>h;++h)u.call(n,s[h][g],p+=l[h-1][g][1],l[h][g][1]);return a}var t=At,r=oi,e=ai,u=ii,i=ei,o=ui;return n.values=function(r){return arguments.length?(t=r,n):t},n.order=function(t){return arguments.length?(r="function"==typeof t?t:ls.get(t)||oi,n):r},n.offset=function(t){return arguments.length?(e="function"==typeof t?t:fs.get(t)||ai,n):e},n.x=function(t){return arguments.length?(i=t,n):i},n.y=function(t){return arguments.length?(o=t,n):o},n.out=function(t){return arguments.length?(u=t,n):u},n};var ls=Bo.map({"inside-out":function(n){var t,r,e=n.length,u=n.map(ci),i=n.map(si),o=Bo.range(e).sort(function(n,t){return u[n]-u[t]}),a=0,c=0,s=[],l=[];for(t=0;e>t;++t)r=o[t],c>a?(a+=i[r],s.push(r)):(c+=i[r],l.push(r));return l.reverse().concat(s)},reverse:function(n){return Bo.range(n.length).reverse()},"default":oi}),fs=Bo.map({silhouette:function(n){var t,r,e,u=n.length,i=n[0].length,o=[],a=0,c=[];for(r=0;i>r;++r){for(t=0,e=0;u>t;t++)e+=n[t][r][1];e>a&&(a=e),o.push(e)}for(r=0;i>r;++r)c[r]=(a-o[r])/2;return c},wiggle:function(n){var t,r,e,u,i,o,a,c,s,l=n.length,f=n[0],h=f.length,g=[];for(g[0]=c=s=0,r=1;h>r;++r){for(t=0,u=0;l>t;++t)u+=n[t][r][1];for(t=0,i=0,a=f[r][0]-f[r-1][0];l>t;++t){for(e=0,o=(n[t][r][1]-n[t][r-1][1])/(2*a);t>e;++e)o+=(n[e][r][1]-n[e][r-1][1])/a;i+=o*n[t][r][1]}g[r]=c-=u?i/u*a:0,s>c&&(s=c)}for(r=0;h>r;++r)g[r]-=s;return g},expand:function(n){var t,r,e,u=n.length,i=n[0].length,o=1/u,a=[];for(r=0;i>r;++r){for(t=0,e=0;u>t;t++)e+=n[t][r][1];if(e)for(t=0;u>t;t++)n[t][r][1]/=e;else for(t=0;u>t;t++)n[t][r][1]=o}for(r=0;i>r;++r)a[r]=0;return a},zero:ai});Bo.layout.histogram=function(){function n(n,i){for(var o,a,c=[],s=n.map(r,this),l=e.call(this,s,i),f=u.call(this,l,s,i),i=-1,h=s.length,g=f.length-1,p=t?1:1/h;++i<g;)o=c[i]=[],o.dx=f[i+1]-(o.x=f[i]),o.y=0;if(g>0)for(i=-1;++i<h;)a=s[i],a>=l[0]&&a<=l[1]&&(o=c[Bo.bisect(f,a,1,g)-1],o.y+=p,o.push(n[i]));return c}var t=!0,r=Number,e=gi,u=fi;return n.value=function(t){return arguments.length?(r=t,n):r},n.range=function(t){return arguments.length?(e=Et(t),n):e},n.bins=function(t){return arguments.length?(u="number"==typeof t?function(n){return hi(n,t)}:Et(t),n):u},n.frequency=function(r){return arguments.length?(t=!!r,n):t},n},Bo.layout.pack=function(){function n(n,i){var o=r.call(this,n,i),a=o[0],c=u[0],s=u[1],l=null==t?Math.sqrt:"function"==typeof t?t:function(){return t};if(a.x=a.y=0,Ku(a,function(n){n.r=+l(n.value)}),Ku(a,yi),e){var f=e*(t?1:Math.max(2*a.r/c,2*a.r/s))/2;Ku(a,function(n){n.r+=f}),Ku(a,yi),Ku(a,function(n){n.r-=f})}return _i(a,c/2,s/2,t?1:1/Math.max(2*a.r/c,2*a.r/s)),o}var t,r=Bo.layout.hierarchy().sort(pi),e=0,u=[1,1];return n.size=function(t){return arguments.length?(u=t,n):u},n.radius=function(r){return arguments.length?(t=null==r||"function"==typeof r?r:+r,n):t},n.padding=function(t){return arguments.length?(e=+t,n):e},Wu(n,r)},Bo.layout.tree=function(){function n(n,u){var l=o.call(this,n,u),f=l[0],h=t(f);if(Ku(h,r),h.parent.m=-h.z,Gu(h,e),s)Gu(f,i);else{var g=f,p=f,v=f;Gu(f,function(n){n.x<g.x&&(g=n),n.x>p.x&&(p=n),n.depth>v.depth&&(v=n)});var d=a(g,p)/2-g.x,m=c[0]/(p.x+a(p,g)/2+d),y=c[1]/(v.depth||1);Gu(f,function(n){n.x=(n.x+d)*m,n.y=n.depth*y})}return l}function t(n){for(var t,r={A:null,children:[n]},e=[r];null!=(t=e.pop());)for(var u,i=t.children,o=0,a=i.length;a>o;++o)e.push((i[o]=u={_:i[o],parent:t,children:(u=i[o].children)&&u.slice()||[],A:null,a:null,z:0,m:0,c:0,s:0,t:null,i:o}).a=u);return r.children[0]}function r(n){var t=n.children,r=n.parent.children,e=n.i?r[n.i-1]:null;if(t.length){Ai(n);var i=(t[0].z+t[t.length-1].z)/2;e?(n.z=e.z+a(n._,e._),n.m=n.z-i):n.z=i}else e&&(n.z=e.z+a(n._,e._));n.parent.A=u(n,e,n.parent.A||r[0])}function e(n){n._.x=n.z+n.parent.m,n.m+=n.parent.m}function u(n,t,r){if(t){for(var e,u=n,i=n,o=t,c=u.parent.children[0],s=u.m,l=i.m,f=o.m,h=c.m;o=ki(o),u=Si(u),o&&u;)c=Si(c),i=ki(i),i.a=n,e=o.z+f-u.z-s+a(o._,u._),e>0&&(Ei(Ci(o,n,r),n,e),s+=e,l+=e),f+=o.m,s+=u.m,h+=c.m,l+=i.m;o&&!ki(i)&&(i.t=o,i.m+=f-l),u&&!Si(c)&&(c.t=u,c.m+=s-h,r=n)}return r}function i(n){n.x*=c[0],n.y=n.depth*c[1]}var o=Bo.layout.hierarchy().sort(null).value(null),a=wi,c=[1,1],s=null;return n.separation=function(t){return arguments.length?(a=t,n):a},n.size=function(t){return arguments.length?(s=null==(c=t)?i:null,n):s?null:c},n.nodeSize=function(t){return arguments.length?(s=null==(c=t)?null:i,n):s?c:null},Wu(n,o)},Bo.layout.cluster=function(){function n(n,i){var o,a=t.call(this,n,i),c=a[0],s=0;Ku(c,function(n){var t=n.children;t&&t.length?(n.x=zi(t),n.y=Ni(t)):(n.x=o?s+=r(n,o):0,n.y=0,o=n)});var l=Li(c),f=Ti(c),h=l.x-r(l,f)/2,g=f.x+r(f,l)/2;return Ku(c,u?function(n){n.x=(n.x-c.x)*e[0],n.y=(c.y-n.y)*e[1]}:function(n){n.x=(n.x-h)/(g-h)*e[0],n.y=(1-(c.y?n.y/c.y:1))*e[1]}),a}var t=Bo.layout.hierarchy().sort(null).value(null),r=wi,e=[1,1],u=!1;return n.separation=function(t){return arguments.length?(r=t,n):r},n.size=function(t){return arguments.length?(u=null==(e=t),n):u?null:e},n.nodeSize=function(t){return arguments.length?(u=null!=(e=t),n):u?e:null},Wu(n,t)},Bo.layout.treemap=function(){function n(n,t){for(var r,e,u=-1,i=n.length;++u<i;)e=(r=n[u]).value*(0>t?0:t),r.area=isNaN(e)||0>=e?0:e}function t(r){var i=r.children;if(i&&i.length){var o,a,c,s=f(r),l=[],h=i.slice(),p=1/0,v="slice"===g?s.dx:"dice"===g?s.dy:"slice-dice"===g?1&r.depth?s.dy:s.dx:Math.min(s.dx,s.dy);for(n(h,s.dx*s.dy/r.value),l.area=0;(c=h.length)>0;)l.push(o=h[c-1]),l.area+=o.area,"squarify"!==g||(a=e(l,v))<=p?(h.pop(),p=a):(l.area-=l.pop().area,u(l,v,s,!1),v=Math.min(s.dx,s.dy),l.length=l.area=0,p=1/0);l.length&&(u(l,v,s,!0),l.length=l.area=0),i.forEach(t)}}function r(t){var e=t.children;if(e&&e.length){var i,o=f(t),a=e.slice(),c=[];for(n(a,o.dx*o.dy/t.value),c.area=0;i=a.pop();)c.push(i),c.area+=i.area,null!=i.z&&(u(c,i.z?o.dx:o.dy,o,!a.length),c.length=c.area=0);e.forEach(r)}}function e(n,t){for(var r,e=n.area,u=0,i=1/0,o=-1,a=n.length;++o<a;)(r=n[o].area)&&(i>r&&(i=r),r>u&&(u=r));return e*=e,t*=t,e?Math.max(t*u*p/e,e/(t*i*p)):1/0}function u(n,t,r,e){var u,i=-1,o=n.length,a=r.x,s=r.y,l=t?c(n.area/t):0;if(t==r.dx){for((e||l>r.dy)&&(l=r.dy);++i<o;)u=n[i],u.x=a,u.y=s,u.dy=l,a+=u.dx=Math.min(r.x+r.dx-a,l?c(u.area/l):0);u.z=!0,u.dx+=r.x+r.dx-a,r.y+=l,r.dy-=l}else{for((e||l>r.dx)&&(l=r.dx);++i<o;)u=n[i],u.x=a,u.y=s,u.dx=l,s+=u.dy=Math.min(r.y+r.dy-s,l?c(u.area/l):0);u.z=!1,u.dy+=r.y+r.dy-s,r.x+=l,r.dx-=l}}function i(e){var u=o||a(e),i=u[0];return i.x=0,i.y=0,i.dx=s[0],i.dy=s[1],o&&a.revalue(i),n([i],i.dx*i.dy/i.value),(o?r:t)(i),h&&(o=u),u}var o,a=Bo.layout.hierarchy(),c=Math.round,s=[1,1],l=null,f=qi,h=!1,g="squarify",p=.5*(1+Math.sqrt(5));return i.size=function(n){return arguments.length?(s=n,i):s},i.padding=function(n){function t(t){var r=n.call(i,t,t.depth);return null==r?qi(t):Ri(t,"number"==typeof r?[r,r,r,r]:r)}function r(t){return Ri(t,n)}if(!arguments.length)return l;var e;return f=null==(l=n)?qi:"function"==(e=typeof n)?t:"number"===e?(n=[n,n,n,n],r):r,i},i.round=function(n){return arguments.length?(c=n?Math.round:Number,i):c!=Number},i.sticky=function(n){return arguments.length?(h=n,o=null,i):h},i.ratio=function(n){return arguments.length?(p=n,i):p},i.mode=function(n){return arguments.length?(g=n+"",i):g},Wu(i,a)},Bo.random={normal:function(n,t){var r=arguments.length;return 2>r&&(t=1),1>r&&(n=0),function(){var r,e,u;do r=2*Math.random()-1,e=2*Math.random()-1,u=r*r+e*e;while(!u||u>1);return n+t*r*Math.sqrt(-2*Math.log(u)/u)}},logNormal:function(){var n=Bo.random.normal.apply(Bo,arguments);return function(){return Math.exp(n())}},bates:function(n){var t=Bo.random.irwinHall(n);return function(){return t()/n}},irwinHall:function(n){return function(){for(var t=0,r=0;n>r;r++)t+=Math.random();return t}}},Bo.scale={};var hs={floor:At,ceil:At};Bo.scale.linear=function(){return Oi([0,1],[0,1],du,!1)};var gs={s:1,g:1,p:1,r:1,e:1};Bo.scale.log=function(){return Ji(Bo.scale.linear().domain([0,1]),10,!0,[1,10])};var ps=Bo.format(".0e"),vs={floor:function(n){return-Math.ceil(-n)},ceil:function(n){return-Math.floor(-n)}};Bo.scale.pow=function(){return Wi(Bo.scale.linear(),1,[0,1])},Bo.scale.sqrt=function(){return Bo.scale.pow().exponent(.5)},Bo.scale.ordinal=function(){return Ki([],{t:"range",a:[[]]})},Bo.scale.category10=function(){return Bo.scale.ordinal().range(ds)},Bo.scale.category20=function(){return Bo.scale.ordinal().range(ms)},Bo.scale.category20b=function(){return Bo.scale.ordinal().range(ys)},Bo.scale.category20c=function(){return Bo.scale.ordinal().range(xs)};var ds=[2062260,16744206,2924588,14034728,9725885,9197131,14907330,8355711,12369186,1556175].map(mt),ms=[2062260,11454440,16744206,16759672,2924588,10018698,14034728,16750742,9725885,12955861,9197131,12885140,14907330,16234194,8355711,13092807,12369186,14408589,1556175,10410725].map(mt),ys=[3750777,5395619,7040719,10264286,6519097,9216594,11915115,13556636,9202993,12426809,15186514,15190932,8666169,11356490,14049643,15177372,8077683,10834324,13528509,14589654].map(mt),xs=[3244733,7057110,10406625,13032431,15095053,16616764,16625259,16634018,3253076,7652470,10607003,13101504,7695281,10394312,12369372,14342891,6513507,9868950,12434877,14277081].map(mt);Bo.scale.quantile=function(){return Qi([],[])},Bo.scale.quantize=function(){return no(0,1,[0,1])},Bo.scale.threshold=function(){return to([.5],[0,1])},Bo.scale.identity=function(){return ro([0,1])},Bo.svg={},Bo.svg.arc=function(){function n(){var n=t.apply(this,arguments),i=r.apply(this,arguments),o=e.apply(this,arguments)+Ms,a=u.apply(this,arguments)+Ms,c=(o>a&&(c=o,o=a,a=c),a-o),s=ka>c?"0":"1",l=Math.cos(o),f=Math.sin(o),h=Math.cos(a),g=Math.sin(a);
return c>=_s?n?"M0,"+i+"A"+i+","+i+" 0 1,1 0,"+-i+"A"+i+","+i+" 0 1,1 0,"+i+"M0,"+n+"A"+n+","+n+" 0 1,0 0,"+-n+"A"+n+","+n+" 0 1,0 0,"+n+"Z":"M0,"+i+"A"+i+","+i+" 0 1,1 0,"+-i+"A"+i+","+i+" 0 1,1 0,"+i+"Z":n?"M"+i*l+","+i*f+"A"+i+","+i+" 0 "+s+",1 "+i*h+","+i*g+"L"+n*h+","+n*g+"A"+n+","+n+" 0 "+s+",0 "+n*l+","+n*f+"Z":"M"+i*l+","+i*f+"A"+i+","+i+" 0 "+s+",1 "+i*h+","+i*g+"L0,0"+"Z"}var t=eo,r=uo,e=io,u=oo;return n.innerRadius=function(r){return arguments.length?(t=Et(r),n):t},n.outerRadius=function(t){return arguments.length?(r=Et(t),n):r},n.startAngle=function(t){return arguments.length?(e=Et(t),n):e},n.endAngle=function(t){return arguments.length?(u=Et(t),n):u},n.centroid=function(){var n=(t.apply(this,arguments)+r.apply(this,arguments))/2,i=(e.apply(this,arguments)+u.apply(this,arguments))/2+Ms;return[Math.cos(i)*n,Math.sin(i)*n]},n};var Ms=-Aa,_s=Ea-Ca;Bo.svg.line=function(){return ao(At)};var bs=Bo.map({linear:co,"linear-closed":so,step:lo,"step-before":fo,"step-after":ho,basis:xo,"basis-open":Mo,"basis-closed":_o,bundle:bo,cardinal:vo,"cardinal-open":go,"cardinal-closed":po,monotone:Co});bs.forEach(function(n,t){t.key=n,t.closed=/-closed$/.test(n)});var ws=[0,2/3,1/3,0],Ss=[0,1/3,2/3,0],ks=[0,1/6,2/3,1/6];Bo.svg.line.radial=function(){var n=ao(No);return n.radius=n.x,delete n.x,n.angle=n.y,delete n.y,n},fo.reverse=ho,ho.reverse=fo,Bo.svg.area=function(){return zo(At)},Bo.svg.area.radial=function(){var n=zo(No);return n.radius=n.x,delete n.x,n.innerRadius=n.x0,delete n.x0,n.outerRadius=n.x1,delete n.x1,n.angle=n.y,delete n.y,n.startAngle=n.y0,delete n.y0,n.endAngle=n.y1,delete n.y1,n},Bo.svg.chord=function(){function n(n,a){var c=t(this,i,n,a),s=t(this,o,n,a);return"M"+c.p0+e(c.r,c.p1,c.a1-c.a0)+(r(c,s)?u(c.r,c.p1,c.r,c.p0):u(c.r,c.p1,s.r,s.p0)+e(s.r,s.p1,s.a1-s.a0)+u(s.r,s.p1,c.r,c.p0))+"Z"}function t(n,t,r,e){var u=t.call(n,r,e),i=a.call(n,u,e),o=c.call(n,u,e)+Ms,l=s.call(n,u,e)+Ms;return{r:i,a0:o,a1:l,p0:[i*Math.cos(o),i*Math.sin(o)],p1:[i*Math.cos(l),i*Math.sin(l)]}}function r(n,t){return n.a0==t.a0&&n.a1==t.a1}function e(n,t,r){return"A"+n+","+n+" 0 "+ +(r>ka)+",1 "+t}function u(n,t,r,e){return"Q 0,0 "+e}var i=me,o=ye,a=Lo,c=io,s=oo;return n.radius=function(t){return arguments.length?(a=Et(t),n):a},n.source=function(t){return arguments.length?(i=Et(t),n):i},n.target=function(t){return arguments.length?(o=Et(t),n):o},n.startAngle=function(t){return arguments.length?(c=Et(t),n):c},n.endAngle=function(t){return arguments.length?(s=Et(t),n):s},n},Bo.svg.diagonal=function(){function n(n,u){var i=t.call(this,n,u),o=r.call(this,n,u),a=(i.y+o.y)/2,c=[i,{x:i.x,y:a},{x:o.x,y:a},o];return c=c.map(e),"M"+c[0]+"C"+c[1]+" "+c[2]+" "+c[3]}var t=me,r=ye,e=To;return n.source=function(r){return arguments.length?(t=Et(r),n):t},n.target=function(t){return arguments.length?(r=Et(t),n):r},n.projection=function(t){return arguments.length?(e=t,n):e},n},Bo.svg.diagonal.radial=function(){var n=Bo.svg.diagonal(),t=To,r=n.projection;return n.projection=function(n){return arguments.length?r(qo(t=n)):t},n},Bo.svg.symbol=function(){function n(n,e){return(Es.get(t.call(this,n,e))||Po)(r.call(this,n,e))}var t=Do,r=Ro;return n.type=function(r){return arguments.length?(t=Et(r),n):t},n.size=function(t){return arguments.length?(r=Et(t),n):r},n};var Es=Bo.map({circle:Po,cross:function(n){var t=Math.sqrt(n/5)/2;return"M"+-3*t+","+-t+"H"+-t+"V"+-3*t+"H"+t+"V"+-t+"H"+3*t+"V"+t+"H"+t+"V"+3*t+"H"+-t+"V"+t+"H"+-3*t+"Z"},diamond:function(n){var t=Math.sqrt(n/(2*zs)),r=t*zs;return"M0,"+-t+"L"+r+",0"+" 0,"+t+" "+-r+",0"+"Z"},square:function(n){var t=Math.sqrt(n)/2;return"M"+-t+","+-t+"L"+t+","+-t+" "+t+","+t+" "+-t+","+t+"Z"},"triangle-down":function(n){var t=Math.sqrt(n/Ns),r=t*Ns/2;return"M0,"+r+"L"+t+","+-r+" "+-t+","+-r+"Z"},"triangle-up":function(n){var t=Math.sqrt(n/Ns),r=t*Ns/2;return"M0,"+-r+"L"+t+","+r+" "+-t+","+r+"Z"}});Bo.svg.symbolTypes=Es.keys();var As,Cs,Ns=Math.sqrt(3),zs=Math.tan(30*za),Ls=[],Ts=0;Ls.call=ya.call,Ls.empty=ya.empty,Ls.node=ya.node,Ls.size=ya.size,Bo.transition=function(n){return arguments.length?As?n.transition():n:_a.transition()},Bo.transition.prototype=Ls,Ls.select=function(n){var t,r,e,u=this.id,i=[];n=b(n);for(var o=-1,a=this.length;++o<a;){i.push(t=[]);for(var c=this[o],s=-1,l=c.length;++s<l;)(e=c[s])&&(r=n.call(e,e.__data__,s,o))?("__data__"in e&&(r.__data__=e.__data__),Fo(r,s,u,e.__transition__[u]),t.push(r)):t.push(null)}return Uo(i,u)},Ls.selectAll=function(n){var t,r,e,u,i,o=this.id,a=[];n=w(n);for(var c=-1,s=this.length;++c<s;)for(var l=this[c],f=-1,h=l.length;++f<h;)if(e=l[f]){i=e.__transition__[o],r=n.call(e,e.__data__,f,c),a.push(t=[]);for(var g=-1,p=r.length;++g<p;)(u=r[g])&&Fo(u,g,o,i),t.push(u)}return Uo(a,o)},Ls.filter=function(n){var t,r,e,u=[];"function"!=typeof n&&(n=R(n));for(var i=0,o=this.length;o>i;i++){u.push(t=[]);for(var r=this[i],a=0,c=r.length;c>a;a++)(e=r[a])&&n.call(e,e.__data__,a,i)&&t.push(e)}return Uo(u,this.id)},Ls.tween=function(n,t){var r=this.id;return arguments.length<2?this.node().__transition__[r].tween.get(n):P(this,null==t?function(t){t.__transition__[r].tween.remove(n)}:function(e){e.__transition__[r].tween.set(n,t)})},Ls.attr=function(n,t){function r(){this.removeAttribute(a)}function e(){this.removeAttributeNS(a.space,a.local)}function u(n){return null==n?r:(n+="",function(){var t,r=this.getAttribute(a);return r!==n&&(t=o(r,n),function(n){this.setAttribute(a,t(n))})})}function i(n){return null==n?e:(n+="",function(){var t,r=this.getAttributeNS(a.space,a.local);return r!==n&&(t=o(r,n),function(n){this.setAttributeNS(a.space,a.local,t(n))})})}if(arguments.length<2){for(t in n)this.attr(t,n[t]);return this}var o="transform"==n?Hu:du,a=Bo.ns.qualify(n);return jo(this,"attr."+n,t,a.local?i:u)},Ls.attrTween=function(n,t){function r(n,r){var e=t.call(this,n,r,this.getAttribute(u));return e&&function(n){this.setAttribute(u,e(n))}}function e(n,r){var e=t.call(this,n,r,this.getAttributeNS(u.space,u.local));return e&&function(n){this.setAttributeNS(u.space,u.local,e(n))}}var u=Bo.ns.qualify(n);return this.tween("attr."+n,u.local?e:r)},Ls.style=function(n,t,r){function e(){this.style.removeProperty(n)}function u(t){return null==t?e:(t+="",function(){var e,u=Qo.getComputedStyle(this,null).getPropertyValue(n);return u!==t&&(e=du(u,t),function(t){this.style.setProperty(n,e(t),r)})})}var i=arguments.length;if(3>i){if("string"!=typeof n){2>i&&(t="");for(r in n)this.style(r,n[r],t);return this}r=""}return jo(this,"style."+n,t,u)},Ls.styleTween=function(n,t,r){function e(e,u){var i=t.call(this,e,u,Qo.getComputedStyle(this,null).getPropertyValue(n));return i&&function(t){this.style.setProperty(n,i(t),r)}}return arguments.length<3&&(r=""),this.tween("style."+n,e)},Ls.text=function(n){return jo(this,"text",n,Ho)},Ls.remove=function(){return this.each("end.transition",function(){var n;this.__transition__.count<2&&(n=this.parentNode)&&n.removeChild(this)})},Ls.ease=function(n){var t=this.id;return arguments.length<1?this.node().__transition__[t].ease:("function"!=typeof n&&(n=Bo.ease.apply(Bo,arguments)),P(this,function(r){r.__transition__[t].ease=n}))},Ls.delay=function(n){var t=this.id;return arguments.length<1?this.node().__transition__[t].delay:P(this,"function"==typeof n?function(r,e,u){r.__transition__[t].delay=+n.call(r,r.__data__,e,u)}:(n=+n,function(r){r.__transition__[t].delay=n}))},Ls.duration=function(n){var t=this.id;return arguments.length<1?this.node().__transition__[t].duration:P(this,"function"==typeof n?function(r,e,u){r.__transition__[t].duration=Math.max(1,n.call(r,r.__data__,e,u))}:(n=Math.max(1,n),function(r){r.__transition__[t].duration=n}))},Ls.each=function(n,t){var r=this.id;if(arguments.length<2){var e=Cs,u=As;As=r,P(this,function(t,e,u){Cs=t.__transition__[r],n.call(t,t.__data__,e,u)}),Cs=e,As=u}else P(this,function(e){var u=e.__transition__[r];(u.event||(u.event=Bo.dispatch("start","end"))).on(n,t)});return this},Ls.transition=function(){for(var n,t,r,e,u=this.id,i=++Ts,o=[],a=0,c=this.length;c>a;a++){o.push(n=[]);for(var t=this[a],s=0,l=t.length;l>s;s++)(r=t[s])&&(e=Object.create(r.__transition__[u]),e.delay+=e.duration,Fo(r,s,i,e)),n.push(r)}return Uo(o,i)},Bo.svg.axis=function(){function n(n){n.each(function(){var n,s=Bo.select(this),l=this.__chart__||r,f=this.__chart__=r.copy(),h=null==c?f.ticks?f.ticks.apply(f,a):f.domain():c,g=null==t?f.tickFormat?f.tickFormat.apply(f,a):At:t,p=s.selectAll(".tick").data(h,f),v=p.enter().insert("g",".domain").attr("class","tick").style("opacity",Ca),d=Bo.transition(p.exit()).style("opacity",Ca).remove(),m=Bo.transition(p.order()).style("opacity",1),y=Pi(f),x=s.selectAll(".domain").data([0]),M=(x.enter().append("path").attr("class","domain"),Bo.transition(x));v.append("line"),v.append("text");var _=v.select("line"),b=m.select("line"),w=p.select("text").text(g),S=v.select("text"),k=m.select("text");switch(e){case"bottom":n=Oo,_.attr("y2",u),S.attr("y",Math.max(u,0)+o),b.attr("x2",0).attr("y2",u),k.attr("x",0).attr("y",Math.max(u,0)+o),w.attr("dy",".71em").style("text-anchor","middle"),M.attr("d","M"+y[0]+","+i+"V0H"+y[1]+"V"+i);break;case"top":n=Oo,_.attr("y2",-u),S.attr("y",-(Math.max(u,0)+o)),b.attr("x2",0).attr("y2",-u),k.attr("x",0).attr("y",-(Math.max(u,0)+o)),w.attr("dy","0em").style("text-anchor","middle"),M.attr("d","M"+y[0]+","+-i+"V0H"+y[1]+"V"+-i);break;case"left":n=Io,_.attr("x2",-u),S.attr("x",-(Math.max(u,0)+o)),b.attr("x2",-u).attr("y2",0),k.attr("x",-(Math.max(u,0)+o)).attr("y",0),w.attr("dy",".32em").style("text-anchor","end"),M.attr("d","M"+-i+","+y[0]+"H0V"+y[1]+"H"+-i);break;case"right":n=Io,_.attr("x2",u),S.attr("x",Math.max(u,0)+o),b.attr("x2",u).attr("y2",0),k.attr("x",Math.max(u,0)+o).attr("y",0),w.attr("dy",".32em").style("text-anchor","start"),M.attr("d","M"+i+","+y[0]+"H0V"+y[1]+"H"+i)}if(f.rangeBand){var E=f,A=E.rangeBand()/2;l=f=function(n){return E(n)+A}}else l.rangeBand?l=f:d.call(n,f);v.call(n,l),m.call(n,f)})}var t,r=Bo.scale.linear(),e=qs,u=6,i=6,o=3,a=[10],c=null;return n.scale=function(t){return arguments.length?(r=t,n):r},n.orient=function(t){return arguments.length?(e=t in Rs?t+"":qs,n):e},n.ticks=function(){return arguments.length?(a=arguments,n):a},n.tickValues=function(t){return arguments.length?(c=t,n):c},n.tickFormat=function(r){return arguments.length?(t=r,n):t},n.tickSize=function(t){var r=arguments.length;return r?(u=+t,i=+arguments[r-1],n):u},n.innerTickSize=function(t){return arguments.length?(u=+t,n):u},n.outerTickSize=function(t){return arguments.length?(i=+t,n):i},n.tickPadding=function(t){return arguments.length?(o=+t,n):o},n.tickSubdivide=function(){return arguments.length&&n},n};var qs="bottom",Rs={top:1,right:1,bottom:1,left:1};Bo.svg.brush=function(){function n(i){i.each(function(){var i=Bo.select(this).style("pointer-events","all").style("-webkit-tap-highlight-color","rgba(0,0,0,0)").on("mousedown.brush",u).on("touchstart.brush",u),o=i.selectAll(".background").data([0]);o.enter().append("rect").attr("class","background").style("visibility","hidden").style("cursor","crosshair"),i.selectAll(".extent").data([0]).enter().append("rect").attr("class","extent").style("cursor","move");var a=i.selectAll(".resize").data(p,At);a.exit().remove(),a.enter().append("g").attr("class",function(n){return"resize "+n}).style("cursor",function(n){return Ds[n]}).append("rect").attr("x",function(n){return/[ew]$/.test(n)?-3:null}).attr("y",function(n){return/^[ns]/.test(n)?-3:null}).attr("width",6).attr("height",6).style("visibility","hidden"),a.style("display",n.empty()?"none":null);var l,f=Bo.transition(i),h=Bo.transition(o);c&&(l=Pi(c),h.attr("x",l[0]).attr("width",l[1]-l[0]),r(f)),s&&(l=Pi(s),h.attr("y",l[0]).attr("height",l[1]-l[0]),e(f)),t(f)})}function t(n){n.selectAll(".resize").attr("transform",function(n){return"translate("+l[+/e$/.test(n)]+","+f[+/^s/.test(n)]+")"})}function r(n){n.select(".extent").attr("x",l[0]),n.selectAll(".extent,.n>rect,.s>rect").attr("width",l[1]-l[0])}function e(n){n.select(".extent").attr("y",f[0]),n.selectAll(".extent,.e>rect,.w>rect").attr("height",f[1]-f[0])}function u(){function u(){32==Bo.event.keyCode&&(C||(x=null,z[0]-=l[1],z[1]-=f[1],C=2),y())}function p(){32==Bo.event.keyCode&&2==C&&(z[0]+=l[1],z[1]+=f[1],C=0,y())}function v(){var n=Bo.mouse(_),u=!1;M&&(n[0]+=M[0],n[1]+=M[1]),C||(Bo.event.altKey?(x||(x=[(l[0]+l[1])/2,(f[0]+f[1])/2]),z[0]=l[+(n[0]<x[0])],z[1]=f[+(n[1]<x[1])]):x=null),E&&d(n,c,0)&&(r(S),u=!0),A&&d(n,s,1)&&(e(S),u=!0),u&&(t(S),w({type:"brush",mode:C?"move":"resize"}))}function d(n,t,r){var e,u,a=Pi(t),c=a[0],s=a[1],p=z[r],v=r?f:l,d=v[1]-v[0];return C&&(c-=p,s-=d+p),e=(r?g:h)?Math.max(c,Math.min(s,n[r])):n[r],C?u=(e+=p)+d:(x&&(p=Math.max(c,Math.min(s,2*x[r]-e))),e>p?(u=e,e=p):u=p),v[0]!=e||v[1]!=u?(r?o=null:i=null,v[0]=e,v[1]=u,!0):void 0}function m(){v(),S.style("pointer-events","all").selectAll(".resize").style("display",n.empty()?"none":null),Bo.select("body").style("cursor",null),L.on("mousemove.brush",null).on("mouseup.brush",null).on("touchmove.brush",null).on("touchend.brush",null).on("keydown.brush",null).on("keyup.brush",null),N(),w({type:"brushend"})}var x,M,_=this,b=Bo.select(Bo.event.target),w=a.of(_,arguments),S=Bo.select(_),k=b.datum(),E=!/^(n|s)$/.test(k)&&c,A=!/^(e|w)$/.test(k)&&s,C=b.classed("extent"),N=Y(),z=Bo.mouse(_),L=Bo.select(Qo).on("keydown.brush",u).on("keyup.brush",p);if(Bo.event.changedTouches?L.on("touchmove.brush",v).on("touchend.brush",m):L.on("mousemove.brush",v).on("mouseup.brush",m),S.interrupt().selectAll("*").interrupt(),C)z[0]=l[0]-z[0],z[1]=f[0]-z[1];else if(k){var T=+/w$/.test(k),q=+/^n/.test(k);M=[l[1-T]-z[0],f[1-q]-z[1]],z[0]=l[T],z[1]=f[q]}else Bo.event.altKey&&(x=z.slice());S.style("pointer-events","none").selectAll(".resize").style("display",null),Bo.select("body").style("cursor",b.style("cursor")),w({type:"brushstart"}),v()}var i,o,a=M(n,"brushstart","brush","brushend"),c=null,s=null,l=[0,0],f=[0,0],h=!0,g=!0,p=Ps[0];return n.event=function(n){n.each(function(){var n=a.of(this,arguments),t={x:l,y:f,i:i,j:o},r=this.__chart__||t;this.__chart__=t,As?Bo.select(this).transition().each("start.brush",function(){i=r.i,o=r.j,l=r.x,f=r.y,n({type:"brushstart"})}).tween("brush:brush",function(){var r=mu(l,t.x),e=mu(f,t.y);return i=o=null,function(u){l=t.x=r(u),f=t.y=e(u),n({type:"brush",mode:"resize"})}}).each("end.brush",function(){i=t.i,o=t.j,n({type:"brush",mode:"resize"}),n({type:"brushend"})}):(n({type:"brushstart"}),n({type:"brush",mode:"resize"}),n({type:"brushend"}))})},n.x=function(t){return arguments.length?(c=t,p=Ps[!c<<1|!s],n):c},n.y=function(t){return arguments.length?(s=t,p=Ps[!c<<1|!s],n):s},n.clamp=function(t){return arguments.length?(c&&s?(h=!!t[0],g=!!t[1]):c?h=!!t:s&&(g=!!t),n):c&&s?[h,g]:c?h:s?g:null},n.extent=function(t){var r,e,u,a,h;return arguments.length?(c&&(r=t[0],e=t[1],s&&(r=r[0],e=e[0]),i=[r,e],c.invert&&(r=c(r),e=c(e)),r>e&&(h=r,r=e,e=h),(r!=l[0]||e!=l[1])&&(l=[r,e])),s&&(u=t[0],a=t[1],c&&(u=u[1],a=a[1]),o=[u,a],s.invert&&(u=s(u),a=s(a)),u>a&&(h=u,u=a,a=h),(u!=f[0]||a!=f[1])&&(f=[u,a])),n):(c&&(i?(r=i[0],e=i[1]):(r=l[0],e=l[1],c.invert&&(r=c.invert(r),e=c.invert(e)),r>e&&(h=r,r=e,e=h))),s&&(o?(u=o[0],a=o[1]):(u=f[0],a=f[1],s.invert&&(u=s.invert(u),a=s.invert(a)),u>a&&(h=u,u=a,a=h))),c&&s?[[r,u],[e,a]]:c?[r,e]:s&&[u,a])},n.clear=function(){return n.empty()||(l=[0,0],f=[0,0],i=o=null),n},n.empty=function(){return!!c&&l[0]==l[1]||!!s&&f[0]==f[1]},Bo.rebind(n,a,"on")};var Ds={n:"ns-resize",e:"ew-resize",s:"ns-resize",w:"ew-resize",nw:"nwse-resize",ne:"nesw-resize",se:"nwse-resize",sw:"nesw-resize"},Ps=[["n","e","s","w","nw","ne","se","sw"],["e","w"],["n","s"],[]],Us=rc.format=cc.timeFormat,js=Us.utc,Hs=js("%Y-%m-%dT%H:%M:%S.%LZ");Us.iso=Date.prototype.toISOString&&+new Date("2000-01-01T00:00:00.000Z")?Yo:Hs,Yo.parse=function(n){var t=new Date(n);return isNaN(t)?null:t},Yo.toString=Hs.toString,rc.second=Ht(function(n){return new ec(1e3*Math.floor(n/1e3))},function(n,t){n.setTime(n.getTime()+1e3*Math.floor(t))},function(n){return n.getSeconds()}),rc.seconds=rc.second.range,rc.seconds.utc=rc.second.utc.range,rc.minute=Ht(function(n){return new ec(6e4*Math.floor(n/6e4))},function(n,t){n.setTime(n.getTime()+6e4*Math.floor(t))},function(n){return n.getMinutes()}),rc.minutes=rc.minute.range,rc.minutes.utc=rc.minute.utc.range,rc.hour=Ht(function(n){var t=n.getTimezoneOffset()/60;return new ec(36e5*(Math.floor(n/36e5-t)+t))},function(n,t){n.setTime(n.getTime()+36e5*Math.floor(t))},function(n){return n.getHours()}),rc.hours=rc.hour.range,rc.hours.utc=rc.hour.utc.range,rc.month=Ht(function(n){return n=rc.day(n),n.setDate(1),n},function(n,t){n.setMonth(n.getMonth()+t)},function(n){return n.getMonth()}),rc.months=rc.month.range,rc.months.utc=rc.month.utc.range;var Fs=[1e3,5e3,15e3,3e4,6e4,3e5,9e5,18e5,36e5,108e5,216e5,432e5,864e5,1728e5,6048e5,2592e6,7776e6,31536e6],Os=[[rc.second,1],[rc.second,5],[rc.second,15],[rc.second,30],[rc.minute,1],[rc.minute,5],[rc.minute,15],[rc.minute,30],[rc.hour,1],[rc.hour,3],[rc.hour,6],[rc.hour,12],[rc.day,1],[rc.day,2],[rc.week,1],[rc.month,1],[rc.month,3],[rc.year,1]],Is=Us.multi([[".%L",function(n){return n.getMilliseconds()}],[":%S",function(n){return n.getSeconds()}],["%I:%M",function(n){return n.getMinutes()}],["%I %p",function(n){return n.getHours()}],["%a %d",function(n){return n.getDay()&&1!=n.getDate()}],["%b %d",function(n){return 1!=n.getDate()}],["%B",function(n){return n.getMonth()}],["%Y",Ar]]),Ys={range:function(n,t,r){return Bo.range(Math.ceil(n/r)*r,+t,r).map(Vo)},floor:At,ceil:At};Os.year=rc.year,rc.scale=function(){return Zo(Bo.scale.linear(),Os,Is)};var Zs=Os.map(function(n){return[n[0].utc,n[1]]}),Vs=js.multi([[".%L",function(n){return n.getUTCMilliseconds()}],[":%S",function(n){return n.getUTCSeconds()}],["%I:%M",function(n){return n.getUTCMinutes()}],["%I %p",function(n){return n.getUTCHours()}],["%a %d",function(n){return n.getUTCDay()&&1!=n.getUTCDate()}],["%b %d",function(n){return 1!=n.getUTCDate()}],["%B",function(n){return n.getUTCMonth()}],["%Y",Ar]]);Zs.year=rc.year.utc,rc.scale.utc=function(){return Zo(Bo.scale.linear(),Zs,Vs)},Bo.text=Ct(function(n){return n.responseText}),Bo.json=function(n,t){return Nt(n,"application/json",$o,t)},Bo.html=function(n,t){return Nt(n,"text/html",Xo,t)},Bo.xml=Ct(function(n){return n.responseXML}),"function"==typeof define&&define.amd?define(Bo):"object"==typeof module&&module.exports?module.exports=Bo:this.d3=Bo}();
/*
 AngularJS v1.2.17
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(P,V,s){'use strict';function u(b){return function(){var a=arguments[0],c,a="["+(b?b+":":"")+a+"] http://errors.angularjs.org/1.2.17/"+(b?b+"/":"")+a;for(c=1;c<arguments.length;c++)a=a+(1==c?"?":"&")+"p"+(c-1)+"="+encodeURIComponent("function"==typeof arguments[c]?arguments[c].toString().replace(/ \{[\s\S]*$/,""):"undefined"==typeof arguments[c]?"undefined":"string"!=typeof arguments[c]?JSON.stringify(arguments[c]):arguments[c]);return Error(a)}}function db(b){if(null==b||Da(b))return!1;
var a=b.length;return 1===b.nodeType&&a?!0:C(b)||K(b)||0===a||"number"===typeof a&&0<a&&a-1 in b}function q(b,a,c){var d;if(b)if(Q(b))for(d in b)"prototype"==d||("length"==d||"name"==d||b.hasOwnProperty&&!b.hasOwnProperty(d))||a.call(c,b[d],d);else if(b.forEach&&b.forEach!==q)b.forEach(a,c);else if(db(b))for(d=0;d<b.length;d++)a.call(c,b[d],d);else for(d in b)b.hasOwnProperty(d)&&a.call(c,b[d],d);return b}function Wb(b){var a=[],c;for(c in b)b.hasOwnProperty(c)&&a.push(c);return a.sort()}function Sc(b,
a,c){for(var d=Wb(b),e=0;e<d.length;e++)a.call(c,b[d[e]],d[e]);return d}function Xb(b){return function(a,c){b(c,a)}}function eb(){for(var b=ja.length,a;b;){b--;a=ja[b].charCodeAt(0);if(57==a)return ja[b]="A",ja.join("");if(90==a)ja[b]="0";else return ja[b]=String.fromCharCode(a+1),ja.join("")}ja.unshift("0");return ja.join("")}function Yb(b,a){a?b.$$hashKey=a:delete b.$$hashKey}function E(b){var a=b.$$hashKey;q(arguments,function(a){a!==b&&q(a,function(a,c){b[c]=a})});Yb(b,a);return b}function Y(b){return parseInt(b,
10)}function Zb(b,a){return E(new (E(function(){},{prototype:b})),a)}function w(){}function Ea(b){return b}function aa(b){return function(){return b}}function H(b){return"undefined"===typeof b}function z(b){return"undefined"!==typeof b}function U(b){return null!=b&&"object"===typeof b}function C(b){return"string"===typeof b}function zb(b){return"number"===typeof b}function Ma(b){return"[object Date]"===wa.call(b)}function K(b){return"[object Array]"===wa.call(b)}function Q(b){return"function"===typeof b}
function fb(b){return"[object RegExp]"===wa.call(b)}function Da(b){return b&&b.document&&b.location&&b.alert&&b.setInterval}function Tc(b){return!(!b||!(b.nodeName||b.prop&&b.attr&&b.find))}function Uc(b,a,c){var d=[];q(b,function(b,f,g){d.push(a.call(c,b,f,g))});return d}function Na(b,a){if(b.indexOf)return b.indexOf(a);for(var c=0;c<b.length;c++)if(a===b[c])return c;return-1}function Oa(b,a){var c=Na(b,a);0<=c&&b.splice(c,1);return a}function Fa(b,a,c,d){if(Da(b)||b&&b.$evalAsync&&b.$watch)throw Pa("cpws");
if(a){if(b===a)throw Pa("cpi");c=c||[];d=d||[];if(U(b)){var e=Na(c,b);if(-1!==e)return d[e];c.push(b);d.push(a)}if(K(b))for(var f=a.length=0;f<b.length;f++)e=Fa(b[f],null,c,d),U(b[f])&&(c.push(b[f]),d.push(e)),a.push(e);else{var g=a.$$hashKey;q(a,function(b,c){delete a[c]});for(f in b)e=Fa(b[f],null,c,d),U(b[f])&&(c.push(b[f]),d.push(e)),a[f]=e;Yb(a,g)}}else(a=b)&&(K(b)?a=Fa(b,[],c,d):Ma(b)?a=new Date(b.getTime()):fb(b)?a=RegExp(b.source):U(b)&&(a=Fa(b,{},c,d)));return a}function ka(b,a){if(K(b)){a=
a||[];for(var c=0;c<b.length;c++)a[c]=b[c]}else if(U(b))for(c in a=a||{},b)!Ab.call(b,c)||"$"===c.charAt(0)&&"$"===c.charAt(1)||(a[c]=b[c]);return a||b}function xa(b,a){if(b===a)return!0;if(null===b||null===a)return!1;if(b!==b&&a!==a)return!0;var c=typeof b,d;if(c==typeof a&&"object"==c)if(K(b)){if(!K(a))return!1;if((c=b.length)==a.length){for(d=0;d<c;d++)if(!xa(b[d],a[d]))return!1;return!0}}else{if(Ma(b))return Ma(a)&&b.getTime()==a.getTime();if(fb(b)&&fb(a))return b.toString()==a.toString();if(b&&
b.$evalAsync&&b.$watch||a&&a.$evalAsync&&a.$watch||Da(b)||Da(a)||K(a))return!1;c={};for(d in b)if("$"!==d.charAt(0)&&!Q(b[d])){if(!xa(b[d],a[d]))return!1;c[d]=!0}for(d in a)if(!c.hasOwnProperty(d)&&"$"!==d.charAt(0)&&a[d]!==s&&!Q(a[d]))return!1;return!0}return!1}function $b(){return V.securityPolicy&&V.securityPolicy.isActive||V.querySelector&&!(!V.querySelector("[ng-csp]")&&!V.querySelector("[data-ng-csp]"))}function gb(b,a){var c=2<arguments.length?ya.call(arguments,2):[];return!Q(a)||a instanceof
RegExp?a:c.length?function(){return arguments.length?a.apply(b,c.concat(ya.call(arguments,0))):a.apply(b,c)}:function(){return arguments.length?a.apply(b,arguments):a.call(b)}}function Vc(b,a){var c=a;"string"===typeof b&&"$"===b.charAt(0)?c=s:Da(a)?c="$WINDOW":a&&V===a?c="$DOCUMENT":a&&(a.$evalAsync&&a.$watch)&&(c="$SCOPE");return c}function qa(b,a){return"undefined"===typeof b?s:JSON.stringify(b,Vc,a?"  ":null)}function ac(b){return C(b)?JSON.parse(b):b}function Qa(b){"function"===typeof b?b=!0:
b&&0!==b.length?(b=J(""+b),b=!("f"==b||"0"==b||"false"==b||"no"==b||"n"==b||"[]"==b)):b=!1;return b}function ha(b){b=y(b).clone();try{b.empty()}catch(a){}var c=y("<div>").append(b).html();try{return 3===b[0].nodeType?J(c):c.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/,function(a,b){return"<"+J(b)})}catch(d){return J(c)}}function bc(b){try{return decodeURIComponent(b)}catch(a){}}function cc(b){var a={},c,d;q((b||"").split("&"),function(b){b&&(c=b.split("="),d=bc(c[0]),z(d)&&(b=z(c[1])?bc(c[1]):!0,
a[d]?K(a[d])?a[d].push(b):a[d]=[a[d],b]:a[d]=b))});return a}function Bb(b){var a=[];q(b,function(b,d){K(b)?q(b,function(b){a.push(za(d,!0)+(!0===b?"":"="+za(b,!0)))}):a.push(za(d,!0)+(!0===b?"":"="+za(b,!0)))});return a.length?a.join("&"):""}function hb(b){return za(b,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}function za(b,a){return encodeURIComponent(b).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,a?"%20":"+")}function Wc(b,
a){function c(a){a&&d.push(a)}var d=[b],e,f,g=["ng:app","ng-app","x-ng-app","data-ng-app"],h=/\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;q(g,function(a){g[a]=!0;c(V.getElementById(a));a=a.replace(":","\\:");b.querySelectorAll&&(q(b.querySelectorAll("."+a),c),q(b.querySelectorAll("."+a+"\\:"),c),q(b.querySelectorAll("["+a+"]"),c))});q(d,function(a){if(!e){var b=h.exec(" "+a.className+" ");b?(e=a,f=(b[2]||"").replace(/\s+/g,",")):q(a.attributes,function(b){!e&&g[b.name]&&(e=a,f=b.value)})}});e&&a(e,f?[f]:[])}
function dc(b,a){var c=function(){b=y(b);if(b.injector()){var c=b[0]===V?"document":ha(b);throw Pa("btstrpd",c);}a=a||[];a.unshift(["$provide",function(a){a.value("$rootElement",b)}]);a.unshift("ng");c=ec(a);c.invoke(["$rootScope","$rootElement","$compile","$injector","$animate",function(a,b,c,d,e){a.$apply(function(){b.data("$injector",d);c(b)(a)})}]);return c},d=/^NG_DEFER_BOOTSTRAP!/;if(P&&!d.test(P.name))return c();P.name=P.name.replace(d,"");Ra.resumeBootstrap=function(b){q(b,function(b){a.push(b)});
c()}}function ib(b,a){a=a||"_";return b.replace(Xc,function(b,d){return(d?a:"")+b.toLowerCase()})}function Cb(b,a,c){if(!b)throw Pa("areq",a||"?",c||"required");return b}function Sa(b,a,c){c&&K(b)&&(b=b[b.length-1]);Cb(Q(b),a,"not a function, got "+(b&&"object"==typeof b?b.constructor.name||"Object":typeof b));return b}function Aa(b,a){if("hasOwnProperty"===b)throw Pa("badname",a);}function fc(b,a,c){if(!a)return b;a=a.split(".");for(var d,e=b,f=a.length,g=0;g<f;g++)d=a[g],b&&(b=(e=b)[d]);return!c&&
Q(b)?gb(e,b):b}function Db(b){var a=b[0];b=b[b.length-1];if(a===b)return y(a);var c=[a];do{a=a.nextSibling;if(!a)break;c.push(a)}while(a!==b);return y(c)}function Yc(b){var a=u("$injector"),c=u("ng");b=b.angular||(b.angular={});b.$$minErr=b.$$minErr||u;return b.module||(b.module=function(){var b={};return function(e,f,g){if("hasOwnProperty"===e)throw c("badname","module");f&&b.hasOwnProperty(e)&&(b[e]=null);return b[e]||(b[e]=function(){function b(a,d,e){return function(){c[e||"push"]([a,d,arguments]);
return n}}if(!f)throw a("nomod",e);var c=[],d=[],l=b("$injector","invoke"),n={_invokeQueue:c,_runBlocks:d,requires:f,name:e,provider:b("$provide","provider"),factory:b("$provide","factory"),service:b("$provide","service"),value:b("$provide","value"),constant:b("$provide","constant","unshift"),animation:b("$animateProvider","register"),filter:b("$filterProvider","register"),controller:b("$controllerProvider","register"),directive:b("$compileProvider","directive"),config:l,run:function(a){d.push(a);
return this}};g&&l(g);return n}())}}())}function Zc(b){E(b,{bootstrap:dc,copy:Fa,extend:E,equals:xa,element:y,forEach:q,injector:ec,noop:w,bind:gb,toJson:qa,fromJson:ac,identity:Ea,isUndefined:H,isDefined:z,isString:C,isFunction:Q,isObject:U,isNumber:zb,isElement:Tc,isArray:K,version:$c,isDate:Ma,lowercase:J,uppercase:Ga,callbacks:{counter:0},$$minErr:u,$$csp:$b});Ta=Yc(P);try{Ta("ngLocale")}catch(a){Ta("ngLocale",[]).provider("$locale",ad)}Ta("ng",["ngLocale"],["$provide",function(a){a.provider({$$sanitizeUri:bd});
a.provider("$compile",gc).directive({a:cd,input:hc,textarea:hc,form:dd,script:ed,select:fd,style:gd,option:hd,ngBind:id,ngBindHtml:jd,ngBindTemplate:kd,ngClass:ld,ngClassEven:md,ngClassOdd:nd,ngCloak:od,ngController:pd,ngForm:qd,ngHide:rd,ngIf:sd,ngInclude:td,ngInit:ud,ngNonBindable:vd,ngPluralize:wd,ngRepeat:xd,ngShow:yd,ngStyle:zd,ngSwitch:Ad,ngSwitchWhen:Bd,ngSwitchDefault:Cd,ngOptions:Dd,ngTransclude:Ed,ngModel:Fd,ngList:Gd,ngChange:Hd,required:ic,ngRequired:ic,ngValue:Id}).directive({ngInclude:Jd}).directive(Eb).directive(jc);
a.provider({$anchorScroll:Kd,$animate:Ld,$browser:Md,$cacheFactory:Nd,$controller:Od,$document:Pd,$exceptionHandler:Qd,$filter:kc,$interpolate:Rd,$interval:Sd,$http:Td,$httpBackend:Ud,$location:Vd,$log:Wd,$parse:Xd,$rootScope:Yd,$q:Zd,$sce:$d,$sceDelegate:ae,$sniffer:be,$templateCache:ce,$timeout:de,$window:ee,$$rAF:fe,$$asyncCallback:ge})}])}function Ua(b){return b.replace(he,function(a,b,d,e){return e?d.toUpperCase():d}).replace(ie,"Moz$1")}function Fb(b,a,c,d){function e(b){var e=c&&b?[this.filter(b)]:
[this],m=a,k,l,n,p,r,A;if(!d||null!=b)for(;e.length;)for(k=e.shift(),l=0,n=k.length;l<n;l++)for(p=y(k[l]),m?p.triggerHandler("$destroy"):m=!m,r=0,p=(A=p.children()).length;r<p;r++)e.push(Ba(A[r]));return f.apply(this,arguments)}var f=Ba.fn[b],f=f.$original||f;e.$original=f;Ba.fn[b]=e}function M(b){if(b instanceof M)return b;C(b)&&(b=ba(b));if(!(this instanceof M)){if(C(b)&&"<"!=b.charAt(0))throw Gb("nosel");return new M(b)}if(C(b)){var a=b;b=V;var c;if(c=je.exec(a))b=[b.createElement(c[1])];else{var d=
b,e;b=d.createDocumentFragment();c=[];if(Hb.test(a)){d=b.appendChild(d.createElement("div"));e=(ke.exec(a)||["",""])[1].toLowerCase();e=da[e]||da._default;d.innerHTML="<div>&#160;</div>"+e[1]+a.replace(le,"<$1></$2>")+e[2];d.removeChild(d.firstChild);for(a=e[0];a--;)d=d.lastChild;a=0;for(e=d.childNodes.length;a<e;++a)c.push(d.childNodes[a]);d=b.firstChild;d.textContent=""}else c.push(d.createTextNode(a));b.textContent="";b.innerHTML="";b=c}Ib(this,b);y(V.createDocumentFragment()).append(this)}else Ib(this,
b)}function Jb(b){return b.cloneNode(!0)}function Ha(b){lc(b);var a=0;for(b=b.childNodes||[];a<b.length;a++)Ha(b[a])}function mc(b,a,c,d){if(z(d))throw Gb("offargs");var e=la(b,"events");la(b,"handle")&&(H(a)?q(e,function(a,c){Va(b,c,a);delete e[c]}):q(a.split(" "),function(a){H(c)?(Va(b,a,e[a]),delete e[a]):Oa(e[a]||[],c)}))}function lc(b,a){var c=b[jb],d=Wa[c];d&&(a?delete Wa[c].data[a]:(d.handle&&(d.events.$destroy&&d.handle({},"$destroy"),mc(b)),delete Wa[c],b[jb]=s))}function la(b,a,c){var d=
b[jb],d=Wa[d||-1];if(z(c))d||(b[jb]=d=++me,d=Wa[d]={}),d[a]=c;else return d&&d[a]}function nc(b,a,c){var d=la(b,"data"),e=z(c),f=!e&&z(a),g=f&&!U(a);d||g||la(b,"data",d={});if(e)d[a]=c;else if(f){if(g)return d&&d[a];E(d,a)}else return d}function Kb(b,a){return b.getAttribute?-1<(" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").indexOf(" "+a+" "):!1}function kb(b,a){a&&b.setAttribute&&q(a.split(" "),function(a){b.setAttribute("class",ba((" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g,
" ").replace(" "+ba(a)+" "," ")))})}function lb(b,a){if(a&&b.setAttribute){var c=(" "+(b.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ");q(a.split(" "),function(a){a=ba(a);-1===c.indexOf(" "+a+" ")&&(c+=a+" ")});b.setAttribute("class",ba(c))}}function Ib(b,a){if(a){a=a.nodeName||!z(a.length)||Da(a)?[a]:a;for(var c=0;c<a.length;c++)b.push(a[c])}}function oc(b,a){return mb(b,"$"+(a||"ngController")+"Controller")}function mb(b,a,c){b=y(b);9==b[0].nodeType&&(b=b.find("html"));for(a=K(a)?a:[a];b.length;){for(var d=
b[0],e=0,f=a.length;e<f;e++)if((c=b.data(a[e]))!==s)return c;b=y(d.parentNode||11===d.nodeType&&d.host)}}function pc(b){for(var a=0,c=b.childNodes;a<c.length;a++)Ha(c[a]);for(;b.firstChild;)b.removeChild(b.firstChild)}function qc(b,a){var c=nb[a.toLowerCase()];return c&&rc[b.nodeName]&&c}function ne(b,a){var c=function(c,e){c.preventDefault||(c.preventDefault=function(){c.returnValue=!1});c.stopPropagation||(c.stopPropagation=function(){c.cancelBubble=!0});c.target||(c.target=c.srcElement||V);if(H(c.defaultPrevented)){var f=
c.preventDefault;c.preventDefault=function(){c.defaultPrevented=!0;f.call(c)};c.defaultPrevented=!1}c.isDefaultPrevented=function(){return c.defaultPrevented||!1===c.returnValue};var g=ka(a[e||c.type]||[]);q(g,function(a){a.call(b,c)});8>=S?(c.preventDefault=null,c.stopPropagation=null,c.isDefaultPrevented=null):(delete c.preventDefault,delete c.stopPropagation,delete c.isDefaultPrevented)};c.elem=b;return c}function Ia(b){var a=typeof b,c;"object"==a&&null!==b?"function"==typeof(c=b.$$hashKey)?c=
b.$$hashKey():c===s&&(c=b.$$hashKey=eb()):c=b;return a+":"+c}function Xa(b){q(b,this.put,this)}function sc(b){var a,c;"function"==typeof b?(a=b.$inject)||(a=[],b.length&&(c=b.toString().replace(oe,""),c=c.match(pe),q(c[1].split(qe),function(b){b.replace(re,function(b,c,d){a.push(d)})})),b.$inject=a):K(b)?(c=b.length-1,Sa(b[c],"fn"),a=b.slice(0,c)):Sa(b,"fn",!0);return a}function ec(b){function a(a){return function(b,c){if(U(b))q(b,Xb(a));else return a(b,c)}}function c(a,b){Aa(a,"service");if(Q(b)||
K(b))b=n.instantiate(b);if(!b.$get)throw Ya("pget",a);return l[a+h]=b}function d(a,b){return c(a,{$get:b})}function e(a){var b=[],c,d,f,h;q(a,function(a){if(!k.get(a)){k.put(a,!0);try{if(C(a))for(c=Ta(a),b=b.concat(e(c.requires)).concat(c._runBlocks),d=c._invokeQueue,f=0,h=d.length;f<h;f++){var g=d[f],m=n.get(g[0]);m[g[1]].apply(m,g[2])}else Q(a)?b.push(n.invoke(a)):K(a)?b.push(n.invoke(a)):Sa(a,"module")}catch(l){throw K(a)&&(a=a[a.length-1]),l.message&&(l.stack&&-1==l.stack.indexOf(l.message))&&
(l=l.message+"\n"+l.stack),Ya("modulerr",a,l.stack||l.message||l);}}});return b}function f(a,b){function c(d){if(a.hasOwnProperty(d)){if(a[d]===g)throw Ya("cdep",m.join(" <- "));return a[d]}try{return m.unshift(d),a[d]=g,a[d]=b(d)}catch(e){throw a[d]===g&&delete a[d],e;}finally{m.shift()}}function d(a,b,e){var f=[],h=sc(a),g,m,k;m=0;for(g=h.length;m<g;m++){k=h[m];if("string"!==typeof k)throw Ya("itkn",k);f.push(e&&e.hasOwnProperty(k)?e[k]:c(k))}a.$inject||(a=a[g]);return a.apply(b,f)}return{invoke:d,
instantiate:function(a,b){var c=function(){},e;c.prototype=(K(a)?a[a.length-1]:a).prototype;c=new c;e=d(a,c,b);return U(e)||Q(e)?e:c},get:c,annotate:sc,has:function(b){return l.hasOwnProperty(b+h)||a.hasOwnProperty(b)}}}var g={},h="Provider",m=[],k=new Xa,l={$provide:{provider:a(c),factory:a(d),service:a(function(a,b){return d(a,["$injector",function(a){return a.instantiate(b)}])}),value:a(function(a,b){return d(a,aa(b))}),constant:a(function(a,b){Aa(a,"constant");l[a]=b;p[a]=b}),decorator:function(a,
b){var c=n.get(a+h),d=c.$get;c.$get=function(){var a=r.invoke(d,c);return r.invoke(b,null,{$delegate:a})}}}},n=l.$injector=f(l,function(){throw Ya("unpr",m.join(" <- "));}),p={},r=p.$injector=f(p,function(a){a=n.get(a+h);return r.invoke(a.$get,a)});q(e(b),function(a){r.invoke(a||w)});return r}function Kd(){var b=!0;this.disableAutoScrolling=function(){b=!1};this.$get=["$window","$location","$rootScope",function(a,c,d){function e(a){var b=null;q(a,function(a){b||"a"!==J(a.nodeName)||(b=a)});return b}
function f(){var b=c.hash(),d;b?(d=g.getElementById(b))?d.scrollIntoView():(d=e(g.getElementsByName(b)))?d.scrollIntoView():"top"===b&&a.scrollTo(0,0):a.scrollTo(0,0)}var g=a.document;b&&d.$watch(function(){return c.hash()},function(){d.$evalAsync(f)});return f}]}function ge(){this.$get=["$$rAF","$timeout",function(b,a){return b.supported?function(a){return b(a)}:function(b){return a(b,0,!1)}}]}function se(b,a,c,d){function e(a){try{a.apply(null,ya.call(arguments,1))}finally{if(A--,0===A)for(;D.length;)try{D.pop()()}catch(b){c.error(b)}}}
function f(a,b){(function T(){q(x,function(a){a()});t=b(T,a)})()}function g(){v=null;N!=h.url()&&(N=h.url(),q(ma,function(a){a(h.url())}))}var h=this,m=a[0],k=b.location,l=b.history,n=b.setTimeout,p=b.clearTimeout,r={};h.isMock=!1;var A=0,D=[];h.$$completeOutstandingRequest=e;h.$$incOutstandingRequestCount=function(){A++};h.notifyWhenNoOutstandingRequests=function(a){q(x,function(a){a()});0===A?a():D.push(a)};var x=[],t;h.addPollFn=function(a){H(t)&&f(100,n);x.push(a);return a};var N=k.href,B=a.find("base"),
v=null;h.url=function(a,c){k!==b.location&&(k=b.location);l!==b.history&&(l=b.history);if(a){if(N!=a)return N=a,d.history?c?l.replaceState(null,"",a):(l.pushState(null,"",a),B.attr("href",B.attr("href"))):(v=a,c?k.replace(a):k.href=a),h}else return v||k.href.replace(/%27/g,"'")};var ma=[],L=!1;h.onUrlChange=function(a){if(!L){if(d.history)y(b).on("popstate",g);if(d.hashchange)y(b).on("hashchange",g);else h.addPollFn(g);L=!0}ma.push(a);return a};h.baseHref=function(){var a=B.attr("href");return a?
a.replace(/^(https?\:)?\/\/[^\/]*/,""):""};var O={},ca="",F=h.baseHref();h.cookies=function(a,b){var d,e,f,h;if(a)b===s?m.cookie=escape(a)+"=;path="+F+";expires=Thu, 01 Jan 1970 00:00:00 GMT":C(b)&&(d=(m.cookie=escape(a)+"="+escape(b)+";path="+F).length+1,4096<d&&c.warn("Cookie '"+a+"' possibly not set or overflowed because it was too large ("+d+" > 4096 bytes)!"));else{if(m.cookie!==ca)for(ca=m.cookie,d=ca.split("; "),O={},f=0;f<d.length;f++)e=d[f],h=e.indexOf("="),0<h&&(a=unescape(e.substring(0,
h)),O[a]===s&&(O[a]=unescape(e.substring(h+1))));return O}};h.defer=function(a,b){var c;A++;c=n(function(){delete r[c];e(a)},b||0);r[c]=!0;return c};h.defer.cancel=function(a){return r[a]?(delete r[a],p(a),e(w),!0):!1}}function Md(){this.$get=["$window","$log","$sniffer","$document",function(b,a,c,d){return new se(b,d,a,c)}]}function Nd(){this.$get=function(){function b(b,d){function e(a){a!=n&&(p?p==a&&(p=a.n):p=a,f(a.n,a.p),f(a,n),n=a,n.n=null)}function f(a,b){a!=b&&(a&&(a.p=b),b&&(b.n=a))}if(b in
a)throw u("$cacheFactory")("iid",b);var g=0,h=E({},d,{id:b}),m={},k=d&&d.capacity||Number.MAX_VALUE,l={},n=null,p=null;return a[b]={put:function(a,b){if(k<Number.MAX_VALUE){var c=l[a]||(l[a]={key:a});e(c)}if(!H(b))return a in m||g++,m[a]=b,g>k&&this.remove(p.key),b},get:function(a){if(k<Number.MAX_VALUE){var b=l[a];if(!b)return;e(b)}return m[a]},remove:function(a){if(k<Number.MAX_VALUE){var b=l[a];if(!b)return;b==n&&(n=b.p);b==p&&(p=b.n);f(b.n,b.p);delete l[a]}delete m[a];g--},removeAll:function(){m=
{};g=0;l={};n=p=null},destroy:function(){l=h=m=null;delete a[b]},info:function(){return E({},h,{size:g})}}}var a={};b.info=function(){var b={};q(a,function(a,e){b[e]=a.info()});return b};b.get=function(b){return a[b]};return b}}function ce(){this.$get=["$cacheFactory",function(b){return b("templates")}]}function gc(b,a){var c={},d="Directive",e=/^\s*directive\:\s*([\d\w_\-]+)\s+(.*)$/,f=/(([\d\w_\-]+)(?:\:([^;]+))?;?)/,g=/^(on[a-z]+|formaction)$/;this.directive=function m(a,e){Aa(a,"directive");C(a)?
(Cb(e,"directiveFactory"),c.hasOwnProperty(a)||(c[a]=[],b.factory(a+d,["$injector","$exceptionHandler",function(b,d){var e=[];q(c[a],function(c,f){try{var g=b.invoke(c);Q(g)?g={compile:aa(g)}:!g.compile&&g.link&&(g.compile=aa(g.link));g.priority=g.priority||0;g.index=f;g.name=g.name||a;g.require=g.require||g.controller&&g.name;g.restrict=g.restrict||"A";e.push(g)}catch(m){d(m)}});return e}])),c[a].push(e)):q(a,Xb(m));return this};this.aHrefSanitizationWhitelist=function(b){return z(b)?(a.aHrefSanitizationWhitelist(b),
this):a.aHrefSanitizationWhitelist()};this.imgSrcSanitizationWhitelist=function(b){return z(b)?(a.imgSrcSanitizationWhitelist(b),this):a.imgSrcSanitizationWhitelist()};this.$get=["$injector","$interpolate","$exceptionHandler","$http","$templateCache","$parse","$controller","$rootScope","$document","$sce","$animate","$$sanitizeUri",function(a,b,l,n,p,r,A,D,x,t,N,B){function v(a,b,c,d,e){a instanceof y||(a=y(a));q(a,function(b,c){3==b.nodeType&&b.nodeValue.match(/\S+/)&&(a[c]=y(b).wrap("<span></span>").parent()[0])});
var f=L(a,b,a,c,d,e);ma(a,"ng-scope");return function(b,c,d){Cb(b,"scope");var e=c?Ja.clone.call(a):a;q(d,function(a,b){e.data("$"+b+"Controller",a)});d=0;for(var g=e.length;d<g;d++){var m=e[d].nodeType;1!==m&&9!==m||e.eq(d).data("$scope",b)}c&&c(e,b);f&&f(b,e,e);return e}}function ma(a,b){try{a.addClass(b)}catch(c){}}function L(a,b,c,d,e,f){function g(a,c,d,e){var f,k,l,r,n,p,A;f=c.length;var I=Array(f);for(n=0;n<f;n++)I[n]=c[n];A=n=0;for(p=m.length;n<p;A++)k=I[A],c=m[n++],f=m[n++],l=y(k),c?(c.scope?
(r=a.$new(),l.data("$scope",r)):r=a,(l=c.transclude)||!e&&b?c(f,r,k,d,O(a,l||b)):c(f,r,k,d,e)):f&&f(a,k.childNodes,s,e)}for(var m=[],k,l,r,n,p=0;p<a.length;p++)k=new Lb,l=ca(a[p],[],k,0===p?d:s,e),(f=l.length?ea(l,a[p],k,b,c,null,[],[],f):null)&&f.scope&&ma(y(a[p]),"ng-scope"),k=f&&f.terminal||!(r=a[p].childNodes)||!r.length?null:L(r,f?f.transclude:b),m.push(f,k),n=n||f||k,f=null;return n?g:null}function O(a,b){return function(c,d,e){var f=!1;c||(c=a.$new(),f=c.$$transcluded=!0);d=b(c,d,e);if(f)d.on("$destroy",
gb(c,c.$destroy));return d}}function ca(a,b,c,d,g){var m=c.$attr,k;switch(a.nodeType){case 1:T(b,na(Ka(a).toLowerCase()),"E",d,g);var l,r,n;k=a.attributes;for(var p=0,A=k&&k.length;p<A;p++){var x=!1,D=!1;l=k[p];if(!S||8<=S||l.specified){r=l.name;n=na(r);X.test(n)&&(r=ib(n.substr(6),"-"));var N=n.replace(/(Start|End)$/,"");n===N+"Start"&&(x=r,D=r.substr(0,r.length-5)+"end",r=r.substr(0,r.length-6));n=na(r.toLowerCase());m[n]=r;c[n]=l=ba(l.value);qc(a,n)&&(c[n]=!0);M(a,b,l,n);T(b,n,"A",d,g,x,D)}}a=
a.className;if(C(a)&&""!==a)for(;k=f.exec(a);)n=na(k[2]),T(b,n,"C",d,g)&&(c[n]=ba(k[3])),a=a.substr(k.index+k[0].length);break;case 3:u(b,a.nodeValue);break;case 8:try{if(k=e.exec(a.nodeValue))n=na(k[1]),T(b,n,"M",d,g)&&(c[n]=ba(k[2]))}catch(t){}}b.sort(H);return b}function F(a,b,c){var d=[],e=0;if(b&&a.hasAttribute&&a.hasAttribute(b)){do{if(!a)throw ia("uterdir",b,c);1==a.nodeType&&(a.hasAttribute(b)&&e++,a.hasAttribute(c)&&e--);d.push(a);a=a.nextSibling}while(0<e)}else d.push(a);return y(d)}function R(a,
b,c){return function(d,e,f,g,k){e=F(e[0],b,c);return a(d,e,f,g,k)}}function ea(a,c,d,e,f,g,m,n,p){function x(a,b,c,d){if(a){c&&(a=R(a,c,d));a.require=G.require;a.directiveName=u;if(O===G||G.$$isolateScope)a=uc(a,{isolateScope:!0});m.push(a)}if(b){c&&(b=R(b,c,d));b.require=G.require;b.directiveName=u;if(O===G||G.$$isolateScope)b=uc(b,{isolateScope:!0});n.push(b)}}function D(a,b,c,d){var e,f="data",g=!1;if(C(b)){for(;"^"==(e=b.charAt(0))||"?"==e;)b=b.substr(1),"^"==e&&(f="inheritedData"),g=g||"?"==
e;e=null;d&&"data"===f&&(e=d[b]);e=e||c[f]("$"+b+"Controller");if(!e&&!g)throw ia("ctreq",b,a);}else K(b)&&(e=[],q(b,function(b){e.push(D(a,b,c,d))}));return e}function N(a,e,f,g,p){function x(a,b){var c;2>arguments.length&&(b=a,a=s);E&&(c=ca);return p(a,b,c)}var t,I,v,B,R,F,ca={},ob;t=c===f?d:ka(d,new Lb(y(f),d.$attr));I=t.$$element;if(O){var T=/^\s*([@=&])(\??)\s*(\w*)\s*$/;g=y(f);F=e.$new(!0);!ea||ea!==O&&ea!==O.$$originalDirective?g.data("$isolateScopeNoTemplate",F):g.data("$isolateScope",F);
ma(g,"ng-isolate-scope");q(O.scope,function(a,c){var d=a.match(T)||[],f=d[3]||c,g="?"==d[2],d=d[1],m,l,n,p;F.$$isolateBindings[c]=d+f;switch(d){case "@":t.$observe(f,function(a){F[c]=a});t.$$observers[f].$$scope=e;t[f]&&(F[c]=b(t[f])(e));break;case "=":if(g&&!t[f])break;l=r(t[f]);p=l.literal?xa:function(a,b){return a===b};n=l.assign||function(){m=F[c]=l(e);throw ia("nonassign",t[f],O.name);};m=F[c]=l(e);F.$watch(function(){var a=l(e);p(a,F[c])||(p(a,m)?n(e,a=F[c]):F[c]=a);return m=a},null,l.literal);
break;case "&":l=r(t[f]);F[c]=function(a){return l(e,a)};break;default:throw ia("iscp",O.name,c,a);}})}ob=p&&x;L&&q(L,function(a){var b={$scope:a===O||a.$$isolateScope?F:e,$element:I,$attrs:t,$transclude:ob},c;R=a.controller;"@"==R&&(R=t[a.name]);c=A(R,b);ca[a.name]=c;E||I.data("$"+a.name+"Controller",c);a.controllerAs&&(b.$scope[a.controllerAs]=c)});g=0;for(v=m.length;g<v;g++)try{B=m[g],B(B.isolateScope?F:e,I,t,B.require&&D(B.directiveName,B.require,I,ca),ob)}catch(G){l(G,ha(I))}g=e;O&&(O.template||
null===O.templateUrl)&&(g=F);a&&a(g,f.childNodes,s,p);for(g=n.length-1;0<=g;g--)try{B=n[g],B(B.isolateScope?F:e,I,t,B.require&&D(B.directiveName,B.require,I,ca),ob)}catch(z){l(z,ha(I))}}p=p||{};for(var t=-Number.MAX_VALUE,B,L=p.controllerDirectives,O=p.newIsolateScopeDirective,ea=p.templateDirective,T=p.nonTlbTranscludeDirective,H=!1,E=p.hasElementTranscludeDirective,Z=d.$$element=y(c),G,u,W,Za=e,P,M=0,S=a.length;M<S;M++){G=a[M];var ra=G.$$start,X=G.$$end;ra&&(Z=F(c,ra,X));W=s;if(t>G.priority)break;
if(W=G.scope)B=B||G,G.templateUrl||(J("new/isolated scope",O,G,Z),U(W)&&(O=G));u=G.name;!G.templateUrl&&G.controller&&(W=G.controller,L=L||{},J("'"+u+"' controller",L[u],G,Z),L[u]=G);if(W=G.transclude)H=!0,G.$$tlb||(J("transclusion",T,G,Z),T=G),"element"==W?(E=!0,t=G.priority,W=F(c,ra,X),Z=d.$$element=y(V.createComment(" "+u+": "+d[u]+" ")),c=Z[0],pb(f,y(ya.call(W,0)),c),Za=v(W,e,t,g&&g.name,{nonTlbTranscludeDirective:T})):(W=y(Jb(c)).contents(),Z.empty(),Za=v(W,e));if(G.template)if(J("template",
ea,G,Z),ea=G,W=Q(G.template)?G.template(Z,d):G.template,W=Y(W),G.replace){g=G;W=Hb.test(W)?y(ba(W)):[];c=W[0];if(1!=W.length||1!==c.nodeType)throw ia("tplrt",u,"");pb(f,Z,c);S={$attr:{}};W=ca(c,[],S);var $=a.splice(M+1,a.length-(M+1));O&&tc(W);a=a.concat(W).concat($);z(d,S);S=a.length}else Z.html(W);if(G.templateUrl)J("template",ea,G,Z),ea=G,G.replace&&(g=G),N=w(a.splice(M,a.length-M),Z,d,f,Za,m,n,{controllerDirectives:L,newIsolateScopeDirective:O,templateDirective:ea,nonTlbTranscludeDirective:T}),
S=a.length;else if(G.compile)try{P=G.compile(Z,d,Za),Q(P)?x(null,P,ra,X):P&&x(P.pre,P.post,ra,X)}catch(aa){l(aa,ha(Z))}G.terminal&&(N.terminal=!0,t=Math.max(t,G.priority))}N.scope=B&&!0===B.scope;N.transclude=H&&Za;p.hasElementTranscludeDirective=E;return N}function tc(a){for(var b=0,c=a.length;b<c;b++)a[b]=Zb(a[b],{$$isolateScope:!0})}function T(b,e,f,g,k,r,n){if(e===k)return null;k=null;if(c.hasOwnProperty(e)){var p;e=a.get(e+d);for(var A=0,x=e.length;A<x;A++)try{p=e[A],(g===s||g>p.priority)&&-1!=
p.restrict.indexOf(f)&&(r&&(p=Zb(p,{$$start:r,$$end:n})),b.push(p),k=p)}catch(D){l(D)}}return k}function z(a,b){var c=b.$attr,d=a.$attr,e=a.$$element;q(a,function(d,e){"$"!=e.charAt(0)&&(b[e]&&b[e]!==d&&(d+=("style"===e?";":" ")+b[e]),a.$set(e,d,!0,c[e]))});q(b,function(b,f){"class"==f?(ma(e,b),a["class"]=(a["class"]?a["class"]+" ":"")+b):"style"==f?(e.attr("style",e.attr("style")+";"+b),a.style=(a.style?a.style+";":"")+b):"$"==f.charAt(0)||a.hasOwnProperty(f)||(a[f]=b,d[f]=c[f])})}function w(a,b,
c,d,e,f,g,k){var m=[],l,r,A=b[0],x=a.shift(),D=E({},x,{templateUrl:null,transclude:null,replace:null,$$originalDirective:x}),N=Q(x.templateUrl)?x.templateUrl(b,c):x.templateUrl;b.empty();n.get(t.getTrustedResourceUrl(N),{cache:p}).success(function(n){var p,t;n=Y(n);if(x.replace){n=Hb.test(n)?y(ba(n)):[];p=n[0];if(1!=n.length||1!==p.nodeType)throw ia("tplrt",x.name,N);n={$attr:{}};pb(d,b,p);var v=ca(p,[],n);U(x.scope)&&tc(v);a=v.concat(a);z(c,n)}else p=A,b.html(n);a.unshift(D);l=ea(a,p,c,e,b,x,f,g,
k);q(d,function(a,c){a==p&&(d[c]=b[0])});for(r=L(b[0].childNodes,e);m.length;){n=m.shift();t=m.shift();var B=m.shift(),R=m.shift(),v=b[0];if(t!==A){var F=t.className;k.hasElementTranscludeDirective&&x.replace||(v=Jb(p));pb(B,y(t),v);ma(y(v),F)}t=l.transclude?O(n,l.transclude):R;l(r,n,v,d,t)}m=null}).error(function(a,b,c,d){throw ia("tpload",d.url);});return function(a,b,c,d,e){m?(m.push(b),m.push(c),m.push(d),m.push(e)):l(r,b,c,d,e)}}function H(a,b){var c=b.priority-a.priority;return 0!==c?c:a.name!==
b.name?a.name<b.name?-1:1:a.index-b.index}function J(a,b,c,d){if(b)throw ia("multidir",b.name,c.name,a,ha(d));}function u(a,c){var d=b(c,!0);d&&a.push({priority:0,compile:aa(function(a,b){var c=b.parent(),e=c.data("$binding")||[];e.push(d);ma(c.data("$binding",e),"ng-binding");a.$watch(d,function(a){b[0].nodeValue=a})})})}function P(a,b){if("srcdoc"==b)return t.HTML;var c=Ka(a);if("xlinkHref"==b||"FORM"==c&&"action"==b||"IMG"!=c&&("src"==b||"ngSrc"==b))return t.RESOURCE_URL}function M(a,c,d,e){var f=
b(d,!0);if(f){if("multiple"===e&&"SELECT"===Ka(a))throw ia("selmulti",ha(a));c.push({priority:100,compile:function(){return{pre:function(c,d,m){d=m.$$observers||(m.$$observers={});if(g.test(e))throw ia("nodomevents");if(f=b(m[e],!0,P(a,e)))m[e]=f(c),(d[e]||(d[e]=[])).$$inter=!0,(m.$$observers&&m.$$observers[e].$$scope||c).$watch(f,function(a,b){"class"===e&&a!=b?m.$updateClass(a,b):m.$set(e,a)})}}}})}}function pb(a,b,c){var d=b[0],e=b.length,f=d.parentNode,g,m;if(a)for(g=0,m=a.length;g<m;g++)if(a[g]==
d){a[g++]=c;m=g+e-1;for(var k=a.length;g<k;g++,m++)m<k?a[g]=a[m]:delete a[g];a.length-=e-1;break}f&&f.replaceChild(c,d);a=V.createDocumentFragment();a.appendChild(d);c[y.expando]=d[y.expando];d=1;for(e=b.length;d<e;d++)f=b[d],y(f).remove(),a.appendChild(f),delete b[d];b[0]=c;b.length=1}function uc(a,b){return E(function(){return a.apply(null,arguments)},a,b)}var Lb=function(a,b){this.$$element=a;this.$attr=b||{}};Lb.prototype={$normalize:na,$addClass:function(a){a&&0<a.length&&N.addClass(this.$$element,
a)},$removeClass:function(a){a&&0<a.length&&N.removeClass(this.$$element,a)},$updateClass:function(a,b){var c=vc(a,b),d=vc(b,a);0===c.length?N.removeClass(this.$$element,d):0===d.length?N.addClass(this.$$element,c):N.setClass(this.$$element,c,d)},$set:function(a,b,c,d){var e=qc(this.$$element[0],a);e&&(this.$$element.prop(a,b),d=e);this[a]=b;d?this.$attr[a]=d:(d=this.$attr[a])||(this.$attr[a]=d=ib(a,"-"));e=Ka(this.$$element);if("A"===e&&"href"===a||"IMG"===e&&"src"===a)this[a]=b=B(b,"src"===a);!1!==
c&&(null===b||b===s?this.$$element.removeAttr(d):this.$$element.attr(d,b));(c=this.$$observers)&&q(c[a],function(a){try{a(b)}catch(c){l(c)}})},$observe:function(a,b){var c=this,d=c.$$observers||(c.$$observers={}),e=d[a]||(d[a]=[]);e.push(b);D.$evalAsync(function(){e.$$inter||b(c[a])});return b}};var Z=b.startSymbol(),ra=b.endSymbol(),Y="{{"==Z||"}}"==ra?Ea:function(a){return a.replace(/\{\{/g,Z).replace(/}}/g,ra)},X=/^ngAttr[A-Z]/;return v}]}function na(b){return Ua(b.replace(te,""))}function vc(b,
a){var c="",d=b.split(/\s+/),e=a.split(/\s+/),f=0;a:for(;f<d.length;f++){for(var g=d[f],h=0;h<e.length;h++)if(g==e[h])continue a;c+=(0<c.length?" ":"")+g}return c}function Od(){var b={},a=/^(\S+)(\s+as\s+(\w+))?$/;this.register=function(a,d){Aa(a,"controller");U(a)?E(b,a):b[a]=d};this.$get=["$injector","$window",function(c,d){return function(e,f){var g,h,m;C(e)&&(g=e.match(a),h=g[1],m=g[3],e=b.hasOwnProperty(h)?b[h]:fc(f.$scope,h,!0)||fc(d,h,!0),Sa(e,h,!0));g=c.instantiate(e,f);if(m){if(!f||"object"!=
typeof f.$scope)throw u("$controller")("noscp",h||e.name,m);f.$scope[m]=g}return g}}]}function Pd(){this.$get=["$window",function(b){return y(b.document)}]}function Qd(){this.$get=["$log",function(b){return function(a,c){b.error.apply(b,arguments)}}]}function wc(b){var a={},c,d,e;if(!b)return a;q(b.split("\n"),function(b){e=b.indexOf(":");c=J(ba(b.substr(0,e)));d=ba(b.substr(e+1));c&&(a[c]=a[c]?a[c]+(", "+d):d)});return a}function xc(b){var a=U(b)?b:s;return function(c){a||(a=wc(b));return c?a[J(c)]||
null:a}}function yc(b,a,c){if(Q(c))return c(b,a);q(c,function(c){b=c(b,a)});return b}function Td(){var b=/^\s*(\[|\{[^\{])/,a=/[\}\]]\s*$/,c=/^\)\]\}',?\n/,d={"Content-Type":"application/json;charset=utf-8"},e=this.defaults={transformResponse:[function(d){C(d)&&(d=d.replace(c,""),b.test(d)&&a.test(d)&&(d=ac(d)));return d}],transformRequest:[function(a){return U(a)&&"[object File]"!==wa.call(a)&&"[object Blob]"!==wa.call(a)?qa(a):a}],headers:{common:{Accept:"application/json, text/plain, */*"},post:ka(d),
put:ka(d),patch:ka(d)},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN"},f=this.interceptors=[],g=this.responseInterceptors=[];this.$get=["$httpBackend","$browser","$cacheFactory","$rootScope","$q","$injector",function(a,b,c,d,n,p){function r(a){function c(a){var b=E({},a,{data:yc(a.data,a.headers,d.transformResponse)});return 200<=a.status&&300>a.status?b:n.reject(b)}var d={method:"get",transformRequest:e.transformRequest,transformResponse:e.transformResponse},f=function(a){function b(a){var c;
q(a,function(b,d){Q(b)&&(c=b(),null!=c?a[d]=c:delete a[d])})}var c=e.headers,d=E({},a.headers),f,g,c=E({},c.common,c[J(a.method)]);b(c);b(d);a:for(f in c){a=J(f);for(g in d)if(J(g)===a)continue a;d[f]=c[f]}return d}(a);E(d,a);d.headers=f;d.method=Ga(d.method);(a=Mb(d.url)?b.cookies()[d.xsrfCookieName||e.xsrfCookieName]:s)&&(f[d.xsrfHeaderName||e.xsrfHeaderName]=a);var g=[function(a){f=a.headers;var b=yc(a.data,xc(f),a.transformRequest);H(a.data)&&q(f,function(a,b){"content-type"===J(b)&&delete f[b]});
H(a.withCredentials)&&!H(e.withCredentials)&&(a.withCredentials=e.withCredentials);return A(a,b,f).then(c,c)},s],h=n.when(d);for(q(t,function(a){(a.request||a.requestError)&&g.unshift(a.request,a.requestError);(a.response||a.responseError)&&g.push(a.response,a.responseError)});g.length;){a=g.shift();var k=g.shift(),h=h.then(a,k)}h.success=function(a){h.then(function(b){a(b.data,b.status,b.headers,d)});return h};h.error=function(a){h.then(null,function(b){a(b.data,b.status,b.headers,d)});return h};
return h}function A(b,c,f){function g(a,b,c,e){t&&(200<=a&&300>a?t.put(s,[a,b,wc(c),e]):t.remove(s));m(b,a,c,e);d.$$phase||d.$apply()}function m(a,c,d,e){c=Math.max(c,0);(200<=c&&300>c?p.resolve:p.reject)({data:a,status:c,headers:xc(d),config:b,statusText:e})}function k(){var a=Na(r.pendingRequests,b);-1!==a&&r.pendingRequests.splice(a,1)}var p=n.defer(),A=p.promise,t,q,s=D(b.url,b.params);r.pendingRequests.push(b);A.then(k,k);(b.cache||e.cache)&&(!1!==b.cache&&"GET"==b.method)&&(t=U(b.cache)?b.cache:
U(e.cache)?e.cache:x);if(t)if(q=t.get(s),z(q)){if(q.then)return q.then(k,k),q;K(q)?m(q[1],q[0],ka(q[2]),q[3]):m(q,200,{},"OK")}else t.put(s,A);H(q)&&a(b.method,s,c,g,f,b.timeout,b.withCredentials,b.responseType);return A}function D(a,b){if(!b)return a;var c=[];Sc(b,function(a,b){null===a||H(a)||(K(a)||(a=[a]),q(a,function(a){U(a)&&(a=qa(a));c.push(za(b)+"="+za(a))}))});0<c.length&&(a+=(-1==a.indexOf("?")?"?":"&")+c.join("&"));return a}var x=c("$http"),t=[];q(f,function(a){t.unshift(C(a)?p.get(a):
p.invoke(a))});q(g,function(a,b){var c=C(a)?p.get(a):p.invoke(a);t.splice(b,0,{response:function(a){return c(n.when(a))},responseError:function(a){return c(n.reject(a))}})});r.pendingRequests=[];(function(a){q(arguments,function(a){r[a]=function(b,c){return r(E(c||{},{method:a,url:b}))}})})("get","delete","head","jsonp");(function(a){q(arguments,function(a){r[a]=function(b,c,d){return r(E(d||{},{method:a,url:b,data:c}))}})})("post","put");r.defaults=e;return r}]}function ue(b){if(8>=S&&(!b.match(/^(get|post|head|put|delete|options)$/i)||
!P.XMLHttpRequest))return new P.ActiveXObject("Microsoft.XMLHTTP");if(P.XMLHttpRequest)return new P.XMLHttpRequest;throw u("$httpBackend")("noxhr");}function Ud(){this.$get=["$browser","$window","$document",function(b,a,c){return ve(b,ue,b.defer,a.angular.callbacks,c[0])}]}function ve(b,a,c,d,e){function f(a,b,c){var f=e.createElement("script"),g=null;f.type="text/javascript";f.src=a;f.async=!0;g=function(a){Va(f,"load",g);Va(f,"error",g);e.body.removeChild(f);f=null;var h=-1,A="unknown";a&&("load"!==
a.type||d[b].called||(a={type:"error"}),A=a.type,h="error"===a.type?404:200);c&&c(h,A)};qb(f,"load",g);qb(f,"error",g);8>=S&&(f.onreadystatechange=function(){C(f.readyState)&&/loaded|complete/.test(f.readyState)&&(f.onreadystatechange=null,g({type:"load"}))});e.body.appendChild(f);return g}var g=-1;return function(e,m,k,l,n,p,r,A){function D(){t=g;B&&B();v&&v.abort()}function x(a,d,e,f,g){L&&c.cancel(L);B=v=null;0===d&&(d=e?200:"file"==sa(m).protocol?404:0);a(1223===d?204:d,e,f,g||"");b.$$completeOutstandingRequest(w)}
var t;b.$$incOutstandingRequestCount();m=m||b.url();if("jsonp"==J(e)){var N="_"+(d.counter++).toString(36);d[N]=function(a){d[N].data=a;d[N].called=!0};var B=f(m.replace("JSON_CALLBACK","angular.callbacks."+N),N,function(a,b){x(l,a,d[N].data,"",b);d[N]=w})}else{var v=a(e);v.open(e,m,!0);q(n,function(a,b){z(a)&&v.setRequestHeader(b,a)});v.onreadystatechange=function(){if(v&&4==v.readyState){var a=null,b=null;t!==g&&(a=v.getAllResponseHeaders(),b="response"in v?v.response:v.responseText);x(l,t||v.status,
b,a,v.statusText||"")}};r&&(v.withCredentials=!0);if(A)try{v.responseType=A}catch(s){if("json"!==A)throw s;}v.send(k||null)}if(0<p)var L=c(D,p);else p&&p.then&&p.then(D)}}function Rd(){var b="{{",a="}}";this.startSymbol=function(a){return a?(b=a,this):b};this.endSymbol=function(b){return b?(a=b,this):a};this.$get=["$parse","$exceptionHandler","$sce",function(c,d,e){function f(f,k,l){for(var n,p,r=0,A=[],D=f.length,x=!1,t=[];r<D;)-1!=(n=f.indexOf(b,r))&&-1!=(p=f.indexOf(a,n+g))?(r!=n&&A.push(f.substring(r,
n)),A.push(r=c(x=f.substring(n+g,p))),r.exp=x,r=p+h,x=!0):(r!=D&&A.push(f.substring(r)),r=D);(D=A.length)||(A.push(""),D=1);if(l&&1<A.length)throw zc("noconcat",f);if(!k||x)return t.length=D,r=function(a){try{for(var b=0,c=D,g;b<c;b++){if("function"==typeof(g=A[b]))if(g=g(a),g=l?e.getTrusted(l,g):e.valueOf(g),null==g)g="";else switch(typeof g){case "string":break;case "number":g=""+g;break;default:g=qa(g)}t[b]=g}return t.join("")}catch(h){a=zc("interr",f,h.toString()),d(a)}},r.exp=f,r.parts=A,r}var g=
b.length,h=a.length;f.startSymbol=function(){return b};f.endSymbol=function(){return a};return f}]}function Sd(){this.$get=["$rootScope","$window","$q",function(b,a,c){function d(d,g,h,m){var k=a.setInterval,l=a.clearInterval,n=c.defer(),p=n.promise,r=0,A=z(m)&&!m;h=z(h)?h:0;p.then(null,null,d);p.$$intervalId=k(function(){n.notify(r++);0<h&&r>=h&&(n.resolve(r),l(p.$$intervalId),delete e[p.$$intervalId]);A||b.$apply()},g);e[p.$$intervalId]=n;return p}var e={};d.cancel=function(a){return a&&a.$$intervalId in
e?(e[a.$$intervalId].reject("canceled"),clearInterval(a.$$intervalId),delete e[a.$$intervalId],!0):!1};return d}]}function ad(){this.$get=function(){return{id:"en-us",NUMBER_FORMATS:{DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{minInt:1,minFrac:0,maxFrac:3,posPre:"",posSuf:"",negPre:"-",negSuf:"",gSize:3,lgSize:3},{minInt:1,minFrac:2,maxFrac:2,posPre:"\u00a4",posSuf:"",negPre:"(\u00a4",negSuf:")",gSize:3,lgSize:3}],CURRENCY_SYM:"$"},DATETIME_FORMATS:{MONTH:"January February March April May June July August September October November December".split(" "),
SHORTMONTH:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),DAY:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),SHORTDAY:"Sun Mon Tue Wed Thu Fri Sat".split(" "),AMPMS:["AM","PM"],medium:"MMM d, y h:mm:ss a","short":"M/d/yy h:mm a",fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",mediumDate:"MMM d, y",shortDate:"M/d/yy",mediumTime:"h:mm:ss a",shortTime:"h:mm a"},pluralCat:function(b){return 1===b?"one":"other"}}}}function Nb(b){b=b.split("/");for(var a=b.length;a--;)b[a]=
hb(b[a]);return b.join("/")}function Ac(b,a,c){b=sa(b,c);a.$$protocol=b.protocol;a.$$host=b.hostname;a.$$port=Y(b.port)||we[b.protocol]||null}function Bc(b,a,c){var d="/"!==b.charAt(0);d&&(b="/"+b);b=sa(b,c);a.$$path=decodeURIComponent(d&&"/"===b.pathname.charAt(0)?b.pathname.substring(1):b.pathname);a.$$search=cc(b.search);a.$$hash=decodeURIComponent(b.hash);a.$$path&&"/"!=a.$$path.charAt(0)&&(a.$$path="/"+a.$$path)}function oa(b,a){if(0===a.indexOf(b))return a.substr(b.length)}function $a(b){var a=
b.indexOf("#");return-1==a?b:b.substr(0,a)}function Ob(b){return b.substr(0,$a(b).lastIndexOf("/")+1)}function Cc(b,a){this.$$html5=!0;a=a||"";var c=Ob(b);Ac(b,this,b);this.$$parse=function(a){var e=oa(c,a);if(!C(e))throw Pb("ipthprfx",a,c);Bc(e,this,b);this.$$path||(this.$$path="/");this.$$compose()};this.$$compose=function(){var a=Bb(this.$$search),b=this.$$hash?"#"+hb(this.$$hash):"";this.$$url=Nb(this.$$path)+(a?"?"+a:"")+b;this.$$absUrl=c+this.$$url.substr(1)};this.$$rewrite=function(d){var e;
if((e=oa(b,d))!==s)return d=e,(e=oa(a,e))!==s?c+(oa("/",e)||e):b+d;if((e=oa(c,d))!==s)return c+e;if(c==d+"/")return c}}function Qb(b,a){var c=Ob(b);Ac(b,this,b);this.$$parse=function(d){var e=oa(b,d)||oa(c,d),e="#"==e.charAt(0)?oa(a,e):this.$$html5?e:"";if(!C(e))throw Pb("ihshprfx",d,a);Bc(e,this,b);d=this.$$path;var f=/^\/[A-Z]:(\/.*)/;0===e.indexOf(b)&&(e=e.replace(b,""));f.exec(e)||(d=(e=f.exec(d))?e[1]:d);this.$$path=d;this.$$compose()};this.$$compose=function(){var c=Bb(this.$$search),e=this.$$hash?
"#"+hb(this.$$hash):"";this.$$url=Nb(this.$$path)+(c?"?"+c:"")+e;this.$$absUrl=b+(this.$$url?a+this.$$url:"")};this.$$rewrite=function(a){if($a(b)==$a(a))return a}}function Rb(b,a){this.$$html5=!0;Qb.apply(this,arguments);var c=Ob(b);this.$$rewrite=function(d){var e;if(b==$a(d))return d;if(e=oa(c,d))return b+a+e;if(c===d+"/")return c};this.$$compose=function(){var c=Bb(this.$$search),e=this.$$hash?"#"+hb(this.$$hash):"";this.$$url=Nb(this.$$path)+(c?"?"+c:"")+e;this.$$absUrl=b+a+this.$$url}}function rb(b){return function(){return this[b]}}
function Dc(b,a){return function(c){if(H(c))return this[b];this[b]=a(c);this.$$compose();return this}}function Vd(){var b="",a=!1;this.hashPrefix=function(a){return z(a)?(b=a,this):b};this.html5Mode=function(b){return z(b)?(a=b,this):a};this.$get=["$rootScope","$browser","$sniffer","$rootElement",function(c,d,e,f){function g(a){c.$broadcast("$locationChangeSuccess",h.absUrl(),a)}var h,m,k=d.baseHref(),l=d.url(),n;a?(n=l.substring(0,l.indexOf("/",l.indexOf("//")+2))+(k||"/"),m=e.history?Cc:Rb):(n=
$a(l),m=Qb);h=new m(n,"#"+b);h.$$parse(h.$$rewrite(l));f.on("click",function(a){if(!a.ctrlKey&&!a.metaKey&&2!=a.which){for(var e=y(a.target);"a"!==J(e[0].nodeName);)if(e[0]===f[0]||!(e=e.parent())[0])return;var g=e.prop("href");U(g)&&"[object SVGAnimatedString]"===g.toString()&&(g=sa(g.animVal).href);if(m===Rb){var k=e.attr("href")||e.attr("xlink:href");if(0>k.indexOf("://"))if(g="#"+b,"/"==k[0])g=n+g+k;else if("#"==k[0])g=n+g+(h.path()||"/")+k;else{for(var l=h.path().split("/"),k=k.split("/"),p=
0;p<k.length;p++)"."!=k[p]&&(".."==k[p]?l.pop():k[p].length&&l.push(k[p]));g=n+g+l.join("/")}}l=h.$$rewrite(g);g&&(!e.attr("target")&&l&&!a.isDefaultPrevented())&&(a.preventDefault(),l!=d.url()&&(h.$$parse(l),c.$apply(),P.angular["ff-684208-preventDefault"]=!0))}});h.absUrl()!=l&&d.url(h.absUrl(),!0);d.onUrlChange(function(a){h.absUrl()!=a&&(c.$evalAsync(function(){var b=h.absUrl();h.$$parse(a);c.$broadcast("$locationChangeStart",a,b).defaultPrevented?(h.$$parse(b),d.url(b)):g(b)}),c.$$phase||c.$digest())});
var p=0;c.$watch(function(){var a=d.url(),b=h.$$replace;p&&a==h.absUrl()||(p++,c.$evalAsync(function(){c.$broadcast("$locationChangeStart",h.absUrl(),a).defaultPrevented?h.$$parse(a):(d.url(h.absUrl(),b),g(a))}));h.$$replace=!1;return p});return h}]}function Wd(){var b=!0,a=this;this.debugEnabled=function(a){return z(a)?(b=a,this):b};this.$get=["$window",function(c){function d(a){a instanceof Error&&(a.stack?a=a.message&&-1===a.stack.indexOf(a.message)?"Error: "+a.message+"\n"+a.stack:a.stack:a.sourceURL&&
(a=a.message+"\n"+a.sourceURL+":"+a.line));return a}function e(a){var b=c.console||{},e=b[a]||b.log||w;a=!1;try{a=!!e.apply}catch(m){}return a?function(){var a=[];q(arguments,function(b){a.push(d(b))});return e.apply(b,a)}:function(a,b){e(a,null==b?"":b)}}return{log:e("log"),info:e("info"),warn:e("warn"),error:e("error"),debug:function(){var c=e("debug");return function(){b&&c.apply(a,arguments)}}()}}]}function fa(b,a){if("constructor"===b)throw Ca("isecfld",a);return b}function ab(b,a){if(b){if(b.constructor===
b)throw Ca("isecfn",a);if(b.document&&b.location&&b.alert&&b.setInterval)throw Ca("isecwindow",a);if(b.children&&(b.nodeName||b.prop&&b.attr&&b.find))throw Ca("isecdom",a);}return b}function sb(b,a,c,d,e){e=e||{};a=a.split(".");for(var f,g=0;1<a.length;g++){f=fa(a.shift(),d);var h=b[f];h||(h={},b[f]=h);b=h;b.then&&e.unwrapPromises&&(ta(d),"$$v"in b||function(a){a.then(function(b){a.$$v=b})}(b),b.$$v===s&&(b.$$v={}),b=b.$$v)}f=fa(a.shift(),d);return b[f]=c}function Ec(b,a,c,d,e,f,g){fa(b,f);fa(a,f);
fa(c,f);fa(d,f);fa(e,f);return g.unwrapPromises?function(g,m){var k=m&&m.hasOwnProperty(b)?m:g,l;if(null==k)return k;(k=k[b])&&k.then&&(ta(f),"$$v"in k||(l=k,l.$$v=s,l.then(function(a){l.$$v=a})),k=k.$$v);if(!a)return k;if(null==k)return s;(k=k[a])&&k.then&&(ta(f),"$$v"in k||(l=k,l.$$v=s,l.then(function(a){l.$$v=a})),k=k.$$v);if(!c)return k;if(null==k)return s;(k=k[c])&&k.then&&(ta(f),"$$v"in k||(l=k,l.$$v=s,l.then(function(a){l.$$v=a})),k=k.$$v);if(!d)return k;if(null==k)return s;(k=k[d])&&k.then&&
(ta(f),"$$v"in k||(l=k,l.$$v=s,l.then(function(a){l.$$v=a})),k=k.$$v);if(!e)return k;if(null==k)return s;(k=k[e])&&k.then&&(ta(f),"$$v"in k||(l=k,l.$$v=s,l.then(function(a){l.$$v=a})),k=k.$$v);return k}:function(f,g){var k=g&&g.hasOwnProperty(b)?g:f;if(null==k)return k;k=k[b];if(!a)return k;if(null==k)return s;k=k[a];if(!c)return k;if(null==k)return s;k=k[c];if(!d)return k;if(null==k)return s;k=k[d];return e?null==k?s:k=k[e]:k}}function xe(b,a){fa(b,a);return function(a,d){return null==a?s:(d&&d.hasOwnProperty(b)?
d:a)[b]}}function ye(b,a,c){fa(b,c);fa(a,c);return function(c,e){if(null==c)return s;c=(e&&e.hasOwnProperty(b)?e:c)[b];return null==c?s:c[a]}}function Fc(b,a,c){if(Sb.hasOwnProperty(b))return Sb[b];var d=b.split("."),e=d.length,f;if(a.unwrapPromises||1!==e)if(a.unwrapPromises||2!==e)if(a.csp)f=6>e?Ec(d[0],d[1],d[2],d[3],d[4],c,a):function(b,f){var g=0,h;do h=Ec(d[g++],d[g++],d[g++],d[g++],d[g++],c,a)(b,f),f=s,b=h;while(g<e);return h};else{var g="var p;\n";q(d,function(b,d){fa(b,c);g+="if(s == null) return undefined;\ns="+
(d?"s":'((k&&k.hasOwnProperty("'+b+'"))?k:s)')+'["'+b+'"];\n'+(a.unwrapPromises?'if (s && s.then) {\n pw("'+c.replace(/(["\r\n])/g,"\\$1")+'");\n if (!("$$v" in s)) {\n p=s;\n p.$$v = undefined;\n p.then(function(v) {p.$$v=v;});\n}\n s=s.$$v\n}\n':"")});var g=g+"return s;",h=new Function("s","k","pw",g);h.toString=aa(g);f=a.unwrapPromises?function(a,b){return h(a,b,ta)}:h}else f=ye(d[0],d[1],c);else f=xe(d[0],c);"hasOwnProperty"!==b&&(Sb[b]=f);return f}function Xd(){var b={},a={csp:!1,unwrapPromises:!1,
logPromiseWarnings:!0};this.unwrapPromises=function(b){return z(b)?(a.unwrapPromises=!!b,this):a.unwrapPromises};this.logPromiseWarnings=function(b){return z(b)?(a.logPromiseWarnings=b,this):a.logPromiseWarnings};this.$get=["$filter","$sniffer","$log",function(c,d,e){a.csp=d.csp;ta=function(b){a.logPromiseWarnings&&!Gc.hasOwnProperty(b)&&(Gc[b]=!0,e.warn("[$parse] Promise found in the expression `"+b+"`. Automatic unwrapping of promises in Angular expressions is deprecated."))};return function(d){var e;
switch(typeof d){case "string":if(b.hasOwnProperty(d))return b[d];e=new Tb(a);e=(new bb(e,c,a)).parse(d);"hasOwnProperty"!==d&&(b[d]=e);return e;case "function":return d;default:return w}}}]}function Zd(){this.$get=["$rootScope","$exceptionHandler",function(b,a){return ze(function(a){b.$evalAsync(a)},a)}]}function ze(b,a){function c(a){return a}function d(a){return g(a)}var e=function(){var g=[],k,l;return l={resolve:function(a){if(g){var c=g;g=s;k=f(a);c.length&&b(function(){for(var a,b=0,d=c.length;b<
d;b++)a=c[b],k.then(a[0],a[1],a[2])})}},reject:function(a){l.resolve(h(a))},notify:function(a){if(g){var c=g;g.length&&b(function(){for(var b,d=0,e=c.length;d<e;d++)b=c[d],b[2](a)})}},promise:{then:function(b,f,h){var l=e(),D=function(d){try{l.resolve((Q(b)?b:c)(d))}catch(e){l.reject(e),a(e)}},x=function(b){try{l.resolve((Q(f)?f:d)(b))}catch(c){l.reject(c),a(c)}},t=function(b){try{l.notify((Q(h)?h:c)(b))}catch(d){a(d)}};g?g.push([D,x,t]):k.then(D,x,t);return l.promise},"catch":function(a){return this.then(null,
a)},"finally":function(a){function b(a,c){var d=e();c?d.resolve(a):d.reject(a);return d.promise}function d(e,f){var g=null;try{g=(a||c)()}catch(h){return b(h,!1)}return g&&Q(g.then)?g.then(function(){return b(e,f)},function(a){return b(a,!1)}):b(e,f)}return this.then(function(a){return d(a,!0)},function(a){return d(a,!1)})}}}},f=function(a){return a&&Q(a.then)?a:{then:function(c){var d=e();b(function(){d.resolve(c(a))});return d.promise}}},g=function(a){var b=e();b.reject(a);return b.promise},h=function(c){return{then:function(f,
g){var h=e();b(function(){try{h.resolve((Q(g)?g:d)(c))}catch(b){h.reject(b),a(b)}});return h.promise}}};return{defer:e,reject:g,when:function(h,k,l,n){var p=e(),r,A=function(b){try{return(Q(k)?k:c)(b)}catch(d){return a(d),g(d)}},D=function(b){try{return(Q(l)?l:d)(b)}catch(c){return a(c),g(c)}},x=function(b){try{return(Q(n)?n:c)(b)}catch(d){a(d)}};b(function(){f(h).then(function(a){r||(r=!0,p.resolve(f(a).then(A,D,x)))},function(a){r||(r=!0,p.resolve(D(a)))},function(a){r||p.notify(x(a))})});return p.promise},
all:function(a){var b=e(),c=0,d=K(a)?[]:{};q(a,function(a,e){c++;f(a).then(function(a){d.hasOwnProperty(e)||(d[e]=a,--c||b.resolve(d))},function(a){d.hasOwnProperty(e)||b.reject(a)})});0===c&&b.resolve(d);return b.promise}}}function fe(){this.$get=["$window","$timeout",function(b,a){var c=b.requestAnimationFrame||b.webkitRequestAnimationFrame||b.mozRequestAnimationFrame,d=b.cancelAnimationFrame||b.webkitCancelAnimationFrame||b.mozCancelAnimationFrame||b.webkitCancelRequestAnimationFrame,e=!!c,f=e?
function(a){var b=c(a);return function(){d(b)}}:function(b){var c=a(b,16.66,!1);return function(){a.cancel(c)}};f.supported=e;return f}]}function Yd(){var b=10,a=u("$rootScope"),c=null;this.digestTtl=function(a){arguments.length&&(b=a);return b};this.$get=["$injector","$exceptionHandler","$parse","$browser",function(d,e,f,g){function h(){this.$id=eb();this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;this["this"]=this.$root=this;
this.$$destroyed=!1;this.$$asyncQueue=[];this.$$postDigestQueue=[];this.$$listeners={};this.$$listenerCount={};this.$$isolateBindings={}}function m(b){if(p.$$phase)throw a("inprog",p.$$phase);p.$$phase=b}function k(a,b){var c=f(a);Sa(c,b);return c}function l(a,b,c){do a.$$listenerCount[c]-=b,0===a.$$listenerCount[c]&&delete a.$$listenerCount[c];while(a=a.$parent)}function n(){}h.prototype={constructor:h,$new:function(a){a?(a=new h,a.$root=this.$root,a.$$asyncQueue=this.$$asyncQueue,a.$$postDigestQueue=
this.$$postDigestQueue):(this.$$childScopeClass||(this.$$childScopeClass=function(){this.$$watchers=this.$$nextSibling=this.$$childHead=this.$$childTail=null;this.$$listeners={};this.$$listenerCount={};this.$id=eb();this.$$childScopeClass=null},this.$$childScopeClass.prototype=this),a=new this.$$childScopeClass);a["this"]=a;a.$parent=this;a.$$prevSibling=this.$$childTail;this.$$childHead?this.$$childTail=this.$$childTail.$$nextSibling=a:this.$$childHead=this.$$childTail=a;return a},$watch:function(a,
b,d){var e=k(a,"watch"),f=this.$$watchers,g={fn:b,last:n,get:e,exp:a,eq:!!d};c=null;if(!Q(b)){var h=k(b||w,"listener");g.fn=function(a,b,c){h(c)}}if("string"==typeof a&&e.constant){var m=g.fn;g.fn=function(a,b,c){m.call(this,a,b,c);Oa(f,g)}}f||(f=this.$$watchers=[]);f.unshift(g);return function(){Oa(f,g);c=null}},$watchCollection:function(a,b){var c=this,d,e,g,h=1<b.length,k=0,m=f(a),l=[],n={},p=!0,q=0;return this.$watch(function(){d=m(c);var a,b;if(U(d))if(db(d))for(e!==l&&(e=l,q=e.length=0,k++),
a=d.length,q!==a&&(k++,e.length=q=a),b=0;b<a;b++)e[b]!==e[b]&&d[b]!==d[b]||e[b]===d[b]||(k++,e[b]=d[b]);else{e!==n&&(e=n={},q=0,k++);a=0;for(b in d)d.hasOwnProperty(b)&&(a++,e.hasOwnProperty(b)?e[b]!==d[b]&&(k++,e[b]=d[b]):(q++,e[b]=d[b],k++));if(q>a)for(b in k++,e)e.hasOwnProperty(b)&&!d.hasOwnProperty(b)&&(q--,delete e[b])}else e!==d&&(e=d,k++);return k},function(){p?(p=!1,b(d,d,c)):b(d,g,c);if(h)if(U(d))if(db(d)){g=Array(d.length);for(var a=0;a<d.length;a++)g[a]=d[a]}else for(a in g={},d)Ab.call(d,
a)&&(g[a]=d[a]);else g=d})},$digest:function(){var d,f,g,h,k=this.$$asyncQueue,l=this.$$postDigestQueue,q,v,s=b,L,O=[],y,F,R;m("$digest");c=null;do{v=!1;for(L=this;k.length;){try{R=k.shift(),R.scope.$eval(R.expression)}catch(z){p.$$phase=null,e(z)}c=null}a:do{if(h=L.$$watchers)for(q=h.length;q--;)try{if(d=h[q])if((f=d.get(L))!==(g=d.last)&&!(d.eq?xa(f,g):"number"==typeof f&&"number"==typeof g&&isNaN(f)&&isNaN(g)))v=!0,c=d,d.last=d.eq?Fa(f,null):f,d.fn(f,g===n?f:g,L),5>s&&(y=4-s,O[y]||(O[y]=[]),F=
Q(d.exp)?"fn: "+(d.exp.name||d.exp.toString()):d.exp,F+="; newVal: "+qa(f)+"; oldVal: "+qa(g),O[y].push(F));else if(d===c){v=!1;break a}}catch(C){p.$$phase=null,e(C)}if(!(h=L.$$childHead||L!==this&&L.$$nextSibling))for(;L!==this&&!(h=L.$$nextSibling);)L=L.$parent}while(L=h);if((v||k.length)&&!s--)throw p.$$phase=null,a("infdig",b,qa(O));}while(v||k.length);for(p.$$phase=null;l.length;)try{l.shift()()}catch(T){e(T)}},$destroy:function(){if(!this.$$destroyed){var a=this.$parent;this.$broadcast("$destroy");
this.$$destroyed=!0;this!==p&&(q(this.$$listenerCount,gb(null,l,this)),a.$$childHead==this&&(a.$$childHead=this.$$nextSibling),a.$$childTail==this&&(a.$$childTail=this.$$prevSibling),this.$$prevSibling&&(this.$$prevSibling.$$nextSibling=this.$$nextSibling),this.$$nextSibling&&(this.$$nextSibling.$$prevSibling=this.$$prevSibling),this.$parent=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=this.$root=null,this.$$listeners={},this.$$watchers=this.$$asyncQueue=this.$$postDigestQueue=
[],this.$destroy=this.$digest=this.$apply=w,this.$on=this.$watch=function(){return w})}},$eval:function(a,b){return f(a)(this,b)},$evalAsync:function(a){p.$$phase||p.$$asyncQueue.length||g.defer(function(){p.$$asyncQueue.length&&p.$digest()});this.$$asyncQueue.push({scope:this,expression:a})},$$postDigest:function(a){this.$$postDigestQueue.push(a)},$apply:function(a){try{return m("$apply"),this.$eval(a)}catch(b){e(b)}finally{p.$$phase=null;try{p.$digest()}catch(c){throw e(c),c;}}},$on:function(a,
b){var c=this.$$listeners[a];c||(this.$$listeners[a]=c=[]);c.push(b);var d=this;do d.$$listenerCount[a]||(d.$$listenerCount[a]=0),d.$$listenerCount[a]++;while(d=d.$parent);var e=this;return function(){c[Na(c,b)]=null;l(e,1,a)}},$emit:function(a,b){var c=[],d,f=this,g=!1,h={name:a,targetScope:f,stopPropagation:function(){g=!0},preventDefault:function(){h.defaultPrevented=!0},defaultPrevented:!1},k=[h].concat(ya.call(arguments,1)),m,l;do{d=f.$$listeners[a]||c;h.currentScope=f;m=0;for(l=d.length;m<l;m++)if(d[m])try{d[m].apply(null,
k)}catch(n){e(n)}else d.splice(m,1),m--,l--;if(g)break;f=f.$parent}while(f);return h},$broadcast:function(a,b){for(var c=this,d=this,f={name:a,targetScope:this,preventDefault:function(){f.defaultPrevented=!0},defaultPrevented:!1},g=[f].concat(ya.call(arguments,1)),h,k;c=d;){f.currentScope=c;d=c.$$listeners[a]||[];h=0;for(k=d.length;h<k;h++)if(d[h])try{d[h].apply(null,g)}catch(m){e(m)}else d.splice(h,1),h--,k--;if(!(d=c.$$listenerCount[a]&&c.$$childHead||c!==this&&c.$$nextSibling))for(;c!==this&&!(d=
c.$$nextSibling);)c=c.$parent}return f}};var p=new h;return p}]}function bd(){var b=/^\s*(https?|ftp|mailto|tel|file):/,a=/^\s*(https?|ftp|file):|data:image\//;this.aHrefSanitizationWhitelist=function(a){return z(a)?(b=a,this):b};this.imgSrcSanitizationWhitelist=function(b){return z(b)?(a=b,this):a};this.$get=function(){return function(c,d){var e=d?a:b,f;if(!S||8<=S)if(f=sa(c).href,""!==f&&!f.match(e))return"unsafe:"+f;return c}}}function Ae(b){if("self"===b)return b;if(C(b)){if(-1<b.indexOf("***"))throw ua("iwcard",
b);b=b.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08").replace("\\*\\*",".*").replace("\\*","[^:/.?&;]*");return RegExp("^"+b+"$")}if(fb(b))return RegExp("^"+b.source+"$");throw ua("imatcher");}function Hc(b){var a=[];z(b)&&q(b,function(b){a.push(Ae(b))});return a}function ae(){this.SCE_CONTEXTS=ga;var b=["self"],a=[];this.resourceUrlWhitelist=function(a){arguments.length&&(b=Hc(a));return b};this.resourceUrlBlacklist=function(b){arguments.length&&(a=Hc(b));return a};this.$get=
["$injector",function(c){function d(a){var b=function(a){this.$$unwrapTrustedValue=function(){return a}};a&&(b.prototype=new a);b.prototype.valueOf=function(){return this.$$unwrapTrustedValue()};b.prototype.toString=function(){return this.$$unwrapTrustedValue().toString()};return b}var e=function(a){throw ua("unsafe");};c.has("$sanitize")&&(e=c.get("$sanitize"));var f=d(),g={};g[ga.HTML]=d(f);g[ga.CSS]=d(f);g[ga.URL]=d(f);g[ga.JS]=d(f);g[ga.RESOURCE_URL]=d(g[ga.URL]);return{trustAs:function(a,b){var c=
g.hasOwnProperty(a)?g[a]:null;if(!c)throw ua("icontext",a,b);if(null===b||b===s||""===b)return b;if("string"!==typeof b)throw ua("itype",a);return new c(b)},getTrusted:function(c,d){if(null===d||d===s||""===d)return d;var f=g.hasOwnProperty(c)?g[c]:null;if(f&&d instanceof f)return d.$$unwrapTrustedValue();if(c===ga.RESOURCE_URL){var f=sa(d.toString()),l,n,p=!1;l=0;for(n=b.length;l<n;l++)if("self"===b[l]?Mb(f):b[l].exec(f.href)){p=!0;break}if(p)for(l=0,n=a.length;l<n;l++)if("self"===a[l]?Mb(f):a[l].exec(f.href)){p=
!1;break}if(p)return d;throw ua("insecurl",d.toString());}if(c===ga.HTML)return e(d);throw ua("unsafe");},valueOf:function(a){return a instanceof f?a.$$unwrapTrustedValue():a}}}]}function $d(){var b=!0;this.enabled=function(a){arguments.length&&(b=!!a);return b};this.$get=["$parse","$sniffer","$sceDelegate",function(a,c,d){if(b&&c.msie&&8>c.msieDocumentMode)throw ua("iequirks");var e=ka(ga);e.isEnabled=function(){return b};e.trustAs=d.trustAs;e.getTrusted=d.getTrusted;e.valueOf=d.valueOf;b||(e.trustAs=
e.getTrusted=function(a,b){return b},e.valueOf=Ea);e.parseAs=function(b,c){var d=a(c);return d.literal&&d.constant?d:function(a,c){return e.getTrusted(b,d(a,c))}};var f=e.parseAs,g=e.getTrusted,h=e.trustAs;q(ga,function(a,b){var c=J(b);e[Ua("parse_as_"+c)]=function(b){return f(a,b)};e[Ua("get_trusted_"+c)]=function(b){return g(a,b)};e[Ua("trust_as_"+c)]=function(b){return h(a,b)}});return e}]}function be(){this.$get=["$window","$document",function(b,a){var c={},d=Y((/android (\d+)/.exec(J((b.navigator||
{}).userAgent))||[])[1]),e=/Boxee/i.test((b.navigator||{}).userAgent),f=a[0]||{},g=f.documentMode,h,m=/^(Moz|webkit|O|ms)(?=[A-Z])/,k=f.body&&f.body.style,l=!1,n=!1;if(k){for(var p in k)if(l=m.exec(p)){h=l[0];h=h.substr(0,1).toUpperCase()+h.substr(1);break}h||(h="WebkitOpacity"in k&&"webkit");l=!!("transition"in k||h+"Transition"in k);n=!!("animation"in k||h+"Animation"in k);!d||l&&n||(l=C(f.body.style.webkitTransition),n=C(f.body.style.webkitAnimation))}return{history:!(!b.history||!b.history.pushState||
4>d||e),hashchange:"onhashchange"in b&&(!g||7<g),hasEvent:function(a){if("input"==a&&9==S)return!1;if(H(c[a])){var b=f.createElement("div");c[a]="on"+a in b}return c[a]},csp:$b(),vendorPrefix:h,transitions:l,animations:n,android:d,msie:S,msieDocumentMode:g}}]}function de(){this.$get=["$rootScope","$browser","$q","$exceptionHandler",function(b,a,c,d){function e(e,h,m){var k=c.defer(),l=k.promise,n=z(m)&&!m;h=a.defer(function(){try{k.resolve(e())}catch(a){k.reject(a),d(a)}finally{delete f[l.$$timeoutId]}n||
b.$apply()},h);l.$$timeoutId=h;f[h]=k;return l}var f={};e.cancel=function(b){return b&&b.$$timeoutId in f?(f[b.$$timeoutId].reject("canceled"),delete f[b.$$timeoutId],a.defer.cancel(b.$$timeoutId)):!1};return e}]}function sa(b,a){var c=b;S&&(X.setAttribute("href",c),c=X.href);X.setAttribute("href",c);return{href:X.href,protocol:X.protocol?X.protocol.replace(/:$/,""):"",host:X.host,search:X.search?X.search.replace(/^\?/,""):"",hash:X.hash?X.hash.replace(/^#/,""):"",hostname:X.hostname,port:X.port,
pathname:"/"===X.pathname.charAt(0)?X.pathname:"/"+X.pathname}}function Mb(b){b=C(b)?sa(b):b;return b.protocol===Ic.protocol&&b.host===Ic.host}function ee(){this.$get=aa(P)}function kc(b){function a(d,e){if(U(d)){var f={};q(d,function(b,c){f[c]=a(c,b)});return f}return b.factory(d+c,e)}var c="Filter";this.register=a;this.$get=["$injector",function(a){return function(b){return a.get(b+c)}}];a("currency",Jc);a("date",Kc);a("filter",Be);a("json",Ce);a("limitTo",De);a("lowercase",Ee);a("number",Lc);a("orderBy",
Mc);a("uppercase",Fe)}function Be(){return function(b,a,c){if(!K(b))return b;var d=typeof c,e=[];e.check=function(a){for(var b=0;b<e.length;b++)if(!e[b](a))return!1;return!0};"function"!==d&&(c="boolean"===d&&c?function(a,b){return Ra.equals(a,b)}:function(a,b){if(a&&b&&"object"===typeof a&&"object"===typeof b){for(var d in a)if("$"!==d.charAt(0)&&Ab.call(a,d)&&c(a[d],b[d]))return!0;return!1}b=(""+b).toLowerCase();return-1<(""+a).toLowerCase().indexOf(b)});var f=function(a,b){if("string"==typeof b&&
"!"===b.charAt(0))return!f(a,b.substr(1));switch(typeof a){case "boolean":case "number":case "string":return c(a,b);case "object":switch(typeof b){case "object":return c(a,b);default:for(var d in a)if("$"!==d.charAt(0)&&f(a[d],b))return!0}return!1;case "array":for(d=0;d<a.length;d++)if(f(a[d],b))return!0;return!1;default:return!1}};switch(typeof a){case "boolean":case "number":case "string":a={$:a};case "object":for(var g in a)(function(b){"undefined"!=typeof a[b]&&e.push(function(c){return f("$"==
b?c:c&&c[b],a[b])})})(g);break;case "function":e.push(a);break;default:return b}d=[];for(g=0;g<b.length;g++){var h=b[g];e.check(h)&&d.push(h)}return d}}function Jc(b){var a=b.NUMBER_FORMATS;return function(b,d){H(d)&&(d=a.CURRENCY_SYM);return Nc(b,a.PATTERNS[1],a.GROUP_SEP,a.DECIMAL_SEP,2).replace(/\u00A4/g,d)}}function Lc(b){var a=b.NUMBER_FORMATS;return function(b,d){return Nc(b,a.PATTERNS[0],a.GROUP_SEP,a.DECIMAL_SEP,d)}}function Nc(b,a,c,d,e){if(null==b||!isFinite(b)||U(b))return"";var f=0>b;
b=Math.abs(b);var g=b+"",h="",m=[],k=!1;if(-1!==g.indexOf("e")){var l=g.match(/([\d\.]+)e(-?)(\d+)/);l&&"-"==l[2]&&l[3]>e+1?g="0":(h=g,k=!0)}if(k)0<e&&(-1<b&&1>b)&&(h=b.toFixed(e));else{g=(g.split(Oc)[1]||"").length;H(e)&&(e=Math.min(Math.max(a.minFrac,g),a.maxFrac));g=Math.pow(10,e+1);b=Math.floor(b*g+5)/g;b=(""+b).split(Oc);g=b[0];b=b[1]||"";var l=0,n=a.lgSize,p=a.gSize;if(g.length>=n+p)for(l=g.length-n,k=0;k<l;k++)0===(l-k)%p&&0!==k&&(h+=c),h+=g.charAt(k);for(k=l;k<g.length;k++)0===(g.length-k)%
n&&0!==k&&(h+=c),h+=g.charAt(k);for(;b.length<e;)b+="0";e&&"0"!==e&&(h+=d+b.substr(0,e))}m.push(f?a.negPre:a.posPre);m.push(h);m.push(f?a.negSuf:a.posSuf);return m.join("")}function Ub(b,a,c){var d="";0>b&&(d="-",b=-b);for(b=""+b;b.length<a;)b="0"+b;c&&(b=b.substr(b.length-a));return d+b}function $(b,a,c,d){c=c||0;return function(e){e=e["get"+b]();if(0<c||e>-c)e+=c;0===e&&-12==c&&(e=12);return Ub(e,a,d)}}function tb(b,a){return function(c,d){var e=c["get"+b](),f=Ga(a?"SHORT"+b:b);return d[f][e]}}
function Kc(b){function a(a){var b;if(b=a.match(c)){a=new Date(0);var f=0,g=0,h=b[8]?a.setUTCFullYear:a.setFullYear,m=b[8]?a.setUTCHours:a.setHours;b[9]&&(f=Y(b[9]+b[10]),g=Y(b[9]+b[11]));h.call(a,Y(b[1]),Y(b[2])-1,Y(b[3]));f=Y(b[4]||0)-f;g=Y(b[5]||0)-g;h=Y(b[6]||0);b=Math.round(1E3*parseFloat("0."+(b[7]||0)));m.call(a,f,g,h,b)}return a}var c=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;return function(c,e){var f="",g=[],h,m;e=e||"mediumDate";
e=b.DATETIME_FORMATS[e]||e;C(c)&&(c=Ge.test(c)?Y(c):a(c));zb(c)&&(c=new Date(c));if(!Ma(c))return c;for(;e;)(m=He.exec(e))?(g=g.concat(ya.call(m,1)),e=g.pop()):(g.push(e),e=null);q(g,function(a){h=Ie[a];f+=h?h(c,b.DATETIME_FORMATS):a.replace(/(^'|'$)/g,"").replace(/''/g,"'")});return f}}function Ce(){return function(b){return qa(b,!0)}}function De(){return function(b,a){if(!K(b)&&!C(b))return b;a=Infinity===Math.abs(Number(a))?Number(a):Y(a);if(C(b))return a?0<=a?b.slice(0,a):b.slice(a,b.length):
"";var c=[],d,e;a>b.length?a=b.length:a<-b.length&&(a=-b.length);0<a?(d=0,e=a):(d=b.length+a,e=b.length);for(;d<e;d++)c.push(b[d]);return c}}function Mc(b){return function(a,c,d){function e(a,b){return Qa(b)?function(b,c){return a(c,b)}:a}function f(a,b){var c=typeof a,d=typeof b;return c==d?("string"==c&&(a=a.toLowerCase(),b=b.toLowerCase()),a===b?0:a<b?-1:1):c<d?-1:1}if(!K(a)||!c)return a;c=K(c)?c:[c];c=Uc(c,function(a){var c=!1,d=a||Ea;if(C(a)){if("+"==a.charAt(0)||"-"==a.charAt(0))c="-"==a.charAt(0),
a=a.substring(1);d=b(a);if(d.constant){var g=d();return e(function(a,b){return f(a[g],b[g])},c)}}return e(function(a,b){return f(d(a),d(b))},c)});for(var g=[],h=0;h<a.length;h++)g.push(a[h]);return g.sort(e(function(a,b){for(var d=0;d<c.length;d++){var e=c[d](a,b);if(0!==e)return e}return 0},d))}}function va(b){Q(b)&&(b={link:b});b.restrict=b.restrict||"AC";return aa(b)}function Pc(b,a,c,d){function e(a,c){c=c?"-"+ib(c,"-"):"";d.removeClass(b,(a?ub:vb)+c);d.addClass(b,(a?vb:ub)+c)}var f=this,g=b.parent().controller("form")||
wb,h=0,m=f.$error={},k=[];f.$name=a.name||a.ngForm;f.$dirty=!1;f.$pristine=!0;f.$valid=!0;f.$invalid=!1;g.$addControl(f);b.addClass(La);e(!0);f.$addControl=function(a){Aa(a.$name,"input");k.push(a);a.$name&&(f[a.$name]=a)};f.$removeControl=function(a){a.$name&&f[a.$name]===a&&delete f[a.$name];q(m,function(b,c){f.$setValidity(c,!0,a)});Oa(k,a)};f.$setValidity=function(a,b,c){var d=m[a];if(b)d&&(Oa(d,c),d.length||(h--,h||(e(b),f.$valid=!0,f.$invalid=!1),m[a]=!1,e(!0,a),g.$setValidity(a,!0,f)));else{h||
e(b);if(d){if(-1!=Na(d,c))return}else m[a]=d=[],h++,e(!1,a),g.$setValidity(a,!1,f);d.push(c);f.$valid=!1;f.$invalid=!0}};f.$setDirty=function(){d.removeClass(b,La);d.addClass(b,xb);f.$dirty=!0;f.$pristine=!1;g.$setDirty()};f.$setPristine=function(){d.removeClass(b,xb);d.addClass(b,La);f.$dirty=!1;f.$pristine=!0;q(k,function(a){a.$setPristine()})}}function pa(b,a,c,d){b.$setValidity(a,c);return c?d:s}function Je(b,a,c){var d=c.prop("validity");U(d)&&b.$parsers.push(function(c){if(b.$error[a]||!(d.badInput||
d.customError||d.typeMismatch)||d.valueMissing)return c;b.$setValidity(a,!1)})}function yb(b,a,c,d,e,f){var g=a.prop("validity"),h=a[0].placeholder,m={};if(!e.android){var k=!1;a.on("compositionstart",function(a){k=!0});a.on("compositionend",function(){k=!1;l()})}var l=function(e){if(!k){var f=a.val();if(S&&"input"===(e||m).type&&a[0].placeholder!==h)h=a[0].placeholder;else if(Qa(c.ngTrim||"T")&&(f=ba(f)),d.$viewValue!==f||g&&""===f&&!g.valueMissing)b.$$phase?d.$setViewValue(f):b.$apply(function(){d.$setViewValue(f)})}};
if(e.hasEvent("input"))a.on("input",l);else{var n,p=function(){n||(n=f.defer(function(){l();n=null}))};a.on("keydown",function(a){a=a.keyCode;91===a||(15<a&&19>a||37<=a&&40>=a)||p()});if(e.hasEvent("paste"))a.on("paste cut",p)}a.on("change",l);d.$render=function(){a.val(d.$isEmpty(d.$viewValue)?"":d.$viewValue)};var r=c.ngPattern;r&&((e=r.match(/^\/(.*)\/([gim]*)$/))?(r=RegExp(e[1],e[2]),e=function(a){return pa(d,"pattern",d.$isEmpty(a)||r.test(a),a)}):e=function(c){var e=b.$eval(r);if(!e||!e.test)throw u("ngPattern")("noregexp",
r,e,ha(a));return pa(d,"pattern",d.$isEmpty(c)||e.test(c),c)},d.$formatters.push(e),d.$parsers.push(e));if(c.ngMinlength){var q=Y(c.ngMinlength);e=function(a){return pa(d,"minlength",d.$isEmpty(a)||a.length>=q,a)};d.$parsers.push(e);d.$formatters.push(e)}if(c.ngMaxlength){var D=Y(c.ngMaxlength);e=function(a){return pa(d,"maxlength",d.$isEmpty(a)||a.length<=D,a)};d.$parsers.push(e);d.$formatters.push(e)}}function Vb(b,a){b="ngClass"+b;return["$animate",function(c){function d(a,b){var c=[],d=0;a:for(;d<
a.length;d++){for(var e=a[d],l=0;l<b.length;l++)if(e==b[l])continue a;c.push(e)}return c}function e(a){if(!K(a)){if(C(a))return a.split(" ");if(U(a)){var b=[];q(a,function(a,c){a&&(b=b.concat(c.split(" ")))});return b}}return a}return{restrict:"AC",link:function(f,g,h){function m(a,b){var c=g.data("$classCounts")||{},d=[];q(a,function(a){if(0<b||c[a])c[a]=(c[a]||0)+b,c[a]===+(0<b)&&d.push(a)});g.data("$classCounts",c);return d.join(" ")}function k(b){if(!0===a||f.$index%2===a){var k=e(b||[]);if(!l){var r=
m(k,1);h.$addClass(r)}else if(!xa(b,l)){var q=e(l),r=d(k,q),k=d(q,k),k=m(k,-1),r=m(r,1);0===r.length?c.removeClass(g,k):0===k.length?c.addClass(g,r):c.setClass(g,r,k)}}l=ka(b)}var l;f.$watch(h[b],k,!0);h.$observe("class",function(a){k(f.$eval(h[b]))});"ngClass"!==b&&f.$watch("$index",function(c,d){var g=c&1;if(g!==(d&1)){var k=e(f.$eval(h[b]));g===a?(g=m(k,1),h.$addClass(g)):(g=m(k,-1),h.$removeClass(g))}})}}}]}var J=function(b){return C(b)?b.toLowerCase():b},Ab=Object.prototype.hasOwnProperty,Ga=
function(b){return C(b)?b.toUpperCase():b},S,y,Ba,ya=[].slice,Ke=[].push,wa=Object.prototype.toString,Pa=u("ng"),Ra=P.angular||(P.angular={}),Ta,Ka,ja=["0","0","0"];S=Y((/msie (\d+)/.exec(J(navigator.userAgent))||[])[1]);isNaN(S)&&(S=Y((/trident\/.*; rv:(\d+)/.exec(J(navigator.userAgent))||[])[1]));w.$inject=[];Ea.$inject=[];var ba=function(){return String.prototype.trim?function(b){return C(b)?b.trim():b}:function(b){return C(b)?b.replace(/^\s\s*/,"").replace(/\s\s*$/,""):b}}();Ka=9>S?function(b){b=
b.nodeName?b:b[0];return b.scopeName&&"HTML"!=b.scopeName?Ga(b.scopeName+":"+b.nodeName):b.nodeName}:function(b){return b.nodeName?b.nodeName:b[0].nodeName};var Xc=/[A-Z]/g,$c={full:"1.2.17",major:1,minor:2,dot:17,codeName:"quantum-disentanglement"},Wa=M.cache={},jb=M.expando="ng"+(new Date).getTime(),me=1,qb=P.document.addEventListener?function(b,a,c){b.addEventListener(a,c,!1)}:function(b,a,c){b.attachEvent("on"+a,c)},Va=P.document.removeEventListener?function(b,a,c){b.removeEventListener(a,c,!1)}:
function(b,a,c){b.detachEvent("on"+a,c)};M._data=function(b){return this.cache[b[this.expando]]||{}};var he=/([\:\-\_]+(.))/g,ie=/^moz([A-Z])/,Gb=u("jqLite"),je=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,Hb=/<|&#?\w+;/,ke=/<([\w:]+)/,le=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,da={option:[1,'<select multiple="multiple">',"</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>",
"</tr></tbody></table>"],_default:[0,"",""]};da.optgroup=da.option;da.tbody=da.tfoot=da.colgroup=da.caption=da.thead;da.th=da.td;var Ja=M.prototype={ready:function(b){function a(){c||(c=!0,b())}var c=!1;"complete"===V.readyState?setTimeout(a):(this.on("DOMContentLoaded",a),M(P).on("load",a))},toString:function(){var b=[];q(this,function(a){b.push(""+a)});return"["+b.join(", ")+"]"},eq:function(b){return 0<=b?y(this[b]):y(this[this.length+b])},length:0,push:Ke,sort:[].sort,splice:[].splice},nb={};
q("multiple selected checked disabled readOnly required open".split(" "),function(b){nb[J(b)]=b});var rc={};q("input select option textarea button form details".split(" "),function(b){rc[Ga(b)]=!0});q({data:nc,inheritedData:mb,scope:function(b){return y(b).data("$scope")||mb(b.parentNode||b,["$isolateScope","$scope"])},isolateScope:function(b){return y(b).data("$isolateScope")||y(b).data("$isolateScopeNoTemplate")},controller:oc,injector:function(b){return mb(b,"$injector")},removeAttr:function(b,
a){b.removeAttribute(a)},hasClass:Kb,css:function(b,a,c){a=Ua(a);if(z(c))b.style[a]=c;else{var d;8>=S&&(d=b.currentStyle&&b.currentStyle[a],""===d&&(d="auto"));d=d||b.style[a];8>=S&&(d=""===d?s:d);return d}},attr:function(b,a,c){var d=J(a);if(nb[d])if(z(c))c?(b[a]=!0,b.setAttribute(a,d)):(b[a]=!1,b.removeAttribute(d));else return b[a]||(b.attributes.getNamedItem(a)||w).specified?d:s;else if(z(c))b.setAttribute(a,c);else if(b.getAttribute)return b=b.getAttribute(a,2),null===b?s:b},prop:function(b,
a,c){if(z(c))b[a]=c;else return b[a]},text:function(){function b(b,d){var e=a[b.nodeType];if(H(d))return e?b[e]:"";b[e]=d}var a=[];9>S?(a[1]="innerText",a[3]="nodeValue"):a[1]=a[3]="textContent";b.$dv="";return b}(),val:function(b,a){if(H(a)){if("SELECT"===Ka(b)&&b.multiple){var c=[];q(b.options,function(a){a.selected&&c.push(a.value||a.text)});return 0===c.length?null:c}return b.value}b.value=a},html:function(b,a){if(H(a))return b.innerHTML;for(var c=0,d=b.childNodes;c<d.length;c++)Ha(d[c]);b.innerHTML=
a},empty:pc},function(b,a){M.prototype[a]=function(a,d){var e,f;if(b!==pc&&(2==b.length&&b!==Kb&&b!==oc?a:d)===s){if(U(a)){for(e=0;e<this.length;e++)if(b===nc)b(this[e],a);else for(f in a)b(this[e],f,a[f]);return this}e=b.$dv;f=e===s?Math.min(this.length,1):this.length;for(var g=0;g<f;g++){var h=b(this[g],a,d);e=e?e+h:h}return e}for(e=0;e<this.length;e++)b(this[e],a,d);return this}});q({removeData:lc,dealoc:Ha,on:function a(c,d,e,f){if(z(f))throw Gb("onargs");var g=la(c,"events"),h=la(c,"handle");
g||la(c,"events",g={});h||la(c,"handle",h=ne(c,g));q(d.split(" "),function(d){var f=g[d];if(!f){if("mouseenter"==d||"mouseleave"==d){var l=V.body.contains||V.body.compareDocumentPosition?function(a,c){var d=9===a.nodeType?a.documentElement:a,e=c&&c.parentNode;return a===e||!!(e&&1===e.nodeType&&(d.contains?d.contains(e):a.compareDocumentPosition&&a.compareDocumentPosition(e)&16))}:function(a,c){if(c)for(;c=c.parentNode;)if(c===a)return!0;return!1};g[d]=[];a(c,{mouseleave:"mouseout",mouseenter:"mouseover"}[d],
function(a){var c=a.relatedTarget;c&&(c===this||l(this,c))||h(a,d)})}else qb(c,d,h),g[d]=[];f=g[d]}f.push(e)})},off:mc,one:function(a,c,d){a=y(a);a.on(c,function f(){a.off(c,d);a.off(c,f)});a.on(c,d)},replaceWith:function(a,c){var d,e=a.parentNode;Ha(a);q(new M(c),function(c){d?e.insertBefore(c,d.nextSibling):e.replaceChild(c,a);d=c})},children:function(a){var c=[];q(a.childNodes,function(a){1===a.nodeType&&c.push(a)});return c},contents:function(a){return a.contentDocument||a.childNodes||[]},append:function(a,
c){q(new M(c),function(c){1!==a.nodeType&&11!==a.nodeType||a.appendChild(c)})},prepend:function(a,c){if(1===a.nodeType){var d=a.firstChild;q(new M(c),function(c){a.insertBefore(c,d)})}},wrap:function(a,c){c=y(c)[0];var d=a.parentNode;d&&d.replaceChild(c,a);c.appendChild(a)},remove:function(a){Ha(a);var c=a.parentNode;c&&c.removeChild(a)},after:function(a,c){var d=a,e=a.parentNode;q(new M(c),function(a){e.insertBefore(a,d.nextSibling);d=a})},addClass:lb,removeClass:kb,toggleClass:function(a,c,d){c&&
q(c.split(" "),function(c){var f=d;H(f)&&(f=!Kb(a,c));(f?lb:kb)(a,c)})},parent:function(a){return(a=a.parentNode)&&11!==a.nodeType?a:null},next:function(a){if(a.nextElementSibling)return a.nextElementSibling;for(a=a.nextSibling;null!=a&&1!==a.nodeType;)a=a.nextSibling;return a},find:function(a,c){return a.getElementsByTagName?a.getElementsByTagName(c):[]},clone:Jb,triggerHandler:function(a,c,d){c=(la(a,"events")||{})[c];d=d||[];var e=[{preventDefault:w,stopPropagation:w}];q(c,function(c){c.apply(a,
e.concat(d))})}},function(a,c){M.prototype[c]=function(c,e,f){for(var g,h=0;h<this.length;h++)H(g)?(g=a(this[h],c,e,f),z(g)&&(g=y(g))):Ib(g,a(this[h],c,e,f));return z(g)?g:this};M.prototype.bind=M.prototype.on;M.prototype.unbind=M.prototype.off});Xa.prototype={put:function(a,c){this[Ia(a)]=c},get:function(a){return this[Ia(a)]},remove:function(a){var c=this[a=Ia(a)];delete this[a];return c}};var pe=/^function\s*[^\(]*\(\s*([^\)]*)\)/m,qe=/,/,re=/^\s*(_?)(\S+?)\1\s*$/,oe=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
Ya=u("$injector"),Le=u("$animate"),Ld=["$provide",function(a){this.$$selectors={};this.register=function(c,d){var e=c+"-animation";if(c&&"."!=c.charAt(0))throw Le("notcsel",c);this.$$selectors[c.substr(1)]=e;a.factory(e,d)};this.classNameFilter=function(a){1===arguments.length&&(this.$$classNameFilter=a instanceof RegExp?a:null);return this.$$classNameFilter};this.$get=["$timeout","$$asyncCallback",function(a,d){return{enter:function(a,c,g,h){g?g.after(a):(c&&c[0]||(c=g.parent()),c.append(a));h&&
d(h)},leave:function(a,c){a.remove();c&&d(c)},move:function(a,c,d,h){this.enter(a,c,d,h)},addClass:function(a,c,g){c=C(c)?c:K(c)?c.join(" "):"";q(a,function(a){lb(a,c)});g&&d(g)},removeClass:function(a,c,g){c=C(c)?c:K(c)?c.join(" "):"";q(a,function(a){kb(a,c)});g&&d(g)},setClass:function(a,c,g,h){q(a,function(a){lb(a,c);kb(a,g)});h&&d(h)},enabled:w}}]}],ia=u("$compile");gc.$inject=["$provide","$$sanitizeUriProvider"];var te=/^(x[\:\-_]|data[\:\-_])/i,zc=u("$interpolate"),Me=/^([^\?#]*)(\?([^#]*))?(#(.*))?$/,
we={http:80,https:443,ftp:21},Pb=u("$location");Rb.prototype=Qb.prototype=Cc.prototype={$$html5:!1,$$replace:!1,absUrl:rb("$$absUrl"),url:function(a,c){if(H(a))return this.$$url;var d=Me.exec(a);d[1]&&this.path(decodeURIComponent(d[1]));(d[2]||d[1])&&this.search(d[3]||"");this.hash(d[5]||"",c);return this},protocol:rb("$$protocol"),host:rb("$$host"),port:rb("$$port"),path:Dc("$$path",function(a){return"/"==a.charAt(0)?a:"/"+a}),search:function(a,c){switch(arguments.length){case 0:return this.$$search;
case 1:if(C(a))this.$$search=cc(a);else if(U(a))this.$$search=a;else throw Pb("isrcharg");break;default:H(c)||null===c?delete this.$$search[a]:this.$$search[a]=c}this.$$compose();return this},hash:Dc("$$hash",Ea),replace:function(){this.$$replace=!0;return this}};var Ca=u("$parse"),Gc={},ta,cb={"null":function(){return null},"true":function(){return!0},"false":function(){return!1},undefined:w,"+":function(a,c,d,e){d=d(a,c);e=e(a,c);return z(d)?z(e)?d+e:d:z(e)?e:s},"-":function(a,c,d,e){d=d(a,c);e=
e(a,c);return(z(d)?d:0)-(z(e)?e:0)},"*":function(a,c,d,e){return d(a,c)*e(a,c)},"/":function(a,c,d,e){return d(a,c)/e(a,c)},"%":function(a,c,d,e){return d(a,c)%e(a,c)},"^":function(a,c,d,e){return d(a,c)^e(a,c)},"=":w,"===":function(a,c,d,e){return d(a,c)===e(a,c)},"!==":function(a,c,d,e){return d(a,c)!==e(a,c)},"==":function(a,c,d,e){return d(a,c)==e(a,c)},"!=":function(a,c,d,e){return d(a,c)!=e(a,c)},"<":function(a,c,d,e){return d(a,c)<e(a,c)},">":function(a,c,d,e){return d(a,c)>e(a,c)},"<=":function(a,
c,d,e){return d(a,c)<=e(a,c)},">=":function(a,c,d,e){return d(a,c)>=e(a,c)},"&&":function(a,c,d,e){return d(a,c)&&e(a,c)},"||":function(a,c,d,e){return d(a,c)||e(a,c)},"&":function(a,c,d,e){return d(a,c)&e(a,c)},"|":function(a,c,d,e){return e(a,c)(a,c,d(a,c))},"!":function(a,c,d){return!d(a,c)}},Ne={n:"\n",f:"\f",r:"\r",t:"\t",v:"\v","'":"'",'"':'"'},Tb=function(a){this.options=a};Tb.prototype={constructor:Tb,lex:function(a){this.text=a;this.index=0;this.ch=s;this.lastCh=":";for(this.tokens=[];this.index<
this.text.length;){this.ch=this.text.charAt(this.index);if(this.is("\"'"))this.readString(this.ch);else if(this.isNumber(this.ch)||this.is(".")&&this.isNumber(this.peek()))this.readNumber();else if(this.isIdent(this.ch))this.readIdent();else if(this.is("(){}[].,;:?"))this.tokens.push({index:this.index,text:this.ch}),this.index++;else if(this.isWhitespace(this.ch)){this.index++;continue}else{a=this.ch+this.peek();var c=a+this.peek(2),d=cb[this.ch],e=cb[a],f=cb[c];f?(this.tokens.push({index:this.index,
text:c,fn:f}),this.index+=3):e?(this.tokens.push({index:this.index,text:a,fn:e}),this.index+=2):d?(this.tokens.push({index:this.index,text:this.ch,fn:d}),this.index+=1):this.throwError("Unexpected next character ",this.index,this.index+1)}this.lastCh=this.ch}return this.tokens},is:function(a){return-1!==a.indexOf(this.ch)},was:function(a){return-1!==a.indexOf(this.lastCh)},peek:function(a){a=a||1;return this.index+a<this.text.length?this.text.charAt(this.index+a):!1},isNumber:function(a){return"0"<=
a&&"9">=a},isWhitespace:function(a){return" "===a||"\r"===a||"\t"===a||"\n"===a||"\v"===a||"\u00a0"===a},isIdent:function(a){return"a"<=a&&"z">=a||"A"<=a&&"Z">=a||"_"===a||"$"===a},isExpOperator:function(a){return"-"===a||"+"===a||this.isNumber(a)},throwError:function(a,c,d){d=d||this.index;c=z(c)?"s "+c+"-"+this.index+" ["+this.text.substring(c,d)+"]":" "+d;throw Ca("lexerr",a,c,this.text);},readNumber:function(){for(var a="",c=this.index;this.index<this.text.length;){var d=J(this.text.charAt(this.index));
if("."==d||this.isNumber(d))a+=d;else{var e=this.peek();if("e"==d&&this.isExpOperator(e))a+=d;else if(this.isExpOperator(d)&&e&&this.isNumber(e)&&"e"==a.charAt(a.length-1))a+=d;else if(!this.isExpOperator(d)||e&&this.isNumber(e)||"e"!=a.charAt(a.length-1))break;else this.throwError("Invalid exponent")}this.index++}a*=1;this.tokens.push({index:c,text:a,literal:!0,constant:!0,fn:function(){return a}})},readIdent:function(){for(var a=this,c="",d=this.index,e,f,g,h;this.index<this.text.length;){h=this.text.charAt(this.index);
if("."===h||this.isIdent(h)||this.isNumber(h))"."===h&&(e=this.index),c+=h;else break;this.index++}if(e)for(f=this.index;f<this.text.length;){h=this.text.charAt(f);if("("===h){g=c.substr(e-d+1);c=c.substr(0,e-d);this.index=f;break}if(this.isWhitespace(h))f++;else break}d={index:d,text:c};if(cb.hasOwnProperty(c))d.fn=cb[c],d.literal=!0,d.constant=!0;else{var m=Fc(c,this.options,this.text);d.fn=E(function(a,c){return m(a,c)},{assign:function(d,e){return sb(d,c,e,a.text,a.options)}})}this.tokens.push(d);
g&&(this.tokens.push({index:e,text:"."}),this.tokens.push({index:e+1,text:g}))},readString:function(a){var c=this.index;this.index++;for(var d="",e=a,f=!1;this.index<this.text.length;){var g=this.text.charAt(this.index),e=e+g;if(f)"u"===g?(g=this.text.substring(this.index+1,this.index+5),g.match(/[\da-f]{4}/i)||this.throwError("Invalid unicode escape [\\u"+g+"]"),this.index+=4,d+=String.fromCharCode(parseInt(g,16))):d=(f=Ne[g])?d+f:d+g,f=!1;else if("\\"===g)f=!0;else{if(g===a){this.index++;this.tokens.push({index:c,
text:e,string:d,literal:!0,constant:!0,fn:function(){return d}});return}d+=g}this.index++}this.throwError("Unterminated quote",c)}};var bb=function(a,c,d){this.lexer=a;this.$filter=c;this.options=d};bb.ZERO=E(function(){return 0},{constant:!0});bb.prototype={constructor:bb,parse:function(a){this.text=a;this.tokens=this.lexer.lex(a);a=this.statements();0!==this.tokens.length&&this.throwError("is an unexpected token",this.tokens[0]);a.literal=!!a.literal;a.constant=!!a.constant;return a},primary:function(){var a;
if(this.expect("("))a=this.filterChain(),this.consume(")");else if(this.expect("["))a=this.arrayDeclaration();else if(this.expect("{"))a=this.object();else{var c=this.expect();(a=c.fn)||this.throwError("not a primary expression",c);a.literal=!!c.literal;a.constant=!!c.constant}for(var d;c=this.expect("(","[",".");)"("===c.text?(a=this.functionCall(a,d),d=null):"["===c.text?(d=a,a=this.objectIndex(a)):"."===c.text?(d=a,a=this.fieldAccess(a)):this.throwError("IMPOSSIBLE");return a},throwError:function(a,
c){throw Ca("syntax",c.text,a,c.index+1,this.text,this.text.substring(c.index));},peekToken:function(){if(0===this.tokens.length)throw Ca("ueoe",this.text);return this.tokens[0]},peek:function(a,c,d,e){if(0<this.tokens.length){var f=this.tokens[0],g=f.text;if(g===a||g===c||g===d||g===e||!(a||c||d||e))return f}return!1},expect:function(a,c,d,e){return(a=this.peek(a,c,d,e))?(this.tokens.shift(),a):!1},consume:function(a){this.expect(a)||this.throwError("is unexpected, expecting ["+a+"]",this.peek())},
unaryFn:function(a,c){return E(function(d,e){return a(d,e,c)},{constant:c.constant})},ternaryFn:function(a,c,d){return E(function(e,f){return a(e,f)?c(e,f):d(e,f)},{constant:a.constant&&c.constant&&d.constant})},binaryFn:function(a,c,d){return E(function(e,f){return c(e,f,a,d)},{constant:a.constant&&d.constant})},statements:function(){for(var a=[];;)if(0<this.tokens.length&&!this.peek("}",")",";","]")&&a.push(this.filterChain()),!this.expect(";"))return 1===a.length?a[0]:function(c,d){for(var e,f=
0;f<a.length;f++){var g=a[f];g&&(e=g(c,d))}return e}},filterChain:function(){for(var a=this.expression(),c;;)if(c=this.expect("|"))a=this.binaryFn(a,c.fn,this.filter());else return a},filter:function(){for(var a=this.expect(),c=this.$filter(a.text),d=[];;)if(a=this.expect(":"))d.push(this.expression());else{var e=function(a,e,h){h=[h];for(var m=0;m<d.length;m++)h.push(d[m](a,e));return c.apply(a,h)};return function(){return e}}},expression:function(){return this.assignment()},assignment:function(){var a=
this.ternary(),c,d;return(d=this.expect("="))?(a.assign||this.throwError("implies assignment but ["+this.text.substring(0,d.index)+"] can not be assigned to",d),c=this.ternary(),function(d,f){return a.assign(d,c(d,f),f)}):a},ternary:function(){var a=this.logicalOR(),c,d;if(this.expect("?")){c=this.ternary();if(d=this.expect(":"))return this.ternaryFn(a,c,this.ternary());this.throwError("expected :",d)}else return a},logicalOR:function(){for(var a=this.logicalAND(),c;;)if(c=this.expect("||"))a=this.binaryFn(a,
c.fn,this.logicalAND());else return a},logicalAND:function(){var a=this.equality(),c;if(c=this.expect("&&"))a=this.binaryFn(a,c.fn,this.logicalAND());return a},equality:function(){var a=this.relational(),c;if(c=this.expect("==","!=","===","!=="))a=this.binaryFn(a,c.fn,this.equality());return a},relational:function(){var a=this.additive(),c;if(c=this.expect("<",">","<=",">="))a=this.binaryFn(a,c.fn,this.relational());return a},additive:function(){for(var a=this.multiplicative(),c;c=this.expect("+",
"-");)a=this.binaryFn(a,c.fn,this.multiplicative());return a},multiplicative:function(){for(var a=this.unary(),c;c=this.expect("*","/","%");)a=this.binaryFn(a,c.fn,this.unary());return a},unary:function(){var a;return this.expect("+")?this.primary():(a=this.expect("-"))?this.binaryFn(bb.ZERO,a.fn,this.unary()):(a=this.expect("!"))?this.unaryFn(a.fn,this.unary()):this.primary()},fieldAccess:function(a){var c=this,d=this.expect().text,e=Fc(d,this.options,this.text);return E(function(c,d,h){return e(h||
a(c,d))},{assign:function(e,g,h){return sb(a(e,h),d,g,c.text,c.options)}})},objectIndex:function(a){var c=this,d=this.expression();this.consume("]");return E(function(e,f){var g=a(e,f),h=d(e,f),m;if(!g)return s;(g=ab(g[h],c.text))&&(g.then&&c.options.unwrapPromises)&&(m=g,"$$v"in g||(m.$$v=s,m.then(function(a){m.$$v=a})),g=g.$$v);return g},{assign:function(e,f,g){var h=d(e,g);return ab(a(e,g),c.text)[h]=f}})},functionCall:function(a,c){var d=[];if(")"!==this.peekToken().text){do d.push(this.expression());
while(this.expect(","))}this.consume(")");var e=this;return function(f,g){for(var h=[],m=c?c(f,g):f,k=0;k<d.length;k++)h.push(d[k](f,g));k=a(f,g,m)||w;ab(m,e.text);ab(k,e.text);h=k.apply?k.apply(m,h):k(h[0],h[1],h[2],h[3],h[4]);return ab(h,e.text)}},arrayDeclaration:function(){var a=[],c=!0;if("]"!==this.peekToken().text){do{if(this.peek("]"))break;var d=this.expression();a.push(d);d.constant||(c=!1)}while(this.expect(","))}this.consume("]");return E(function(c,d){for(var g=[],h=0;h<a.length;h++)g.push(a[h](c,
d));return g},{literal:!0,constant:c})},object:function(){var a=[],c=!0;if("}"!==this.peekToken().text){do{if(this.peek("}"))break;var d=this.expect(),d=d.string||d.text;this.consume(":");var e=this.expression();a.push({key:d,value:e});e.constant||(c=!1)}while(this.expect(","))}this.consume("}");return E(function(c,d){for(var e={},m=0;m<a.length;m++){var k=a[m];e[k.key]=k.value(c,d)}return e},{literal:!0,constant:c})}};var Sb={},ua=u("$sce"),ga={HTML:"html",CSS:"css",URL:"url",RESOURCE_URL:"resourceUrl",
JS:"js"},X=V.createElement("a"),Ic=sa(P.location.href,!0);kc.$inject=["$provide"];Jc.$inject=["$locale"];Lc.$inject=["$locale"];var Oc=".",Ie={yyyy:$("FullYear",4),yy:$("FullYear",2,0,!0),y:$("FullYear",1),MMMM:tb("Month"),MMM:tb("Month",!0),MM:$("Month",2,1),M:$("Month",1,1),dd:$("Date",2),d:$("Date",1),HH:$("Hours",2),H:$("Hours",1),hh:$("Hours",2,-12),h:$("Hours",1,-12),mm:$("Minutes",2),m:$("Minutes",1),ss:$("Seconds",2),s:$("Seconds",1),sss:$("Milliseconds",3),EEEE:tb("Day"),EEE:tb("Day",!0),
a:function(a,c){return 12>a.getHours()?c.AMPMS[0]:c.AMPMS[1]},Z:function(a){a=-1*a.getTimezoneOffset();return a=(0<=a?"+":"")+(Ub(Math[0<a?"floor":"ceil"](a/60),2)+Ub(Math.abs(a%60),2))}},He=/((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/,Ge=/^\-?\d+$/;Kc.$inject=["$locale"];var Ee=aa(J),Fe=aa(Ga);Mc.$inject=["$parse"];var cd=aa({restrict:"E",compile:function(a,c){8>=S&&(c.href||c.name||c.$set("href",""),a.append(V.createComment("IE fix")));if(!c.href&&!c.xlinkHref&&
!c.name)return function(a,c){var f="[object SVGAnimatedString]"===wa.call(c.prop("href"))?"xlink:href":"href";c.on("click",function(a){c.attr(f)||a.preventDefault()})}}}),Eb={};q(nb,function(a,c){if("multiple"!=a){var d=na("ng-"+c);Eb[d]=function(){return{priority:100,link:function(a,f,g){a.$watch(g[d],function(a){g.$set(c,!!a)})}}}}});q(["src","srcset","href"],function(a){var c=na("ng-"+a);Eb[c]=function(){return{priority:99,link:function(d,e,f){var g=a,h=a;"href"===a&&"[object SVGAnimatedString]"===
wa.call(e.prop("href"))&&(h="xlinkHref",f.$attr[h]="xlink:href",g=null);f.$observe(c,function(a){a&&(f.$set(h,a),S&&g&&e.prop(g,f[h]))})}}}});var wb={$addControl:w,$removeControl:w,$setValidity:w,$setDirty:w,$setPristine:w};Pc.$inject=["$element","$attrs","$scope","$animate"];var Qc=function(a){return["$timeout",function(c){return{name:"form",restrict:a?"EAC":"E",controller:Pc,compile:function(){return{pre:function(a,e,f,g){if(!f.action){var h=function(a){a.preventDefault?a.preventDefault():a.returnValue=
!1};qb(e[0],"submit",h);e.on("$destroy",function(){c(function(){Va(e[0],"submit",h)},0,!1)})}var m=e.parent().controller("form"),k=f.name||f.ngForm;k&&sb(a,k,g,k);if(m)e.on("$destroy",function(){m.$removeControl(g);k&&sb(a,k,s,k);E(g,wb)})}}}}}]},dd=Qc(),qd=Qc(!0),Oe=/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,Pe=/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i,Qe=/^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,Rc={text:yb,number:function(a,c,d,e,f,g){yb(a,
c,d,e,f,g);e.$parsers.push(function(a){var c=e.$isEmpty(a);if(c||Qe.test(a))return e.$setValidity("number",!0),""===a?null:c?a:parseFloat(a);e.$setValidity("number",!1);return s});Je(e,"number",c);e.$formatters.push(function(a){return e.$isEmpty(a)?"":""+a});d.min&&(a=function(a){var c=parseFloat(d.min);return pa(e,"min",e.$isEmpty(a)||a>=c,a)},e.$parsers.push(a),e.$formatters.push(a));d.max&&(a=function(a){var c=parseFloat(d.max);return pa(e,"max",e.$isEmpty(a)||a<=c,a)},e.$parsers.push(a),e.$formatters.push(a));
e.$formatters.push(function(a){return pa(e,"number",e.$isEmpty(a)||zb(a),a)})},url:function(a,c,d,e,f,g){yb(a,c,d,e,f,g);a=function(a){return pa(e,"url",e.$isEmpty(a)||Oe.test(a),a)};e.$formatters.push(a);e.$parsers.push(a)},email:function(a,c,d,e,f,g){yb(a,c,d,e,f,g);a=function(a){return pa(e,"email",e.$isEmpty(a)||Pe.test(a),a)};e.$formatters.push(a);e.$parsers.push(a)},radio:function(a,c,d,e){H(d.name)&&c.attr("name",eb());c.on("click",function(){c[0].checked&&a.$apply(function(){e.$setViewValue(d.value)})});
e.$render=function(){c[0].checked=d.value==e.$viewValue};d.$observe("value",e.$render)},checkbox:function(a,c,d,e){var f=d.ngTrueValue,g=d.ngFalseValue;C(f)||(f=!0);C(g)||(g=!1);c.on("click",function(){a.$apply(function(){e.$setViewValue(c[0].checked)})});e.$render=function(){c[0].checked=e.$viewValue};e.$isEmpty=function(a){return a!==f};e.$formatters.push(function(a){return a===f});e.$parsers.push(function(a){return a?f:g})},hidden:w,button:w,submit:w,reset:w,file:w},hc=["$browser","$sniffer",function(a,
c){return{restrict:"E",require:"?ngModel",link:function(d,e,f,g){g&&(Rc[J(f.type)]||Rc.text)(d,e,f,g,c,a)}}}],vb="ng-valid",ub="ng-invalid",La="ng-pristine",xb="ng-dirty",Re=["$scope","$exceptionHandler","$attrs","$element","$parse","$animate",function(a,c,d,e,f,g){function h(a,c){c=c?"-"+ib(c,"-"):"";g.removeClass(e,(a?ub:vb)+c);g.addClass(e,(a?vb:ub)+c)}this.$modelValue=this.$viewValue=Number.NaN;this.$parsers=[];this.$formatters=[];this.$viewChangeListeners=[];this.$pristine=!0;this.$dirty=!1;
this.$valid=!0;this.$invalid=!1;this.$name=d.name;var m=f(d.ngModel),k=m.assign;if(!k)throw u("ngModel")("nonassign",d.ngModel,ha(e));this.$render=w;this.$isEmpty=function(a){return H(a)||""===a||null===a||a!==a};var l=e.inheritedData("$formController")||wb,n=0,p=this.$error={};e.addClass(La);h(!0);this.$setValidity=function(a,c){p[a]!==!c&&(c?(p[a]&&n--,n||(h(!0),this.$valid=!0,this.$invalid=!1)):(h(!1),this.$invalid=!0,this.$valid=!1,n++),p[a]=!c,h(c,a),l.$setValidity(a,c,this))};this.$setPristine=
function(){this.$dirty=!1;this.$pristine=!0;g.removeClass(e,xb);g.addClass(e,La)};this.$setViewValue=function(d){this.$viewValue=d;this.$pristine&&(this.$dirty=!0,this.$pristine=!1,g.removeClass(e,La),g.addClass(e,xb),l.$setDirty());q(this.$parsers,function(a){d=a(d)});this.$modelValue!==d&&(this.$modelValue=d,k(a,d),q(this.$viewChangeListeners,function(a){try{a()}catch(d){c(d)}}))};var r=this;a.$watch(function(){var c=m(a);if(r.$modelValue!==c){var d=r.$formatters,e=d.length;for(r.$modelValue=c;e--;)c=
d[e](c);r.$viewValue!==c&&(r.$viewValue=c,r.$render())}return c})}],Fd=function(){return{require:["ngModel","^?form"],controller:Re,link:function(a,c,d,e){var f=e[0],g=e[1]||wb;g.$addControl(f);a.$on("$destroy",function(){g.$removeControl(f)})}}},Hd=aa({require:"ngModel",link:function(a,c,d,e){e.$viewChangeListeners.push(function(){a.$eval(d.ngChange)})}}),ic=function(){return{require:"?ngModel",link:function(a,c,d,e){if(e){d.required=!0;var f=function(a){if(d.required&&e.$isEmpty(a))e.$setValidity("required",
!1);else return e.$setValidity("required",!0),a};e.$formatters.push(f);e.$parsers.unshift(f);d.$observe("required",function(){f(e.$viewValue)})}}}},Gd=function(){return{require:"ngModel",link:function(a,c,d,e){var f=(a=/\/(.*)\//.exec(d.ngList))&&RegExp(a[1])||d.ngList||",";e.$parsers.push(function(a){if(!H(a)){var c=[];a&&q(a.split(f),function(a){a&&c.push(ba(a))});return c}});e.$formatters.push(function(a){return K(a)?a.join(", "):s});e.$isEmpty=function(a){return!a||!a.length}}}},Se=/^(true|false|\d+)$/,
Id=function(){return{priority:100,compile:function(a,c){return Se.test(c.ngValue)?function(a,c,f){f.$set("value",a.$eval(f.ngValue))}:function(a,c,f){a.$watch(f.ngValue,function(a){f.$set("value",a)})}}}},id=va(function(a,c,d){c.addClass("ng-binding").data("$binding",d.ngBind);a.$watch(d.ngBind,function(a){c.text(a==s?"":a)})}),kd=["$interpolate",function(a){return function(c,d,e){c=a(d.attr(e.$attr.ngBindTemplate));d.addClass("ng-binding").data("$binding",c);e.$observe("ngBindTemplate",function(a){d.text(a)})}}],
jd=["$sce","$parse",function(a,c){return function(d,e,f){e.addClass("ng-binding").data("$binding",f.ngBindHtml);var g=c(f.ngBindHtml);d.$watch(function(){return(g(d)||"").toString()},function(c){e.html(a.getTrustedHtml(g(d))||"")})}}],ld=Vb("",!0),nd=Vb("Odd",0),md=Vb("Even",1),od=va({compile:function(a,c){c.$set("ngCloak",s);a.removeClass("ng-cloak")}}),pd=[function(){return{scope:!0,controller:"@",priority:500}}],jc={};q("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "),
function(a){var c=na("ng-"+a);jc[c]=["$parse",function(d){return{compile:function(e,f){var g=d(f[c]);return function(c,d,e){d.on(J(a),function(a){c.$apply(function(){g(c,{$event:a})})})}}}}]});var sd=["$animate",function(a){return{transclude:"element",priority:600,terminal:!0,restrict:"A",$$tlb:!0,link:function(c,d,e,f,g){var h,m,k;c.$watch(e.ngIf,function(f){Qa(f)?m||(m=c.$new(),g(m,function(c){c[c.length++]=V.createComment(" end ngIf: "+e.ngIf+" ");h={clone:c};a.enter(c,d.parent(),d)})):(k&&(k.remove(),
k=null),m&&(m.$destroy(),m=null),h&&(k=Db(h.clone),a.leave(k,function(){k=null}),h=null))})}}}],td=["$http","$templateCache","$anchorScroll","$animate","$sce",function(a,c,d,e,f){return{restrict:"ECA",priority:400,terminal:!0,transclude:"element",controller:Ra.noop,compile:function(g,h){var m=h.ngInclude||h.src,k=h.onload||"",l=h.autoscroll;return function(g,h,q,s,D){var x=0,t,y,B,v=function(){y&&(y.remove(),y=null);t&&(t.$destroy(),t=null);B&&(e.leave(B,function(){y=null}),y=B,B=null)};g.$watch(f.parseAsResourceUrl(m),
function(f){var m=function(){!z(l)||l&&!g.$eval(l)||d()},q=++x;f?(a.get(f,{cache:c}).success(function(a){if(q===x){var c=g.$new();s.template=a;a=D(c,function(a){v();e.enter(a,null,h,m)});t=c;B=a;t.$emit("$includeContentLoaded");g.$eval(k)}}).error(function(){q===x&&v()}),g.$emit("$includeContentRequested")):(v(),s.template=null)})}}}}],Jd=["$compile",function(a){return{restrict:"ECA",priority:-400,require:"ngInclude",link:function(c,d,e,f){d.html(f.template);a(d.contents())(c)}}}],ud=va({priority:450,
compile:function(){return{pre:function(a,c,d){a.$eval(d.ngInit)}}}}),vd=va({terminal:!0,priority:1E3}),wd=["$locale","$interpolate",function(a,c){var d=/{}/g;return{restrict:"EA",link:function(e,f,g){var h=g.count,m=g.$attr.when&&f.attr(g.$attr.when),k=g.offset||0,l=e.$eval(m)||{},n={},p=c.startSymbol(),r=c.endSymbol(),s=/^when(Minus)?(.+)$/;q(g,function(a,c){s.test(c)&&(l[J(c.replace("when","").replace("Minus","-"))]=f.attr(g.$attr[c]))});q(l,function(a,e){n[e]=c(a.replace(d,p+h+"-"+k+r))});e.$watch(function(){var c=
parseFloat(e.$eval(h));if(isNaN(c))return"";c in l||(c=a.pluralCat(c-k));return n[c](e,f,!0)},function(a){f.text(a)})}}}],xd=["$parse","$animate",function(a,c){var d=u("ngRepeat");return{transclude:"element",priority:1E3,terminal:!0,$$tlb:!0,link:function(e,f,g,h,m){var k=g.ngRepeat,l=k.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),n,p,r,s,D,x,t={$id:Ia};if(!l)throw d("iexp",k);g=l[1];h=l[2];(l=l[3])?(n=a(l),p=function(a,c,d){x&&(t[x]=a);t[D]=c;t.$index=d;return n(e,
t)}):(r=function(a,c){return Ia(c)},s=function(a){return a});l=g.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);if(!l)throw d("iidexp",g);D=l[3]||l[1];x=l[2];var z={};e.$watchCollection(h,function(a){var g,h,l=f[0],n,t={},F,R,C,w,T,u,E=[];if(db(a))T=a,n=p||r;else{n=p||s;T=[];for(C in a)a.hasOwnProperty(C)&&"$"!=C.charAt(0)&&T.push(C);T.sort()}F=T.length;h=E.length=T.length;for(g=0;g<h;g++)if(C=a===T?g:T[g],w=a[C],w=n(C,w,g),Aa(w,"`track by` id"),z.hasOwnProperty(w))u=z[w],delete z[w],t[w]=
u,E[g]=u;else{if(t.hasOwnProperty(w))throw q(E,function(a){a&&a.scope&&(z[a.id]=a)}),d("dupes",k,w);E[g]={id:w};t[w]=!1}for(C in z)z.hasOwnProperty(C)&&(u=z[C],g=Db(u.clone),c.leave(g),q(g,function(a){a.$$NG_REMOVED=!0}),u.scope.$destroy());g=0;for(h=T.length;g<h;g++){C=a===T?g:T[g];w=a[C];u=E[g];E[g-1]&&(l=E[g-1].clone[E[g-1].clone.length-1]);if(u.scope){R=u.scope;n=l;do n=n.nextSibling;while(n&&n.$$NG_REMOVED);u.clone[0]!=n&&c.move(Db(u.clone),null,y(l));l=u.clone[u.clone.length-1]}else R=e.$new();
R[D]=w;x&&(R[x]=C);R.$index=g;R.$first=0===g;R.$last=g===F-1;R.$middle=!(R.$first||R.$last);R.$odd=!(R.$even=0===(g&1));u.scope||m(R,function(a){a[a.length++]=V.createComment(" end ngRepeat: "+k+" ");c.enter(a,null,y(l));l=a;u.scope=R;u.clone=a;t[u.id]=u})}z=t})}}}],yd=["$animate",function(a){return function(c,d,e){c.$watch(e.ngShow,function(c){a[Qa(c)?"removeClass":"addClass"](d,"ng-hide")})}}],rd=["$animate",function(a){return function(c,d,e){c.$watch(e.ngHide,function(c){a[Qa(c)?"addClass":"removeClass"](d,
"ng-hide")})}}],zd=va(function(a,c,d){a.$watch(d.ngStyle,function(a,d){d&&a!==d&&q(d,function(a,d){c.css(d,"")});a&&c.css(a)},!0)}),Ad=["$animate",function(a){return{restrict:"EA",require:"ngSwitch",controller:["$scope",function(){this.cases={}}],link:function(c,d,e,f){var g=[],h=[],m=[],k=[];c.$watch(e.ngSwitch||e.on,function(d){var n,p;n=0;for(p=m.length;n<p;++n)m[n].remove();n=m.length=0;for(p=k.length;n<p;++n){var r=h[n];k[n].$destroy();m[n]=r;a.leave(r,function(){m.splice(n,1)})}h.length=0;k.length=
0;if(g=f.cases["!"+d]||f.cases["?"])c.$eval(e.change),q(g,function(d){var e=c.$new();k.push(e);d.transclude(e,function(c){var e=d.element;h.push(c);a.enter(c,e.parent(),e)})})})}}}],Bd=va({transclude:"element",priority:800,require:"^ngSwitch",link:function(a,c,d,e,f){e.cases["!"+d.ngSwitchWhen]=e.cases["!"+d.ngSwitchWhen]||[];e.cases["!"+d.ngSwitchWhen].push({transclude:f,element:c})}}),Cd=va({transclude:"element",priority:800,require:"^ngSwitch",link:function(a,c,d,e,f){e.cases["?"]=e.cases["?"]||
[];e.cases["?"].push({transclude:f,element:c})}}),Ed=va({link:function(a,c,d,e,f){if(!f)throw u("ngTransclude")("orphan",ha(c));f(function(a){c.empty();c.append(a)})}}),ed=["$templateCache",function(a){return{restrict:"E",terminal:!0,compile:function(c,d){"text/ng-template"==d.type&&a.put(d.id,c[0].text)}}}],Te=u("ngOptions"),Dd=aa({terminal:!0}),fd=["$compile","$parse",function(a,c){var d=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
e={$setViewValue:w};return{restrict:"E",require:["select","?ngModel"],controller:["$element","$scope","$attrs",function(a,c,d){var m=this,k={},l=e,n;m.databound=d.ngModel;m.init=function(a,c,d){l=a;n=d};m.addOption=function(c){Aa(c,'"option value"');k[c]=!0;l.$viewValue==c&&(a.val(c),n.parent()&&n.remove())};m.removeOption=function(a){this.hasOption(a)&&(delete k[a],l.$viewValue==a&&this.renderUnknownOption(a))};m.renderUnknownOption=function(c){c="? "+Ia(c)+" ?";n.val(c);a.prepend(n);a.val(c);n.prop("selected",
!0)};m.hasOption=function(a){return k.hasOwnProperty(a)};c.$on("$destroy",function(){m.renderUnknownOption=w})}],link:function(e,g,h,m){function k(a,c,d,e){d.$render=function(){var a=d.$viewValue;e.hasOption(a)?(w.parent()&&w.remove(),c.val(a),""===a&&x.prop("selected",!0)):H(a)&&x?c.val(""):e.renderUnknownOption(a)};c.on("change",function(){a.$apply(function(){w.parent()&&w.remove();d.$setViewValue(c.val())})})}function l(a,c,d){var e;d.$render=function(){var a=new Xa(d.$viewValue);q(c.find("option"),
function(c){c.selected=z(a.get(c.value))})};a.$watch(function(){xa(e,d.$viewValue)||(e=ka(d.$viewValue),d.$render())});c.on("change",function(){a.$apply(function(){var a=[];q(c.find("option"),function(c){c.selected&&a.push(c.value)});d.$setViewValue(a)})})}function n(e,f,g){function h(){var a={"":[]},c=[""],d,k,s,u,v;u=g.$modelValue;v=y(e)||[];var A=n?Wb(v):v,E,I,B;I={};s=!1;var F,H;if(r)if(w&&K(u))for(s=new Xa([]),B=0;B<u.length;B++)I[m]=u[B],s.put(w(e,I),u[B]);else s=new Xa(u);for(B=0;E=A.length,
B<E;B++){k=B;if(n){k=A[B];if("$"===k.charAt(0))continue;I[n]=k}I[m]=v[k];d=p(e,I)||"";(k=a[d])||(k=a[d]=[],c.push(d));r?d=z(s.remove(w?w(e,I):q(e,I))):(w?(d={},d[m]=u,d=w(e,d)===w(e,I)):d=u===q(e,I),s=s||d);F=l(e,I);F=z(F)?F:"";k.push({id:w?w(e,I):n?A[B]:B,label:F,selected:d})}r||(D||null===u?a[""].unshift({id:"",label:"",selected:!s}):s||a[""].unshift({id:"?",label:"",selected:!0}));I=0;for(A=c.length;I<A;I++){d=c[I];k=a[d];x.length<=I?(u={element:C.clone().attr("label",d),label:k.label},v=[u],x.push(v),
f.append(u.element)):(v=x[I],u=v[0],u.label!=d&&u.element.attr("label",u.label=d));F=null;B=0;for(E=k.length;B<E;B++)s=k[B],(d=v[B+1])?(F=d.element,d.label!==s.label&&F.text(d.label=s.label),d.id!==s.id&&F.val(d.id=s.id),d.selected!==s.selected&&F.prop("selected",d.selected=s.selected)):(""===s.id&&D?H=D:(H=t.clone()).val(s.id).attr("selected",s.selected).text(s.label),v.push({element:H,label:s.label,id:s.id,selected:s.selected}),F?F.after(H):u.element.append(H),F=H);for(B++;v.length>B;)v.pop().element.remove()}for(;x.length>
I;)x.pop()[0].element.remove()}var k;if(!(k=u.match(d)))throw Te("iexp",u,ha(f));var l=c(k[2]||k[1]),m=k[4]||k[6],n=k[5],p=c(k[3]||""),q=c(k[2]?k[1]:m),y=c(k[7]),w=k[8]?c(k[8]):null,x=[[{element:f,label:""}]];D&&(a(D)(e),D.removeClass("ng-scope"),D.remove());f.empty();f.on("change",function(){e.$apply(function(){var a,c=y(e)||[],d={},h,k,l,p,t,u,v;if(r)for(k=[],p=0,u=x.length;p<u;p++)for(a=x[p],l=1,t=a.length;l<t;l++){if((h=a[l].element)[0].selected){h=h.val();n&&(d[n]=h);if(w)for(v=0;v<c.length&&
(d[m]=c[v],w(e,d)!=h);v++);else d[m]=c[h];k.push(q(e,d))}}else{h=f.val();if("?"==h)k=s;else if(""===h)k=null;else if(w)for(v=0;v<c.length;v++){if(d[m]=c[v],w(e,d)==h){k=q(e,d);break}}else d[m]=c[h],n&&(d[n]=h),k=q(e,d);1<x[0].length&&x[0][1].id!==h&&(x[0][1].selected=!1)}g.$setViewValue(k)})});g.$render=h;e.$watch(h)}if(m[1]){var p=m[0];m=m[1];var r=h.multiple,u=h.ngOptions,D=!1,x,t=y(V.createElement("option")),C=y(V.createElement("optgroup")),w=t.clone();h=0;for(var v=g.children(),E=v.length;h<E;h++)if(""===
v[h].value){x=D=v.eq(h);break}p.init(m,D,w);r&&(m.$isEmpty=function(a){return!a||0===a.length});u?n(e,g,m):r?l(e,g,m):k(e,g,m,p)}}}}],hd=["$interpolate",function(a){var c={addOption:w,removeOption:w};return{restrict:"E",priority:100,compile:function(d,e){if(H(e.value)){var f=a(d.text(),!0);f||e.$set("value",d.text())}return function(a,d,e){var k=d.parent(),l=k.data("$selectController")||k.parent().data("$selectController");l&&l.databound?d.prop("selected",!1):l=c;f?a.$watch(f,function(a,c){e.$set("value",
a);a!==c&&l.removeOption(c);l.addOption(a)}):l.addOption(e.value);d.on("$destroy",function(){l.removeOption(e.value)})}}}}],gd=aa({restrict:"E",terminal:!0});P.angular.bootstrap?console.log("WARNING: Tried to load angular more than once."):((Ba=P.jQuery)&&Ba.fn.on?(y=Ba,E(Ba.fn,{scope:Ja.scope,isolateScope:Ja.isolateScope,controller:Ja.controller,injector:Ja.injector,inheritedData:Ja.inheritedData}),Fb("remove",!0,!0,!1),Fb("empty",!1,!1,!1),Fb("html",!1,!1,!0)):y=M,Ra.element=y,Zc(Ra),y(V).ready(function(){Wc(V,
dc)}))})(window,document);!window.angular.$$csp()&&window.angular.element(document).find("head").prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide{display:none !important;}ng\\:form{display:block;}.ng-animate-block-transitions{transition:0s all!important;-webkit-transition:0s all!important;}.ng-hide-add-active,.ng-hide-remove{display:block!important;}</style>');
//# sourceMappingURL=angular.min.js.map

/*
 AngularJS v1.2.17
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(n,e,A){'use strict';function x(s,g,k){return{restrict:"ECA",terminal:!0,priority:400,transclude:"element",link:function(a,c,b,f,w){function y(){p&&(p.remove(),p=null);h&&(h.$destroy(),h=null);l&&(k.leave(l,function(){p=null}),p=l,l=null)}function v(){var b=s.current&&s.current.locals;if(e.isDefined(b&&b.$template)){var b=a.$new(),d=s.current;l=w(b,function(d){k.enter(d,null,l||c,function(){!e.isDefined(t)||t&&!a.$eval(t)||g()});y()});h=d.scope=b;h.$emit("$viewContentLoaded");h.$eval(u)}else y()}
var h,l,p,t=b.autoscroll,u=b.onload||"";a.$on("$routeChangeSuccess",v);v()}}}function z(e,g,k){return{restrict:"ECA",priority:-400,link:function(a,c){var b=k.current,f=b.locals;c.html(f.$template);var w=e(c.contents());b.controller&&(f.$scope=a,f=g(b.controller,f),b.controllerAs&&(a[b.controllerAs]=f),c.data("$ngControllerController",f),c.children().data("$ngControllerController",f));w(a)}}}n=e.module("ngRoute",["ng"]).provider("$route",function(){function s(a,c){return e.extend(new (e.extend(function(){},
{prototype:a})),c)}function g(a,e){var b=e.caseInsensitiveMatch,f={originalPath:a,regexp:a},k=f.keys=[];a=a.replace(/([().])/g,"\\$1").replace(/(\/)?:(\w+)([\?\*])?/g,function(a,e,b,c){a="?"===c?c:null;c="*"===c?c:null;k.push({name:b,optional:!!a});e=e||"";return""+(a?"":e)+"(?:"+(a?e:"")+(c&&"(.+?)"||"([^/]+)")+(a||"")+")"+(a||"")}).replace(/([\/$\*])/g,"\\$1");f.regexp=RegExp("^"+a+"$",b?"i":"");return f}var k={};this.when=function(a,c){k[a]=e.extend({reloadOnSearch:!0},c,a&&g(a,c));if(a){var b=
"/"==a[a.length-1]?a.substr(0,a.length-1):a+"/";k[b]=e.extend({redirectTo:a},g(b,c))}return this};this.otherwise=function(a){this.when(null,a);return this};this.$get=["$rootScope","$location","$routeParams","$q","$injector","$http","$templateCache","$sce",function(a,c,b,f,g,n,v,h){function l(){var d=p(),m=r.current;if(d&&m&&d.$$route===m.$$route&&e.equals(d.pathParams,m.pathParams)&&!d.reloadOnSearch&&!u)m.params=d.params,e.copy(m.params,b),a.$broadcast("$routeUpdate",m);else if(d||m)u=!1,a.$broadcast("$routeChangeStart",
d,m),(r.current=d)&&d.redirectTo&&(e.isString(d.redirectTo)?c.path(t(d.redirectTo,d.params)).search(d.params).replace():c.url(d.redirectTo(d.pathParams,c.path(),c.search())).replace()),f.when(d).then(function(){if(d){var a=e.extend({},d.resolve),c,b;e.forEach(a,function(d,c){a[c]=e.isString(d)?g.get(d):g.invoke(d)});e.isDefined(c=d.template)?e.isFunction(c)&&(c=c(d.params)):e.isDefined(b=d.templateUrl)&&(e.isFunction(b)&&(b=b(d.params)),b=h.getTrustedResourceUrl(b),e.isDefined(b)&&(d.loadedTemplateUrl=
b,c=n.get(b,{cache:v}).then(function(a){return a.data})));e.isDefined(c)&&(a.$template=c);return f.all(a)}}).then(function(c){d==r.current&&(d&&(d.locals=c,e.copy(d.params,b)),a.$broadcast("$routeChangeSuccess",d,m))},function(c){d==r.current&&a.$broadcast("$routeChangeError",d,m,c)})}function p(){var a,b;e.forEach(k,function(f,k){var q;if(q=!b){var g=c.path();q=f.keys;var l={};if(f.regexp)if(g=f.regexp.exec(g)){for(var h=1,p=g.length;h<p;++h){var n=q[h-1],r="string"==typeof g[h]?decodeURIComponent(g[h]):
g[h];n&&r&&(l[n.name]=r)}q=l}else q=null;else q=null;q=a=q}q&&(b=s(f,{params:e.extend({},c.search(),a),pathParams:a}),b.$$route=f)});return b||k[null]&&s(k[null],{params:{},pathParams:{}})}function t(a,c){var b=[];e.forEach((a||"").split(":"),function(a,d){if(0===d)b.push(a);else{var e=a.match(/(\w+)(.*)/),f=e[1];b.push(c[f]);b.push(e[2]||"");delete c[f]}});return b.join("")}var u=!1,r={routes:k,reload:function(){u=!0;a.$evalAsync(l)}};a.$on("$locationChangeSuccess",l);return r}]});n.provider("$routeParams",
function(){this.$get=function(){return{}}});n.directive("ngView",x);n.directive("ngView",z);x.$inject=["$route","$anchorScroll","$animate"];z.$inject=["$compile","$controller","$route"]})(window,window.angular);
//# sourceMappingURL=angular-route.min.js.map

/*
 AngularJS v1.2.17
 (c) 2010-2014 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(H,a,A){'use strict';function D(p,g){g=g||{};a.forEach(g,function(a,c){delete g[c]});for(var c in p)!p.hasOwnProperty(c)||"$"===c.charAt(0)&&"$"===c.charAt(1)||(g[c]=p[c]);return g}var v=a.$$minErr("$resource"),C=/^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/;a.module("ngResource",["ng"]).factory("$resource",["$http","$q",function(p,g){function c(a,c){this.template=a;this.defaults=c||{};this.urlParams={}}function t(n,w,l){function r(h,d){var e={};d=x({},w,d);s(d,function(b,d){u(b)&&(b=b());var k;if(b&&
b.charAt&&"@"==b.charAt(0)){k=h;var a=b.substr(1);if(null==a||""===a||"hasOwnProperty"===a||!C.test("."+a))throw v("badmember",a);for(var a=a.split("."),f=0,c=a.length;f<c&&k!==A;f++){var g=a[f];k=null!==k?k[g]:A}}else k=b;e[d]=k});return e}function e(a){return a.resource}function f(a){D(a||{},this)}var F=new c(n);l=x({},B,l);s(l,function(h,d){var c=/^(POST|PUT|PATCH)$/i.test(h.method);f[d]=function(b,d,k,w){var q={},n,l,y;switch(arguments.length){case 4:y=w,l=k;case 3:case 2:if(u(d)){if(u(b)){l=
b;y=d;break}l=d;y=k}else{q=b;n=d;l=k;break}case 1:u(b)?l=b:c?n=b:q=b;break;case 0:break;default:throw v("badargs",arguments.length);}var t=this instanceof f,m=t?n:h.isArray?[]:new f(n),z={},B=h.interceptor&&h.interceptor.response||e,C=h.interceptor&&h.interceptor.responseError||A;s(h,function(a,b){"params"!=b&&("isArray"!=b&&"interceptor"!=b)&&(z[b]=G(a))});c&&(z.data=n);F.setUrlParams(z,x({},r(n,h.params||{}),q),h.url);q=p(z).then(function(b){var d=b.data,k=m.$promise;if(d){if(a.isArray(d)!==!!h.isArray)throw v("badcfg",
h.isArray?"array":"object",a.isArray(d)?"array":"object");h.isArray?(m.length=0,s(d,function(b){m.push(new f(b))})):(D(d,m),m.$promise=k)}m.$resolved=!0;b.resource=m;return b},function(b){m.$resolved=!0;(y||E)(b);return g.reject(b)});q=q.then(function(b){var a=B(b);(l||E)(a,b.headers);return a},C);return t?q:(m.$promise=q,m.$resolved=!1,m)};f.prototype["$"+d]=function(b,a,k){u(b)&&(k=a,a=b,b={});b=f[d].call(this,b,this,a,k);return b.$promise||b}});f.bind=function(a){return t(n,x({},w,a),l)};return f}
var B={get:{method:"GET"},save:{method:"POST"},query:{method:"GET",isArray:!0},remove:{method:"DELETE"},"delete":{method:"DELETE"}},E=a.noop,s=a.forEach,x=a.extend,G=a.copy,u=a.isFunction;c.prototype={setUrlParams:function(c,g,l){var r=this,e=l||r.template,f,p,h=r.urlParams={};s(e.split(/\W/),function(a){if("hasOwnProperty"===a)throw v("badname");!/^\d+$/.test(a)&&(a&&RegExp("(^|[^\\\\]):"+a+"(\\W|$)").test(e))&&(h[a]=!0)});e=e.replace(/\\:/g,":");g=g||{};s(r.urlParams,function(d,c){f=g.hasOwnProperty(c)?
g[c]:r.defaults[c];a.isDefined(f)&&null!==f?(p=encodeURIComponent(f).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"%20").replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+"),e=e.replace(RegExp(":"+c+"(\\W|$)","g"),function(a,c){return p+c})):e=e.replace(RegExp("(/?):"+c+"(\\W|$)","g"),function(a,c,d){return"/"==d.charAt(0)?d:c+d})});e=e.replace(/\/+$/,"")||"/";e=e.replace(/\/\.(?=\w+($|\?))/,".");c.url=e.replace(/\/\\\./,"/.");s(g,function(a,
e){r.urlParams[e]||(c.params=c.params||{},c.params[e]=a)})}};return t}])})(window,window.angular);
//# sourceMappingURL=angular-resource.min.js.map

var app = angular.module('vumigo', [
    'ngRoute',
    'vumigo.services',
    'vumigo.controllers',
    'vumigo.directives'
]);

app.config(['$routeProvider', '$httpProvider', '$locationProvider',
    function($routeProvider, $httpProvider, $locationProvider) {
        $routeProvider.when('/', {
            templateUrl: '/templates/campaign_maker.html',
            controller: 'CampaignMakerController'
        }).otherwise({
            redirectTo: '/'
        });
        $locationProvider.html5Mode(true).hashPrefix('!');
    }

]).run(['$rootScope',
    function ($rootScope) {
    }
]);

var controllers = angular.module('vumigo.controllers', []);

controllers.controller('CampaignMakerController', ['$scope',
    function ($scope) {

        $scope.data = {
            conversations: [{
                uuid: 'conversation1',
                name: "Register",
                description: "4 Steps",
                endpoints: [{uuid: 'endpoint1', name: 'default'}],
                colour: '#f82943',
                x: 220,
                y: 120
            }, {
                uuid: 'conversation2',
                name: "Survey",
                description: "4 Questions",
                endpoints: [{uuid: 'endpoint2', name: 'default'}],
                colour: '#fbcf3b',
                x: 220,
                y: 340
            }],
            channels: [{
                uuid: 'channel1',
                name: "SMS",
                description: "082 335 29 24",
                endpoints: [{uuid: 'endpoint3', name: 'default'}],
                utilization: 0.4,
                x: 840,
                y: 360
            }, {
                uuid: 'channel2',
                name: "USSD",
                description: "*120*10001#",
                endpoints: [{uuid: 'endpoint4', name: 'default'}],
                utilization: 0.9,
                x: 840,
                y: 140
            }],
            routers: [{
                uuid: 'router1',
                name: "K",
                description: "Keyword",
                channel_endpoints: [{uuid: 'endpoint5', name: 'default'}],
                conversation_endpoints: [{
                    uuid: 'endpoint6',
                    name: 'default'
                }, {
                    uuid: 'endpoint7',
                    name: 'default'
                }],
                x: 500,
                y: 220
            }],
            routing_entries: [{
                source: {uuid: 'endpoint1'},
                target: {uuid: 'endpoint6'}
            }]
        };
    }
]);

var directives = angular.module('vumigo.directives', []);

/**
 * Directive to render the Vumi Go Campaign Designer.
 */
directives.directive('goCampaignDesigner', [
    '$rootScope',
    'canvasBuilder',
    'dragBehavior',
    'componentHelper',
    'conversationComponent',
    'channelComponent',
    'routerComponent',
    'connectionComponent',
    'conversationLayout',
    'routerLayout',
    'channelLayout',
    'connectionLayout',
    function ($rootScope, canvasBuilder, dragBehavior, componentHelper,
                   conversationComponent, channelComponent, routerComponent,
                   connectionComponent, conversationLayout, routerLayout,
                   channelLayout, connectionLayout) {

        var canvasWidth = 2048;
        var canvasHeight = 2048;
        var gridCellSize = 20;

        /**
         * Directive controller constructor.
         *
         * @param {$scope} Reference to the directive's isolate scope.
         * @param {$element} DOM element wrapped in a jQuery object.
         * @param {$attrs} Attributes object for the element.
         * @param {$transclude} Transclude linking function.
         */
        function controller($scope, $element, $attrs, $transclude) {
            // If any scope attributes are not supplied use the default values
            if (!angular.isDefined($scope.canvasWidth)) {
                $scope.canvasWidth = canvasWidth;
            }

            if (!angular.isDefined($scope.canvasHeight)) {
                $scope.canvasHeight = canvasHeight;
            }

            if (!angular.isDefined($scope.gridCellSize)) {
                $scope.gridCellSize = gridCellSize;
            }

            $scope.selectedComponentId = null;
            $scope.componentSelected = false;
            $scope.connectPressed = false;

            $scope.refresh = function () {
                $rootScope.$emit('go:campaignDesignerRepaint');
            };

            $scope.connect = function () {
                $scope.connectPressed = !$scope.connectPressed;
            };

            $scope.$watch('selectedComponentId', function (newValue, oldValue) {
                if (newValue) {
                    $scope.componentSelected = true;

                    if (oldValue && newValue != oldValue && $scope.connectPressed) {
                        componentHelper.connectComponents($scope.data, oldValue, newValue);
                        $scope.refresh();
                    }

                } else {
                    $scope.componentSelected = false;
                }

                $scope.connectPressed = false;
            });

            $rootScope.$on('go:campaignDesignerSelect', function (event, componentId) {
                $scope.selectedComponentId = componentId;
            });
        }

        /**
         * Directive link function.
         *
         * @param {$scope} Reference to the directive's isolate scope.
         * @param {$element} DOM element wrapped in a jQuery object.
         * @param {$attrs} Attributes object for the element.
         */
        function link(scope, element, attrs) {
            var width = scope.canvasWidth;
            var height = scope.canvasHeight;

            // Round `width` and `height` up to the nearest `scope.gridCellSize`
            if (scope.gridCellSize > 0) {
                width = Math.ceil(width / scope.gridCellSize) * scope.gridCellSize;
                height = Math.ceil(height / scope.gridCellSize) * scope.gridCellSize;
            }

            var canvas = canvasBuilder()
                .width(width)
                .height(height)
                .gridCellSize(scope.gridCellSize)
                .apply(null, [d3.selectAll(element.toArray())]);

            var drag = dragBehavior()
                .canvasWidth(width)
                .canvasHeight(height)
                .gridCellSize(scope.gridCellSize)
                .call();

            var conversation = conversationComponent().drag(drag);
            var channel = channelComponent().drag(drag);
            var router = routerComponent().drag(drag);
            var connection = connectionComponent();

            var layoutConversations = conversationLayout();
            var layoutRouters = routerLayout();
            var layoutChannels = channelLayout();
            var layoutConnections = connectionLayout();

            repaint(); // Do initial draw

            /** Repaint the canvas **/
            function repaint() {
                canvas.selectAll('.conversation')
                    .data(layoutConversations(scope.data.conversations))
                    .call(conversation);

                canvas.selectAll('.channel')
                    .data(layoutChannels(scope.data.channels))
                    .call(channel);

                canvas.selectAll('.router')
                    .data(layoutRouters(scope.data.routers))
                    .call(router);

                canvas.selectAll('.connection')
                    .data(layoutConnections(scope.data).routing_entries)
                    .call(connection);
            }

            $rootScope.$on('go:campaignDesignerRepaint', repaint);
        }

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/directives/go_campaign_designer.html',
            scope: {
                data: '=',
                canvasWidth: '=?',
                canvasHeight: '=?',
                gridCellSize: '=?'  // Set to 0 to disable grid
            },
            controller: ['$scope', '$element', '$attrs', '$transclude', controller],
            link: link
        };
    }
]);

var services = angular.module('vumigo.services', []);

services.factory('svgToolbox', [function () {

    /**
     * Select the first element from the given selection that matches the
     * selector. If selector matches nothing a new element is created.
     */
    function selectOrAppend(selection, selector) {
        var element = selection.select(selector);
        if (element.empty()) {
            return selection.append(selector);
        }
        return element;
    }

    /**
     * Create an SVG filter which gives a shadow effect
     * when applied to an SVG element.
     */
    function createShadowFilter(selection) {
        var filterId = 'shadow';
        var defs = selectOrAppend(selection, 'defs');
        if (defs.select('filter#' + filterId).empty()) {
            var filter = defs.append('filter')
                .attr('id', filterId)
                .attr('width', 1.5)
                .attr('height', 1.5)
                .attr('x', -0.25)
                .attr('y', -0.25);

            filter.append('feGaussianBlur')
                .attr('in', 'SourceAlpha')
                .attr('stdDeviation', 2.5)
                .attr('result', 'blur');

            var colorMatrix = '1 0 0 0    0\n' +
                                         '0 1 0 0    0\n' +
                                         '0 0 1 0    0\n' +
                                         '0 0 0 0.4 0';

            filter.append('feColorMatrix')
                .attr('result', 'bluralpha')
                .attr('type', 'matrix')
                .attr('values', colorMatrix);

            filter.append('feOffset')
                .attr('in', 'bluralpha')
                .attr('dx', 3)
                .attr('dy', 3)
                .attr('result', 'offsetBlur');

            var femerge = filter.append('feMerge');
            femerge.append('feMergeNode').attr('in', 'offsetBlur');
            femerge.append('feMergeNode').attr('in', 'SourceGraphic');
        }
    }

    /**
     * Draw a grid of the supplied width and height in the given selection.
     */
    function drawGrid(selection, width, height, cellSize) {
        if (cellSize > 0) {
            selection.append('g')
                    .attr('class', 'x axis')
                .selectAll('line')
                    .data(d3.range(0, width, cellSize))
                .enter().append('line')
                    .attr('x1', function (d) { return d; })
                    .attr('y1', 0)
                    .attr('x2', function (d) { return d; })
                    .attr('y2', height);

            selection.append('g')
                    .attr('class', 'y axis')
                .selectAll('line')
                    .data(d3.range(0, height, cellSize))
                .enter().append('line')
                    .attr('x1', 0)
                    .attr('y1', function (d) { return d; })
                    .attr('x2', width)
                    .attr('y2', function (d) { return d; });
        }
    }

    return {
        selectOrAppend: selectOrAppend,
        createShadowFilter: createShadowFilter,
        drawGrid: drawGrid
    };
}]);

services.factory('zoomBehavior', [function () {
    return function () {
        var zoomBehavior = null;  // Zoom behavior instance
        var canvas = null;  // Canvas to get zoomed/dragged
        var canvasWidth = 0; // Canvas width
        var canvasHeight = 0; // Canvas height
        var viewportElement = null;  // Viewport wrapped in a jQuery object
        var zoomExtent = [1, 10];  // Default zoom extent

        /**
         * Called when the canvas is dragged or scaled.
         */
        function zoomed() {
            var translate = d3.event.translate;
            var scale = d3.event.scale;

            if (translate[0] > 0) {
                translate[0] = 0;
            }

            if (translate[1] > 0) {
                translate[1] = 0;
            }

            // Prevent canvas being moved beyond the viewport
            if (viewportElement && viewportElement.length > 0) {
                if (canvasWidth > 0) {
                    var x = viewportElement.width() - canvasWidth * scale;
                    if (translate[0] < x) {
                        translate[0] = x;
                    }
                }

                if (canvasHeight > 0) {
                    var y = viewportElement.height() - canvasHeight * scale;
                    if (translate[1] < y) {
                        translate[1] = y;
                    }
                }
            }

            zoomBehavior.translate(translate);  // Set the zoom translation vector

            canvas.attr('transform', 'translate(' + translate + ')scale(' + scale + ')');
        }

        var zoom = function () {
            zoomBehavior = d3.behavior.zoom()
                .scaleExtent(zoomExtent)
                .on('zoom', zoomed);

            return zoomBehavior;
        };

        zoom.canvas = function(value) {
            if (!arguments.length) return canvas;
            canvas = value;
            return zoom;
        };

        zoom.canvasWidth = function(value) {
            if (!arguments.length) return canvasWidth;
            canvasWidth = value;
            return zoom;
        };

       zoom.canvasHeight = function(value) {
            if (!arguments.length) return canvasHeight;
            canvasHeight = value;
            return zoom;
        };

       zoom.viewportElement = function(value) {
            if (!arguments.length) return viewportElement;
            viewportElement = value;
            return zoom;
        };

        zoom.zoomExtent = function(value) {
            if (!arguments.length) return zoomExtent;
            zoomExtent = value;
            return zoom;
        };

        return zoom;
    };
}]);

services.factory('dragBehavior', ['$rootScope',
    function ($rootScope) {
        return function () {
            var canvasWidth = 0;
            var canvasHeight = 0;
            var gridCellSize = 0;
            var bboxPadding = 5;

            /**
             * Called when the user starts dragging a component
             */
            function dragstarted() {
                if (d3.event.sourceEvent) {
                    d3.event.sourceEvent.stopPropagation();
                }

                d3.selectAll('.component.selected')
                    .classed('selected', false)
                    .selectAll('.bbox')
                        .remove();

                var selection = d3.select(this)
                    .classed('selected', true)
                    .classed('dragging', true);

                var bbox = selection.node().getBBox();
                selection.append('rect')
                    .attr('class', 'bbox')
                    .attr('x', bbox.x - bboxPadding)
                    .attr('y', bbox.y - bboxPadding)
                    .attr('width', bbox.width + 2.0 * bboxPadding)
                    .attr('height', bbox.height + 2.0 * bboxPadding)
                    .attr('stroke-dasharray', "5,5");

                $rootScope.$apply(function () {
                    var d = selection.datum();
                    $rootScope.$emit('go:campaignDesignerSelect', d.uuid);
                });
            }

            /**
             * Called while the user is dragging a component
             */
            function dragged(d) {
                var x = d3.event.x;
                var y = d3.event.y;

                // If we have a grid, snap to it
                if (gridCellSize > 0) {
                    x = Math.round(x / gridCellSize) * gridCellSize;
                    y = Math.round(y / gridCellSize) * gridCellSize;
                }

                // Make sure components don't get dragged outside the canvas
                if (x < 0) x = 0;
                if (canvasWidth > 0) {
                    if (x > canvasWidth) x = canvasWidth;
                }

                if (y < 0) y = 0;
                if (canvasHeight > 0) {
                    if (y > canvasHeight) y = canvasHeight;
                }

                d.x = x;
                d.y = y;

                d3.select(this).attr('transform', 'translate(' + [x, y] + ')');

                $rootScope.$apply(function () {
                    $rootScope.$emit('go:campaignDesignerRepaint');
                });
            }

            /**
             * Called after the user drops a component
             */
            function dragended() {
                d3.select(this).classed('dragging', false);
            }

            var drag = function() {
                return d3.behavior.drag()
                    .on('dragstart', dragstarted)
                    .on('drag', dragged)
                    .on('dragend', dragended);
            }

            drag.canvasWidth = function(value) {
                if (!arguments.length) return canvasWidth;
                canvasWidth = value;
                return drag;
            };

           drag.canvasHeight = function(value) {
                if (!arguments.length) return canvasHeight;
                canvasHeight = value;
                return drag;
            };

           drag.gridCellSize = function(value) {
                if (!arguments.length) return gridCellSize;
                gridCellSize = value;
                return drag;
            };

            return drag;
        }
    }
]);

services.factory('canvasBuilder', ['zoomBehavior', 'svgToolbox',
    function (zoomBehavior, svgToolbox) {
        return function () {
            var width = 2048;  // Default canvas width
            var height = 2048;  // Default canvas height
            var gridCellSize = 0;  // Disable grid by default

            var canvas = function(selection) {
                var viewportElement = $(selection[0]);

                var svg = svgToolbox.selectOrAppend(selection, 'svg')
                    .attr('width', width)
                    .attr('height', height);

                svgToolbox.createShadowFilter(svg);

                var container = svg.append('g')
                    .attr('class', 'container')
                    .attr('transform', 'translate(0, 0)');

                var rect = container.append('rect')
                    .attr('width', width)
                    .attr('height', height)
                    .style('fill', 'none')
                    .style('pointer-events', 'all');

                var canvas = container.append('g')
                    .attr('class', 'canvas');

                svgToolbox.drawGrid(canvas, width, height, gridCellSize);

                var zoom = zoomBehavior()
                    .canvas(canvas)
                    .canvasWidth(width)
                    .canvasHeight(height)
                    .viewportElement(viewportElement)
                    .call();

                container.on('mousedown', function () {
                    d3.select(this).classed('dragging', true);
                }).on('mouseup', function () {
                    d3.select(this).classed('dragging', false);
                }).call(zoom);

                return canvas;
            };

            canvas.width = function(value) {
                if (!arguments.length) return width;
                width = value;
                return canvas;
            };

           canvas.height = function(value) {
                if (!arguments.length) return height;
                height = value;
                return canvas;
            };

           canvas.gridCellSize = function(value) {
                if (!arguments.length) return gridCellSize;
                gridCellSize = value;
                return canvas;
            };

           canvas.zoomExtent = function(value) {
                if (!arguments.length) return zoomExtent;
                zoomExtent = value;
                return canvas;
            };

            return canvas;
        };
    }
]);

services.factory('conversationLayout', [function () {
    return function() {
        var innerRadius = 10;
        var outerRadius = 30;
        var textMargin = 20;

        function layout(data) {
            angular.forEach(data, function (conversation) {
                var textX = -(outerRadius / 2.0 + textMargin);

                conversation._layout = {
                    inner: {
                        r: innerRadius
                    },
                    outer: {
                        r: outerRadius
                    },
                    name: {
                        x: textX
                    },
                    description: {
                        x: textX
                    }
                }
            });

            return data;
        }

        return layout;
    };
}]);

services.factory('conversationComponent', [function () {
    return function () {
        var dragBehavior = null;

        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'component conversation');

            selection.append('circle')
                .attr('class', 'disc outer');

            selection.append('circle')
                .attr('class', 'disc inner');

            selection.append('text')
                .attr('class', 'name');

            selection.append('text')
                .attr('class', 'description');
        }

        function update(selection) {
            if (dragBehavior) selection.call(dragBehavior);

            selection
                .attr('transform', function (d) {
                    return 'translate(' + [d.x, d.y] + ')';
                });

            selection.selectAll('.disc.outer')
                .attr('r', function (d) { return d._layout.outer.r; })
                .style('fill', function (d) { return d.colour; });

            selection.selectAll('.disc.inner')
                .attr('r', function (d) { return d._layout.inner.r; });

            selection.selectAll('.name')
                .attr('x', function (d) { return d._layout.name.x })
                .text(function (d) { return d.name; });

            selection.selectAll('.description')
                .attr('x', function (d) { return d._layout.description.x; })
                .attr('dy', function (d) {
                    var fontSize = selection.select('.name')
                        .style('font-size');

                    return parseInt(fontSize) + 'px';
                })
                .text(function (d) { return d.description; });
        }

        function exit(selection) {
            selection.remove();
        }

        /**
         * Repaint conversation components.
         *
         * @param {selection} Selection containing components.
         */
        var conversation = function(selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return conversation;
        };

       /**
         * Get/set the drag behaviour.
         *
         * @param {value} The new drag behaviour; when setting.
         * @return The current drag behaviour.
         */
        conversation.drag = function(value) {
            if (!arguments.length) return dragBehavior;
            dragBehavior = value;
            return conversation;
        };

        return conversation;
    };
}]);

services.factory('channelLayout', [function () {
    return function() {
        var innerRadius = 10;
        var maxOuterRadius = 100;
        var textOffset = 20;

        function layout(data) {
            angular.forEach(data, function (channel) {
                var outerRadius = innerRadius
                    + maxOuterRadius * channel.utilization;

                var textX = innerRadius / 2.0 + textOffset;

                channel._layout = {
                    inner: {
                        r: innerRadius
                    },
                    outer: {
                        r: outerRadius
                    },
                    name: {
                        x: textX
                    },
                    description: {
                        x: textX
                    }
                };
            });

            return data;
        }

        return layout;
    };
}]);

services.factory('channelComponent', [function () {
    return function () {
        var dragBehavior = null;

        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'component channel');

            selection.append('circle')
                .attr('class', 'disc outer');

            selection.append('circle')
                .attr('class', 'disc inner');

            selection.append('text')
                .attr('class', 'name');

            selection.append('text')
                .attr('class', 'description');
        }

        function update(selection) {
            if (dragBehavior) selection.call(dragBehavior);

            selection.attr('transform', function (d) {
                return 'translate(' + [d.x, d.y] + ')';
            });

            selection.selectAll('.disc.outer')
                .attr('r', function (d) { return d._layout.outer.r; });

            selection.selectAll('.disc.inner')
                .attr('r', function (d) { return d._layout.inner.r; });

            selection.selectAll('.name')
                .attr('x', function (d) { return d._layout.name.x; })
                .text(function (d) { return d.name; });

            selection.selectAll('.description')
                .attr('x', function (d) { return d._layout.description.x; })
                .attr('dy', function (d) {
                    var fontSize = selection.select('.name')
                        .style('font-size');

                    return parseInt(fontSize) + 'px';
                })
                .text(function (d) { return d.description; });
        }

        function exit(selection) {
            selection.remove();
        }

        /**
         * Repaint conversation components.
         *
         * @param {selection} Selection containing components.
         */
        var channel = function(selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return channel;
        };

       /**
         * Get/set the drag behaviour.
         *
         * @param {value} The new drag behaviour; when setting.
         * @return The current drag behaviour.
         */
        channel.drag = function(value) {
            if (!arguments.length) return dragBehavior;
            dragBehavior = value;
            return channel;
        };

        return channel;
    };
}]);

services.factory('routerLayout', [function () {
    return function() {
        var minSize = 60;
        var pinGap = 20;
        var pinHeadRadius = 5;

        function pins(router) {
            angular.forEach(router.conversation_endpoints, function (pin, i) {
                pin._layout = {
                    len: router._layout.r,
                    y: pinGap * (i - 1),
                    r: pinHeadRadius
                };
            });
        }

        function layout(data) {
            angular.forEach(data, function (router) {
                var size = Math.max(minSize, router.conversation_endpoints.length * pinGap);
                var radius = Math.sqrt(2.0 * Math.pow(size, 2)) / 2.0;

                router._layout = {
                    r: radius
                };

                pins(router);
            });

            return data;
        }

        layout.minSize = function(value) {
            if (!arguments.length) return minSize;
            minSize = value;
            return layout;
        };

        layout.pinGap = function(value) {
            if (!arguments.length) return pinGap;
            pinGap = value;
            return layout;
        };

        return layout;
    };
}]);

services.factory('routerComponent', [function () {
    return function () {
        var pin = pinComponent();
        var dragBehavior = null;

        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'component router');

            selection.append('circle')
                .attr('class', 'disc');

            selection.append('text')
                .attr('class', 'name');

            selection.append('g')
                .attr('class', 'pins');
        }

        function update(selection) {
            if (dragBehavior) selection.call(dragBehavior);

            selection.attr('transform', function (d) {
                return 'translate(' + [d.x, d.y] + ')';
            });

            selection.selectAll('.disc')
                .attr('r', function (d) { return d._layout.r; });

            selection.selectAll('.name')
                .style('font-size', function (d) {
                    return d._layout.r + 'px';
                })
                .text(function (d) { return d.name; });

            selection.select('.pins')
                .attr('transform', function (d) {
                    return 'translate(' + [-d._layout.r, 0] + ')';
                })
                .selectAll('.pin')
                    .data(function(d) { return d.conversation_endpoints; },
                             function(d) { return d.uuid; })
                    .call(pin);
        }

        function exit(selection) {
            selection.remove();
        }

        /**
         * Repaint router components.
         *
         * @param {selection} Selection containing routers.
         */
        var router = function (selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return router;
        };

       /**
         * Get/set the drag behaviour.
         *
         * @param {value} The new drag behaviour; when setting.
         * @return The current drag behaviour.
         */
        router.drag = function(value) {
            if (!arguments.length) return dragBehavior;
            dragBehavior = value;
            return router;
        };

        return router;
    };

    function pinComponent() {
        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'pin');

            selection.append('circle')
                .attr('class', 'head');

            selection.append('line')
                .attr('class', 'line');
        }

        function update(selection) {
            selection
                .attr('transform', function (d) {
                    return 'translate(' + [-d._layout.len / 2.0, d._layout.y] + ')';
                });

            selection.select('.head')
                .attr('r', function (d) { return d._layout.r; })

            selection.select('.line')
                .attr('x2', function (d) { return d._layout.len; });
        }

        function exit(selection) {
            selection.remove();
        }

        function pin(selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return pin;
        }

        return pin;
    }
}]);

services.factory('componentHelper', [function () {

    function getById(data, componentId) {
        for (var i = 0; i < data.conversations.length; i++) {
            if (data.conversations[i].uuid == componentId) {
                return {type: 'conversation', data: data.conversations[i]}
            }
        }

        for (var i = 0; i < data.channels.length; i++) {
            if (data.channels[i].uuid == componentId) {
                return {type: 'channel', data: data.channels[i]}
            }
        }

        for (var i = 0; i < data.routers.length; i++) {
            if (data.routers[i].uuid == componentId) {
                return {type: 'router', data: data.routers[i]}
            }
        }

        return null;
    };

    function getByEndpointId(data, endpointId) {
        for (var i = 0; i < data.conversations.length; i++) {
            for (var j = 0; j < data.conversations[i].endpoints.length; j++) {
                if (data.conversations[i].endpoints[j].uuid == endpointId) {
                    return {type: 'conversation', data: data.conversations[i]};
                }
            }
        }

        for (var i = 0; i < data.channels.length; i++) {
            for (var j = 0; j < data.channels[i].endpoints.length; j++) {
                if (data.channels[i].endpoints[j].uuid == endpointId) {
                    return {type: 'channel', data: data.channels[i]};
                }
            }
        }

        for (var i = 0; i < data.routers.length; i++) {
            for (var j = 0; j < data.routers[i].conversation_endpoints.length; j++) {
                if (data.routers[i].conversation_endpoints[j].uuid == endpointId) {
                    return {type: 'router', data: data.routers[i]};
                }
            }

            for (var j = 0; j < data.routers[i].channel_endpoints.length; j++) {
                if (data.routers[i].channel_endpoints[j].uuid == endpointId) {
                    return {type: 'router', data: data.routers[i]};
                }
            }
        }

        return null;
    };

    function connectComponents(data, sourceId, targetId) {
        var source = getById(data, sourceId);
        var target = getById(data, targetId);

        if (!source || !target || source.type == target.type) return;

        var sourceEndpoint = null;
        if (['conversation', 'channel'].indexOf(source.type) != -1) {
            sourceEndpoint = source.data.endpoints[0];

        } else if (source.type == 'router') {
            if (target.type == 'conversation') {
                sourceEndpoint = source.data.conversation_endpoints[0];

            } else if (target.type == 'channel') {
                sourceEndpoint = source.data.channel_endpoints[0];
            }
        }

        var targetEndpoint = null;
        if (['conversation', 'channel'].indexOf(target.type) != -1) {
            targetEndpoint = target.data.endpoints[0];

        } else if (target.type == 'router') {
            if (source.type == 'conversation') {
                targetEndpoint = target.data.conversation_endpoints[0];

            } else if (source.type == 'channel') {
                sourceEndpoint = target.data.channel_endpoints[0];
            }
        }

        if (sourceEndpoint && targetEndpoint) {
            data.routing_entries.push({
                source: {uuid: sourceEndpoint.uuid},
                target: {uuid: targetEndpoint.uuid},
            });
        }
    }

    return {
        getById: getById,
        getByEndpointId: getByEndpointId,
        connectComponents: connectComponents
    };

}]);

services.factory('connectionLayout', ['componentHelper',
    function (componentHelper) {
        return function() {

            /**
             * Return the X and Y coordinates of the given component's endpoint.
             */
            function point(component, endpointId) {
                var x = component.data.x;
                var y = component.data.y;
                // if (component.type == 'router' && endpointId) {
                //     var endpoint = null;
                //     for (var i = 0; i < component.data.conversation_endpoints.length; i++) {
                //         if (component.data.conversation_endpoints[i].uuid = endpointId) {
                //             endpoint = component.data.conversation_endpoints[i];
                //         }
                //     }
                //     if (endpoint) {
                //         x = x - (component.data._layout.r + endpoint._layout.len / 2.0);
                //     }
                // }
                return {x: x, y: y};
            }

            function layout(data) {
                angular.forEach(data.routing_entries, function (connection) {
                    var source = componentHelper.getByEndpointId(data, connection.source.uuid);
                    var target = componentHelper.getByEndpointId(data, connection.target.uuid);

                    connection.points = [];
                    connection.points.push(point(source, connection.source.uuid));
                    connection.points.push(point(target, connection.target.uuid));
                });

                return data;
            }

            return layout;
        };
    }
]);

services.factory('connectionComponent', [function () {
    return function () {

        function enter(selection) {
            selection.append('path')
                .attr('class', 'component connection')
                .attr('stroke', 'black')
                .attr('stroke-width', 5)
                .attr('fill', 'none');
        }

        function update(selection) {
            var line = d3.svg.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .interpolate('linear');

            selection
                .attr('d', function (d) {
                    return line(d.points);
                });
        }

        function exit(selection) {
            selection.remove();
        }

        /**
         * Repaint connection components.
         *
         * @param {selection} Selection containing connections.
         */
        var connection = function (selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return connection;
        };

        return connection;
    };
}]);
