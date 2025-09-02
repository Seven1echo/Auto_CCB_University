// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "closeTab" && sender.tab) {
    // 关闭发送消息的标签页
    chrome.tabs.remove(sender.tab.id);
    sendResponse({ status: "关闭标签页指令已执行" });
  }
});
