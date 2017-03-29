import "core-js/shim";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Relay from "react-relay";
// The following 2 modules must be loaded in this order, because the
// 1st sets a global configuration value that the 2nd uses.
import "sourcegraph/init/worker";
import "vs/base/worker/defaultWorkerFactory";

import { Router, browserHistory as history, match } from "react-router";
import { rootRoute } from "sourcegraph/app/App";
import * as context from "sourcegraph/app/context";
import * as Dispatcher from "sourcegraph/Dispatcher";
import * as DispatchedEventHandler from "sourcegraph/tracking/DispatchedEventHandler";
import { EventLogger } from "sourcegraph/tracking/EventLogger";
import "sourcegraph/util/features";

// mark files that contain only types as being used (for UnusedFilesWebpackPlugin)
import "sourcegraph/app/router";
import "sourcegraph/user";

// REQUIRED. Configures Sentry error monitoring.
import "sourcegraph/init/Sentry";

// REQUIRED. Enables HTML history API (pushState) tracking in Google Analytics.
// See https://github.com/googleanalytics/autotrack#shouldtrackurlchange.
import "autotrack/lib/plugins/url-change-tracker";

EventLogger.init();

// Register event logging for dispatched actions
Dispatcher.Stores.register(DispatchedEventHandler.__onDispatch);

Relay.injectNetworkLayer(new Relay.DefaultNetworkLayer("/.api/graphql", {
	headers: context.context.xhrHeaders,
	credentials: "include",
}));

declare var __webpack_public_path__: any;
__webpack_public_path__ = document.head.dataset["webpackPublicPath"]; // tslint-disable-line no-undef

const rootEl = document.getElementById("main") as HTMLElement;

// matchWithRedirectHandling calls the router match func. If the router issues
// a redirect, it calls match recursively after replacing the location with the
// new one.
function matchWithRedirectHandling(recursed: boolean): void {
	match({ history, routes: rootRoute }, (err, redirectLocation, renderProps) => {
		if (typeof err === "undefined" && typeof redirectLocation === "undefined" && typeof renderProps === "undefined") {
			console.error("404 not found (no route)");
			return;
		}

		if (redirectLocation) {
			let prevLocation = window.location.href;
			history.replace(redirectLocation);
			if (recursed) {
				console.error(`Possible redirect loop: ${prevLocation} -> ${redirectLocation.pathname}`);
				window.location.reload();
				return;
			}
			matchWithRedirectHandling(true);
			return;
		}

		setTimeout(() => {
			ReactDOM.render(
				<Router		{...renderProps} />,
				rootEl,
			);
		});
	});
}

matchWithRedirectHandling(false);
