function $(selector) {
  return document.querySelector(selector);
}
function $$(selector) {
  return document.querySelectorAll(selector);
}
function $$$(tagName) {
  return document.createElement(tagName);
}

function preventHandler(e) {
  if (e.target.dataset.default) {
    // 事件源包含 data-default 属性
    return; // 该事件源无须阻止默认行为
  }
  if (e.cancelable) {
    e.preventDefault();
  }
}
// 阻止 touchstart 事件的默认行为
document.body.addEventListener("touchstart", preventHandler, {
  passive: false,
});
// 阻止 touchmove 事件的默认行为
document.body.addEventListener("touchmove", preventHandler, {
  passive: false,
});

// 显示加载中
function showLoading() {
  // 处理边界_有创建就不再创建
  let oDivModal = $("#divLoadingModal");
  if (oDivModal) {
    return;
  }
  let divModal = $$$("div");
  divModal.id = "divLoadingModal";
  divModal.className = "g-modal";
  divModal.innerHTML = `    
<div class="g-modal">
    <div class="g-loading">
        <img src="./assets/loading.svg" alt="加载中">
    </div>
</div>`;
  document.body.appendChild(divModal);
}

// 关闭加载中
function closeLoading() {
  let oDivModal = $("#divLoadingModal");
  if (oDivModal) {
    oDivModal.remove();
  }
}
// export { $, $$, $$$, preventHandler, showLoading, closeLoading };
