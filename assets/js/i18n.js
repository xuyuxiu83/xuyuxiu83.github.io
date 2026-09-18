/*
 * 中英切换。
 *
 * 页面上任何带 data-i18n-en / data-i18n-zh 的元素,切换时会被替换成对应语言的文字。
 * 想加一处可切换的文案,就在模板里写:
 *   <span data-i18n-en="Blog Posts" data-i18n-zh="博客">Blog Posts</span>
 * 元素里原有的文字是 JS 未执行时的回退内容,一般填英文。
 *
 * 当前语言存在 localStorage,翻页和刷新后保持。
 */
(function () {
  "use strict";

  var STORAGE_KEY = "site-lang";
  var DEFAULT_LANG = "en";

  function currentLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === "zh" || saved === "en" ? saved : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function saveLang(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* 隐私模式下 localStorage 可能不可用,忽略即可 */
    }
  }

  function apply(lang) {
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");

    var nodes = document.querySelectorAll("[data-i18n-en]");
    for (var i = 0; i < nodes.length; i++) {
      var text = nodes[i].getAttribute(lang === "zh" ? "data-i18n-zh" : "data-i18n-en");
      if (text !== null) {
        nodes[i].textContent = text;
      }
    }

    // 导航栏里的 EN / 中文,当前语言加粗
    var en = document.getElementById("lang-en");
    var zh = document.getElementById("lang-zh");
    if (en) en.style.fontWeight = lang === "en" ? "600" : "400";
    if (zh) zh.style.fontWeight = lang === "zh" ? "600" : "400";
    if (en) en.style.opacity = lang === "en" ? "1" : "0.6";
    if (zh) zh.style.opacity = lang === "zh" ? "1" : "0.6";
  }

  function init() {
    apply(currentLang());

    var toggle = document.getElementById("lang-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      var next = currentLang() === "zh" ? "en" : "zh";
      saveLang(next);
      apply(next);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
