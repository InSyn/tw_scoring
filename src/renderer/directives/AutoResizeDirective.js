import Vue from "vue";

export default {
  bind(el, binding) {
    const resizeHandler = () => {
      Vue.nextTick(() => {
        const parent = el.parentElement;
        if (!parent) {
          return;
        }

        const containerWidth = parent.clientWidth;
        const containerHeight = parent.clientHeight;

        const contentWidth = el.scrollWidth;
        const contentHeight = el.scrollHeight;

        const containerPaddingX =
          parseInt(getComputedStyle(parent).paddingLeft) +
          parseInt(getComputedStyle(parent).paddingRight);
        const containerPaddingY =
          parseInt(getComputedStyle(parent).paddingTop) +
          parseInt(getComputedStyle(parent).paddingBottom);

        const contentPaddingX =
          parseInt(getComputedStyle(el).paddingLeft) +
          parseInt(getComputedStyle(el).paddingRight);
        const contentPaddingY =
          parseInt(getComputedStyle(el).paddingTop) +
          parseInt(getComputedStyle(el).paddingBottom);

        const containerRatio =
          (containerWidth - containerPaddingX) /
          (containerHeight - containerPaddingY);
        const contentRatio =
          (contentWidth + contentPaddingX) / (contentHeight + contentPaddingY);

        if (contentWidth > containerWidth || contentHeight > containerHeight) {
          if (contentRatio > containerRatio) {
            el.style.fontSize = `${
              ((containerWidth - containerPaddingX) /
                (contentWidth + contentPaddingX)) *
              100
            }%`;
          } else {
            el.style.fontSize = `${
              ((containerHeight - containerPaddingY) /
                (contentHeight + contentPaddingY)) *
              100
            }%`;
          }
        } else {
          // Reset font size if content fits within the container
          el.style.fontSize = "";
        }
      });
    };

    el.__resizeHandler__ = resizeHandler;

    // You might want to debounce the resize event for performance reasons
    window.addEventListener("resize", el.__resizeHandler__);

    // Optionally, you can call the handler immediately after binding
    resizeHandler();
  },
  unbind(el) {
    window.removeEventListener("resize", el.__resizeHandler__);
    delete el.__resizeHandler__;
  },
};
