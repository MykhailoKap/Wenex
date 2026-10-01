import { n as bodyLockToggle, t as bodyLockStatus } from "./common.js";
//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/components/layout/menu/menu.js
function menuInit() {
	document.addEventListener("click", function(e) {
		if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
			bodyLockToggle();
			document.documentElement.toggleAttribute("data-fls-menu-open");
		}
	});
}
document.querySelector("[data-fls-menu]") && window.addEventListener("load", menuInit);
//#endregion
//#region src/components/layout/cookie-consent/cookie-consent.js
var STORAGE_KEY = "wenex-cookie-consent-v1";
var defaultPreferences = {
	necessary: true,
	analytics: false,
	marketing: false
};
function initCookieConsent() {
	const root = document.querySelector("[data-fls-cookie-consent]");
	if (!root) return;
	const banner = root.querySelector("[data-cookie-banner]");
	const overlay = root.querySelector("[data-cookie-overlay]");
	const modal = root.querySelector("[data-cookie-modal]");
	const analytics = root.querySelector("[data-cookie-analytics]");
	const marketing = root.querySelector("[data-cookie-marketing]");
	const acceptButton = root.querySelector("[data-cookie-accept]");
	const rejectButton = root.querySelector("[data-cookie-reject]");
	const openSettingsButton = root.querySelector("[data-cookie-open-settings]");
	const closeButton = root.querySelector("[data-cookie-close]");
	const saveButton = root.querySelector("[data-cookie-save]");
	const rejectModalButton = root.querySelector("[data-cookie-reject-modal]");
	let lastFocusedElement = null;
	const readPreferences = () => {
		try {
			const value = localStorage.getItem(STORAGE_KEY);
			if (!value) return null;
			const parsed = JSON.parse(value);
			if (!parsed || typeof parsed !== "object" || !parsed.preferences) return null;
			return {
				necessary: true,
				analytics: Boolean(parsed.preferences.analytics),
				marketing: Boolean(parsed.preferences.marketing)
			};
		} catch {
			return null;
		}
	};
	const applyPreferences = (preferences) => {
		document.documentElement.dataset.cookieAnalytics = String(Boolean(preferences.analytics));
		document.documentElement.dataset.cookieMarketing = String(Boolean(preferences.marketing));
		window.wenexCookieConsent = { ...preferences };
		document.dispatchEvent(new CustomEvent("wenex:cookie-consent", { detail: { ...preferences } }));
	};
	const savePreferences = (preferences) => {
		const normalized = {
			necessary: true,
			analytics: Boolean(preferences.analytics),
			marketing: Boolean(preferences.marketing)
		};
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({
				version: 1,
				savedAt: (/* @__PURE__ */ new Date()).toISOString(),
				preferences: normalized
			}));
		} catch {}
		applyPreferences(normalized);
		hideBanner();
		closeSettings();
	};
	const hideBanner = () => {
		if (banner) banner.hidden = true;
	};
	const showBanner = () => {
		if (banner) banner.hidden = false;
	};
	const syncSettings = () => {
		const preferences = readPreferences() || window.wenexCookieConsent || defaultPreferences;
		if (analytics) analytics.checked = Boolean(preferences.analytics);
		if (marketing) marketing.checked = Boolean(preferences.marketing);
	};
	const openSettings = (trigger = null) => {
		if (!overlay || !modal) return;
		lastFocusedElement = trigger || document.activeElement;
		syncSettings();
		overlay.hidden = false;
		document.documentElement.classList.add("cookie-consent-open");
		requestAnimationFrame(() => modal.focus());
	};
	const closeSettings = () => {
		if (!overlay) return;
		overlay.hidden = true;
		document.documentElement.classList.remove("cookie-consent-open");
		if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
	};
	const existingPreferences = readPreferences();
	if (existingPreferences) {
		applyPreferences(existingPreferences);
		hideBanner();
	} else {
		applyPreferences(defaultPreferences);
		showBanner();
	}
	acceptButton?.addEventListener("click", () => {
		savePreferences({
			necessary: true,
			analytics: true,
			marketing: true
		});
	});
	rejectButton?.addEventListener("click", () => {
		savePreferences(defaultPreferences);
	});
	openSettingsButton?.addEventListener("click", (event) => {
		openSettings(event.currentTarget);
	});
	saveButton?.addEventListener("click", () => {
		savePreferences({
			necessary: true,
			analytics: analytics?.checked ?? false,
			marketing: marketing?.checked ?? false
		});
	});
	rejectModalButton?.addEventListener("click", () => {
		savePreferences(defaultPreferences);
	});
	closeButton?.addEventListener("click", closeSettings);
	overlay?.addEventListener("click", (event) => {
		if (event.target === overlay) closeSettings();
	});
	document.addEventListener("click", (event) => {
		const trigger = event.target.closest("[data-cookie-settings]");
		if (!trigger) return;
		event.preventDefault();
		openSettings(trigger);
	});
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && overlay && !overlay.hidden) closeSettings();
	});
}
initCookieConsent();
//#endregion
//#region src/components/effects/preloader/preloader.js
function preloader() {
	const html = document.documentElement;
	document.body.insertAdjacentHTML("beforeend", `
		<div class="fls-preloader">
			<div class="fls-preloader__body">
				<div class="fls-preloader__logo">WENEX</div>

				<div class="fls-preloader__line">
					<span></span>
				</div>

				<div class="fls-preloader__counter">0%</div>
			</div>
		</div>
	`);
	const counter = document.querySelector(".fls-preloader__counter");
	const line = document.querySelector(".fls-preloader__line span");
	html.setAttribute("data-fls-preloader-loading", "");
	html.setAttribute("data-fls-scrolllock", "");
	let displayedProgress = 0;
	let targetProgress = 10;
	let finished = false;
	const setProgress = (value) => {
		const progress = Math.min(Math.round(value), 100);
		if (counter) counter.textContent = `${progress}%`;
		if (line) line.style.width = `${progress}%`;
	};
	const progressTimer = setInterval(() => {
		if (displayedProgress < targetProgress) {
			displayedProgress += 1;
			setProgress(displayedProgress);
		}
		if (finished && displayedProgress >= 100) {
			clearInterval(progressTimer);
			hidePreloader();
		}
	}, 12);
	const hidePreloader = () => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				html.setAttribute("data-fls-preloader-loaded", "");
				html.removeAttribute("data-fls-preloader-loading");
				html.removeAttribute("data-fls-scrolllock");
			});
		});
	};
	const finish = () => {
		if (finished) return;
		finished = true;
		targetProgress = 100;
	};
	if (document.querySelector("[data-fls-gallery-product]")) {
		targetProgress = 35;
		document.addEventListener("wenex:gallery-ready", () => {
			targetProgress = 100;
			finish();
		}, { once: true });
		setTimeout(() => {
			finish();
		}, 8e3);
		return;
	}
	targetProgress = 70;
	if (document.readyState === "complete") finish();
	else window.addEventListener("load", finish, { once: true });
}
document.addEventListener("DOMContentLoaded", preloader);
//#endregion
