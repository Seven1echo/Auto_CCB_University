// 简洁日志函数
function log(message) {
  console.log(`[CCB学习助手] ${message}`);
}

// 页面加载后执行
window.addEventListener('load', function() {
  log('页面加载完成，开始执行');
  
  // 初始检查
  processPage();
  
  // 定时检查（保留30秒，每1.5秒一次）
  let checkTimes = 0;
  const maxChecks = 20;
  const checkInterval = setInterval(() => {
    checkTimes++;
    log(`定时检查(${checkTimes}/${maxChecks})`);
    processPage();
    
    if (checkTimes >= maxChecks) {
      clearInterval(checkInterval);
      log('检查结束');
    }
  }, 1500);
});

// 核心处理函数
function processPage() {
  // 检查是否已在视频页
  if (document.querySelector('.prism-controlbar')) {
    log('已在视频播放页，设置播放参数');
    setupVideoPlayer();
    return;
  }
  
  // 课程列表页处理
  log('在课程列表页，查找学习按钮');
  
  // 查找包含目标文本的按钮容器
  const btnContainers = document.querySelectorAll('.btn-contain');
  let targetContainer = null;
  
  btnContainers.forEach(container => {
    const text = container.textContent;
    if (text.includes('我要学习') || text.includes('继续学习')) {
      targetContainer = container;
      log(`找到目标按钮容器: ${text.trim()}`);
    }
  });
  
  // 查找进度
  const progressContainer = document.querySelector('.progress-contain');
  const progressText = progressContainer ? progressContainer.textContent : '无进度信息';
  const is100Percent = progressText.includes('100%');
  log(`当前进度: ${progressText}, 已完成: ${is100Percent}`);
  
  // 符合条件则点击
  if (targetContainer && !is100Percent) {
    log('尝试点击按钮容器进入学习');
    try {
      // 直接点击容器
      targetContainer.click();
      log('点击事件已触发');
      
      // 额外触发内部按钮点击（双重保障）
      const innerButton = targetContainer.querySelector('button');
      if (innerButton) {
        innerButton.click();
        log('内部按钮点击事件已触发');
      }
    } catch (e) {
      log(`点击出错: ${e.message}`);
    }
  }
}

// 视频播放页设置
function setupVideoPlayer() {
  // 设置2倍速
  setPlaybackRate(2.0);
  
  // 设置流畅画质
  setQuality('流畅');
  
  // 监控进度
  monitorProgress();
}

// 设置播放速度
function setPlaybackRate(rate) {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    const video = document.querySelector('video');
    
    if (video) {
      video.playbackRate = rate;
      log(`视频速度已设置为${rate}x`);
      clearInterval(timer);
    } else if (attempts >= 10) {
      log('未找到视频元素，无法设置速度');
      clearInterval(timer);
    }
  }, 1000);
}

// 设置画质
function setQuality(quality) {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    const qualityContainer = document.querySelector('.quality-components');
    
    if (qualityContainer) {
      const currentQuality = qualityContainer.querySelector('.current-quality');
      if (currentQuality && currentQuality.textContent.trim() === quality) {
        log(`已为${quality}画质`);
        clearInterval(timer);
        return;
      }
      
      // 点击切换画质
      try {
        currentQuality.click();
        setTimeout(() => {
          const qualityOption = Array.from(qualityContainer.querySelectorAll('.quality-list li'))
            .find(li => li.textContent.trim() === quality || li.dataset.def === quality);
          
          if (qualityOption) {
            qualityOption.click();
            log(`已切换为${quality}画质`);
          } else {
            log(`未找到${quality}画质选项`);
          }
        }, 300);
        clearInterval(timer);
      } catch (e) {
        log(`切换画质出错: ${e.message}`);
      }
    } else if (attempts >= 10) {
      log('未找到画质控制元素');
      clearInterval(timer);
    }
  }, 1000);
}

// 监控进度并关闭页面
function monitorProgress() {
  const checkInterval = setInterval(() => {
    const progressEl = document.querySelector('.el-progress.fr.el-progress--line');
    if (progressEl && progressEl.textContent.includes('100%')) {
      log('学习已完成，关闭页面');
      clearInterval(checkInterval);
      chrome.runtime.sendMessage({action: 'closeTab'});
    }
  }, 5000);
}

// 监听DOM变化
const observer = new MutationObserver(() => {
  log('检测到页面变化，重新检查');
  processPage();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
