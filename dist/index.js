import { useState as e } from "react";
import { Fragment as t, jsx as n, jsxs as r } from "react/jsx-runtime";
var i = {
	p: "_p_1mohy_1",
	label: "_label_1mohy_9"
};
//#endregion
//#region src/dummy/Dummy.tsx
function a({ label: a }) {
	let [o, s] = e(0);
	return /* @__PURE__ */ r(t, { children: [
		/* @__PURE__ */ n("button", {
			onClick: () => s(o + 1),
			children: "+1"
		}),
		/* @__PURE__ */ r("p", {
			className: i.label,
			children: ["label = ", a]
		}),
		/* @__PURE__ */ r("p", {
			className: i.p,
			children: ["count = ", o]
		})
	] });
}
//#endregion
export { a as Dummy };
