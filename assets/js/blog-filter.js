/*
 * 博客归档页的分类筛选。
 *
 * 结构约定(见 _pages/year-archive.html):
 *   容器    <div data-blog-filter-archive>
 *   按钮    <button data-blog-filter="all"> / <button data-blog-filter="paper-notes">
 *   文章    <div data-blog-category="paper-notes">
 *   年份块  <section data-blog-year>
 *
 * 选某个分类时,不匹配的文章被隐藏;某个年份下所有文章都被隐藏后,该年份标题一并隐藏。
 *
 * 默认选中哪个分类由模板决定:按钮上带 is-active 的那个。都没有就默认第一个(通常是「全部」)。
 */
(function () {
  "use strict";

  function initArchive(archive) {
    var buttons = archive.querySelectorAll("[data-blog-filter]");
    var items = archive.querySelectorAll("[data-blog-category]");
    var years = archive.querySelectorAll("[data-blog-year]");
    if (!buttons.length || !items.length) return;

    var emptyNote = archive.querySelector("[data-blog-empty]");

    function applyFilter(filter) {
      var i;
      for (i = 0; i < items.length; i++) {
        var item = items[i];
        var match = filter === "all" || item.getAttribute("data-blog-category") === filter;
        item.hidden = !match;
      }

      for (i = 0; i < years.length; i++) {
        var year = years[i];
        year.hidden = year.querySelectorAll("[data-blog-category]:not([hidden])").length === 0;
      }

      if (emptyNote) {
        emptyNote.hidden = archive.querySelector("[data-blog-category]:not([hidden])") !== null;
      }
    }

    function activate(button) {
      for (var i = 0; i < buttons.length; i++) {
        var isActive = buttons[i] === button;
        buttons[i].classList.toggle("is-active", isActive);
        buttons[i].setAttribute("aria-pressed", String(isActive));
      }
      applyFilter(button.getAttribute("data-blog-filter"));
    }

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        activate(this);
      });
    }

    activate(archive.querySelector("[data-blog-filter].is-active") || buttons[0]);
  }

  var archives = document.querySelectorAll("[data-blog-filter-archive]");
  for (var i = 0; i < archives.length; i++) {
    initArchive(archives[i]);
  }
})();
