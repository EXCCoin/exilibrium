import { createElement as h } from "react";
export * from "./dateFormat";
export { addSpacingAroundText, restrictToStdDecimalNumber } from "./strings";
export { reverseHash, reverseRawHash } from "./byteActions";
export * from "./addresses";

// kidCheck takes a component and returns a component that only renders if it has children
export const kidCheck = C => {
  const Comp = p => Boolean(p.children) && h(C, p);
  Comp.displayName = `KidChecked: ${C.displayName || C.name || C}`;
  return Comp;
};

// showCheck takes a component and returns a component that can be passed a `show` prop and only renders if show is true
// show is set to true as default behavior.
export const showCheck = C => {
  const Comp = ({ show, ...p }) => Boolean(show) && h(C, p);
  Comp.defaultProps = { show: true };
  Comp.displayName = `ShowChecked: ${C.displayName || C.name || C}`;
  return Comp;
};

export const pause = time =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
