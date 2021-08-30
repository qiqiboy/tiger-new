var React = require('react');

function AppContainer(e) {
    return React.Children.only(e.children);
}

AppContainer.warnAboutHMRDisabled = !1;

var hot = function e() {
    return function(a) {
        return a;
    };
};

exports.AppContainer = AppContainer;
exports.hot = hot;
