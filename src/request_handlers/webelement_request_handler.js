/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc.
Copyright (c) 2012, Alex Anderson <@alxndrsn>
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var ghostdriver = ghostdriver || {};

ghostdriver.WebElementReqHand = function(idOrElement, session) {
    // private:
    var
    _id = ((typeof(idOrElement) === "object") ? idOrElement["ELEMENT"] : idOrElement),
    _session = session,
    _locator = new ghostdriver.WebElementLocator(_session),
    _protoParent = ghostdriver.WebElementReqHand.prototype,
    _const = {
        ELEMENT             : "element",
        ELEMENTS            : "elements",
        VALUE               : "value",
        SUBMIT              : "submit",
        DISPLAYED           : "displayed",
        ENABLED             : "enabled",
        ATTRIBUTE           : "attribute",
        NAME                : "name",
        CLICK               : "click",
        SELECTED            : "selected",
        CLEAR               : "clear",
        CSS                 : "css",
        TEXT                : "text",
        EQUALS_DIR          : "equals",
        LOCATION            : "location",
        LOCATION_IN_VIEW    : "location_in_view",
        SIZE                : "size"
    },
    _errors = require("./errors.js"),

    _handle = function(req, res) {
        _protoParent.handle.call(this, req, res);

        // console.log("Request => " + JSON.stringify(req, null, '  '));

        // TODO lots to do...

        if (req.urlParsed.file === _const.ELEMENT && req.method === "POST") {
            _findElementCommand(req, res, _locator.locateElement);
            return;
        } else if (req.urlParsed.file === _const.ELEMENTS && req.method === "POST") {
            _findElementCommand(req, res, _locator.locateElements);
            return;
        } else if (req.urlParsed.file === _const.VALUE && req.method === "POST") {
            _valueCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.SUBMIT && req.method === "POST") {
            _submitCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.DISPLAYED && req.method === "GET") {
            _getDisplayedCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.ENABLED && req.method === "GET") {
            _getEnabledCommand(req, res);
            return;
        } else if (req.urlParsed.chunks[0] === _const.ATTRIBUTE && req.method === "GET") {
            _getAttributeCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.NAME && req.method === "GET") {
            _getNameCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.CLICK && req.method === "POST") {
            _postClickCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.SELECTED && req.method === "GET") {
            _getSelectedCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.CLEAR && req.method === "POST") {
            _postClearCommand(req, res);
            return;
        } else if (req.urlParsed.chunks[0] === _const.CSS && req.method === "GET") {
            _getCssCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.TEXT && req.method === "GET") {
            _getTextCommand(req, res);
            return;
        } else if (req.urlParsed.chunks[0] === _const.EQUALS && req.method === "GET") {
            _getEqualsCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.LOCATION && req.method === "GET") {
            _getLocationCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.LOCATION_IN_VIEW && req.method === "GET") {
            _getLocationInViewCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.SIZE && req.method === "GET") {
            _getSizeCommand(req, res);
            return;
        } else if (req.urlParsed.file === "" && req.method === "GET") {         //< GET "/session/:id/element/:id"
            // The response to this command is not defined in the specs:
            // here we just return the Element JSON ID.
            res.success(_session.getId(), _getJSON());
            return;
        } // else ...

        // TODO lots to do...

        throw _errors.createInvalidReqInvalidCommandMethodEH(req);
    },

    _getDisplayedCommand = function(req, res) {
        var displayed = _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("is_displayed"),
            _getJSON());
        res.respondBasedOnResult(_session, req, displayed);
    },

    _getEnabledCommand = function(req, res) {
        var enabled = _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("is_enabled"),
            _getJSON());
        res.respondBasedOnResult(_session, req, enabled);
    },

    _getLocationResult = function() {
        return _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("execute_script"),
            "return (" + require("./webdriver_atoms.js").get("get_location") + ")(arguments[0]);",
            [_getJSON()]);
    },

    _getLocationCommand = function(req, res) {
        var locationRes = _getLocationResult();
        res.respondBasedOnResult(_session, req, locationRes);
    },

    _getLocationInViewCommand = function(req, res) {
        var locationRes = _getLocationResult(),
            inViewLocationRes;

        if (locationRes.hasOwnProperty("status") && locationRes.status === 0) {
            // We got a location: let's scroll to it
            inViewLocationRes = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                "return (" + require("./webdriver_atoms.js").get("get_in_view_location") + ")(arguments[0]);",
                [locationRes.value]);

            res.respondBasedOnResult(_session, req, inViewLocationRes);
        } else {
            // Result is an error: report it
            res.respondBasedOnResult(_session, req, locationRes);
        }
    },

    _getSizeCommand = function(req, res) {
        var size = _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("get_size"),
            _getJSON());
        res.respondBasedOnResult(_session, req, size);
    },


    _valueCommand = function(req, res) {
        var i, ilen,
            postObj = JSON.parse(req.post),
            typeAtom = require("./webdriver_atoms.js").get("type"),
            typeRes;

        // Ensure all required parameters are available
        if (typeof(postObj) === "object" && typeof(postObj.value) === "object") {
            // Execute the "type" atom
            typeRes = _getSession().getCurrentWindow().evaluate(typeAtom, _getJSON(), postObj.value);

            // TODO - Error handling based on the value of "typeRes"

            res.success(_session.getId());
            return;
        }

        throw _errors.createInvalidReqMissingCommandParameterEH(req);
    },

    _getNameCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                "return arguments[0].tagName;",
                [_getJSON()]);

        // Convert value to a lowercase string as per WebDriver JSONWireProtocol spec
        // @see http://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/element/:id/name
        if(result.status === 0) {
            result.value = result.value.toLowerCase();
        }

        res.respondBasedOnResult(_session, req, result);
    },

    _getAttributeCommand = function(req, res) {
        var attributeValueAtom = require("./webdriver_atoms.js").get("get_attribute_value"),
            result;

        if (typeof(req.urlParsed.file) === "string" && req.urlParsed.file.length > 0) {
            // Read the attribute
            result = _session.getCurrentWindow().evaluate(
                attributeValueAtom,     // < Atom to read an attribute
                _getJSON(),             // < Element to read from
                req.urlParsed.file);    // < Attribute to read

            res.respondBasedOnResult(_session, req, result);
            return;
        }

        throw _errors.createInvalidReqMissingCommandParameterEH(req);
    },

    _getTextCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("get_text"),
            _getJSON());
        res.respondBasedOnResult(_session, req, result);
    },

    _getEqualsCommand = function(req, res) {
        var result;

        if (typeof(req.urlParsed.file) === "string" && req.urlParsed.file.length > 0) {
            result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                "return arguments[0].isSameNode(arguments[1]);",
                [_getJSON(), _getJSON(req.urlParsed.file)]);
            res.success(_session.getId(), result);
        }

        throw _errors.createInvalidReqMissingCommandParameterEH(req);
    },

    _submitCommand = function(req, res) {
        var submitRes;

        // Listen for the page to Finish Loading after the submit
        _getSession().getCurrentWindow().setOneShotCallback("onLoadFinished", function(status) {
            if (status === "success") {
                res.success(_session.getId());
            }

            // TODO - what do we do if this fails?
            // TODO - clear thing up after we are done waiting
        });

        submitRes = _getSession().getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("submit"),
            _getJSON());

        // TODO - Error handling based on the value of "submitRes"
    },

    _postClickCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("click"),
                _getJSON());

        res.respondBasedOnResult(_session, req, result);
    },

    _getSelectedCommand = function(req, res) {
        var result = JSON.parse(_session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("is_selected"),
                _getJSON()));

        res.respondBasedOnResult(_session, req, result);
    },

    _postClearCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("clear"),
                _getJSON());
        res.respondBasedOnResult(_session, req, result);
    },

    _getCssCommand = function(req, res) {
        var cssPropertyName = req.urlParsed.file,
            result;

        // Check that a property name was indeed provided
        if (typeof(cssPropertyName) === "string" || cssPropertyName.length > 0) {
            result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                "return window.getComputedStyle(arguments[0]).getPropertyValue(arguments[1]);",
                [_getJSON(), cssPropertyName]);

            res.respondBasedOnResult(_session, req, result);
            return;
        }

        throw _errors.createInvalidReqMissingCommandParameterEH(req);
    },

    _findElementCommand = function(req, res, locatorMethod) {
        // Search for a WebElement on the Page
        var elementOrElements,
            searchStartTime = new Date().getTime();

        // If a "locatorMethod" was not provided, default to "locateElement"
        if(typeof(locatorMethod) !== "function") {
            locatorMethod = _locator.locateElement;
        }

        // Try to find the element
        //  and retry if "startTime + implicitTimeout" is
        //  greater (or equal) than current time
        do {
            elementOrElements = locatorMethod("JSON", JSON.parse(req.post), _getJSON());
            if (elementOrElements) {
                res.success(_session.getId(), elementOrElements);
                return;
            }
        } while(searchStartTime + _session.getTimeout(_session.timeoutNames().IMPLICIT) >= new Date().getTime());

        throw _errors.createInvalidReqVariableResourceNotFoundEH(req);
    },

    /**
     * This method can generate any Element JSON: just provide an ID.
     * Will return the one of the current Element if no ID is provided.
     * @param elementId ID of the Element to describe in JSON format,
     *      or undefined to get the one fo the current Element.
     */
    _getJSON = function(elementId) {
        return {
            "ELEMENT" : elementId || _getId()
        };
    },

    _getId = function() {
        return _id;
    },
    _getSession = function() {
        return _session;
    };

    // public:
    return {
        handle : _handle,
        getId : _getId,
        getJSON : _getJSON,
        getSession : _getSession//,
        // isAttachedToDOM : _isAttachedToDOM,
        // isVisible : _isVisible
    };
};
// prototype inheritance:
ghostdriver.WebElementReqHand.prototype = new ghostdriver.RequestHandler();
