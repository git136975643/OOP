// import "../css/bless.less";
// import "../css/global.less";
// import { $, $$$, closeLoading, showLoading } from "./common.js";
// import { utils } from "./utils.min.js";

let pageContainer = $(".page-container");
function toPage(index) {
  pageContainer.style.marginLeft = `-${index * 7.5}rem`;
}
toPage(0);

// 第一屏
let page1 = {
  doms: {
    txtAuthor: $("#txtAuthor"), // 发送祝福者名称文本框
    txtContent: $("#txtContent"), // 祝福内容文本框
    bntNext: $("#page1Next"), // 下一步按钮
  },
  init() {
    /* 1. 先得到初始的页面高度 */
    // 处理移动端点击输入区弹出键盘区域元素高度变化的问题
    let initHeight = window.innerHeight;
    pageContainer.style.height = initHeight + "px"; // 防止文本编辑弹出的键盘改变原始高度

    /* 2. 使用某个变量记录「祝福内容文本框」是否聚焦 */
    let contentIsFocus = false; // 设置祝福语框的聚焦状态
    this.doms.txtContent.addEventListener("focus", () => {
      contentIsFocus = true;
      resetMarginTop();
    });
    this.doms.txtContent.addEventListener("blur", () => {
      contentIsFocus = false;
    });
    function resetMarginTop() {
      if (window.innerHeight < initHeight - 100 && contentIsFocus) {
        // 如果祝福内容聚焦，并且窗口变小
        pageContainer.style.marginTop = "-3rem";
      } else {
        pageContainer.style.marginTop = 0;
      }
    }
    /*3. 监听窗口尺寸改变事件*/
    window.addEventListener("resize", resetMarginTop);

    /* 4. 监听「下一步」按钮点击事件 */
    this.doms.bntNext.addEventListener("click", () => {
      if (!page1.doms.txtAuthor.value.trim()) {
        alert("请检查您的名称（名字输入是否正确）");
        return;
      }
      if (!page1.doms.txtContent.innerText.trim()) {
        alert("请检查您的祝福语");
        return;
      }
      toPage(1);
    });
  },
};
page1.init();

// 第二屏
let page2 = {
  // 第2页的相关dom
  doms: {
    btnPrev: $("#page2Prev"), // 上一步按钮
    btnNext: $("#page2Next"), // 下一步按钮
    audio: $("#audSound"), // 音频元素，用于播放录制的音频
    btnRecord: $("#btnRecord"), // 录制语音按钮
    btnPlay: $("#btnPlay"), // 播放/暂停语音按钮
    btnDelete: $("#btnDelete"), // 删除语音按钮
    desc: $(".page2 .banner p"), // 用于描述可录制时间的文本
    number: $(".page2 .number"), // 用于提示剩余时间的元素
    tape: $(".page2 .g-tape"), // 磁带元素
  },
  /*
   * 用于描述当前的录音信息
   */
  sound: {
    /**
     * 录制状态，共4种
     * no-voice: 没有录制声音
     * recording: 正在录制中
     * playing: 正在播放中
     * stop: 停止播放
     */
    status: "no-voice",
    maxSeconds: 45, // 最大可录制秒数
    remainSeconds: 0, // 剩余可录制秒数
    timer: null, // 用于不断更新剩余秒数的计时器
    audioUrl: null, // 录制完成后生成音频播放地址
  },
  render() {
    // 根据 this.sound 中的信息，设置正确的界面

    // 设置提示文本
    this.doms.desc.innerText = `您可以录制${this.sound.maxSeconds}秒的音频`;
    // 设置剩余时间不显示（一开始）
    this.doms.number.innerText = "";
    if (this.sound.status === "no-voice") {
      // 状态为：「没有录音」
      // 1. 磁带不再转动
      this.doms.tape.classList.remove("playing");
      // 2. 录音按钮的文本为：「录制」样式为：「普通」
      this.doms.btnRecord.innerText = "录制";
      this.doms.btnRecord.className = "btn2";
      // 3. 播放按钮的文本为：「播放」 样式为：「不可用」
      this.doms.btnPlay.innerText = "播放";
      this.doms.btnPlay.className = "btn2 disabled";
      // 4 删除按钮的样式为：「不可用」
      this.doms.btnDelete.className = "btn2 disabled";
    } else if (this.sound.status === "recording") {
      // 状态为：「正在录音」
      // 1. 磁带转动
      this.doms.tape.classList.add("playing");
      // 2. 录音按钮的文本为：「停止」样式为：「按下」
      this.doms.btnRecord.innerText = "停止";
      this.doms.btnRecord.className = "btn2 press";
      // 3. 播放按钮的文本为：「播放」样式为：「不可用」
      this.doms.btnPlay.innerText = "播放";
      this.doms.btnPlay.className = "btn2 disabled";
      // 4. 删除按钮的样式为：「不可用」
      this.doms.btnDelete.className = "btn2 disabled";
      // 5. 如果剩余时间小于等于10秒，则需要显示
      if (this.sound.remainSeconds <= 10) {
        this.doms.number.innerText = this.sound.remainSeconds;
      }
    } else if (this.sound.status === "playing") {
      // 状态为：「正在播放」
      // 1. 磁带转动
      this.doms.tape.classList.add("playing");
      // 2. 录音按钮的文本为：「重录」
      this.doms.btnRecord.innerText = "重录";
      this.doms.btnRecord.className = "btn2 disabled"; //样式为：「不可用」
      // 3. 播放按钮的文本为：「停止」
      this.doms.btnPlay.innerText = "停止";
      this.doms.btnPlay.className = "btn2 press"; //样式为：「按下」
      // 4. 删除按钮的样式为：「普通」
      this.doms.btnDelete.className = "btn2";
    } else if (this.sound.status === "stop") {
      // 状态为：「停止播放」
      // 1. 磁带不再转动
      this.doms.tape.classList.remove("playing");
      // 2. 录制按钮的文字为：「重录」
      this.doms.btnRecord.innerText = "重录";
      this.doms.btnRecord.className = "btn2"; //样式为：「普通」
      // 3. 播放按钮的文本为：「播放」
      this.doms.btnPlay.innerText = "播放";
      this.doms.btnPlay.className = "btn2"; //样式为：「普通」
      // 4. 删除按钮的样式为：「普通」
      this.doms.btnDelete.className = "btn2";
    }
  },
  // 开始录制声音
  async startRecord() {
    if (!["no-voice", "stop"].includes(this.sound.status)) {
      return;
    }
    try {
      await utils.audioRecorder.start();
      // 2. 状态变化。 no - voice, stop-- > recording
      this.sound.status = "recording";
      // 3. 初始化剩余时间。剩余时间 = 最大可录制时间
      this.sound.remainSeconds = this.sound.maxSeconds;
      // 4. render
      this.render();
      // 5. 开启计时器，每隔一秒钟减少剩余时间，直到剩余时间为0时停止录音
      this.sound.timer = setInterval(() => {
        this.sound.remainSeconds--;
        this.render();
        if (this.sound.remainSeconds <= 0) {
          this.stopRecord();
        }
      }, 1000);
    } catch {
      alert("没有获取录音权限");
    }
  },
  // 停止录制声音
  async stopRecord() {
    //         1. 状态变化。 recording --> stop
    if (this.sound.status !== "recording") {
      return;
    }
    this.sound.status = "stop";
    // 2. 停止计时器
    clearInterval(this.sound.timer);
    // 3. render
    this.render();
    // 4. 开启loading
    showLoading();
    // 5. 停止录音并上传__utils.min.js已封装了
    const resp = await utils.audioRecorder.stopAndUpload(
      `https://bless.yuanjin.tech/api/upload`,
      {
        region: "oss-cn-chengdu",
        accessKeyId: "LTAI4FxxWvkNjZjzygnQ2p3x",
        accessKeySecret: "GDTcLVwmUO7OmjWE4s4CRHK84VicPr",
        bucket: "blessing-voice",
      }
    );
    // 6. 设置audio元素的音频源
    this.doms.audio.src = resp.data.url;
    // 7. 设置sound.audioUrl
    this.sound.audioUrl = resp.data.url;
    // 8. 关闭loading
    closeLoading();
  },
  // 播放录音
  play() {
    // 1. 状态变化。 stop --> playing
    if (this.sound.status !== "stop") {
      return;
    }
    this.sound.status = "playing";
    // 2. 音频元素播放
    this.doms.audio.play();
    // 3. render
    this.render();
  },
  // 停止播放录音
  stop() {
    // 1. 状态变化。 playing --> stop
    if (this.sound.status !== "playing") {
      return;
    }
    this.sound.status = "stop";
    // 2. 音频元素暂停
    this.doms.audio.pause();
    // 3. 音频元素播放时间归零
    this.doms.audio.currentTime = 0;
    // 4. render
    this.render();
  },
  // 移除录音
  remove() {
    // 1. 状态变化。 stop, playing --> no-voice
    if (this.sound.status !== "stop" && this.sound.status !== "playing") {
      return;
    }
    this.sound.status = "no-voice";
    this.doms.audio.pause();
    // 2. 去掉音频元素的音频源
    this.doms.audio.src = "";
    // 3. 设置 sound.audioUrl 为 null
    this.sound.audioUrl = null;
    // 4. render
    this.render();
  },
  // 初始化第2页
  init() {
    //1. 根据录音信息设置界面
    this.render();
    //2. 录音按钮事件
    this.doms.btnRecord.addEventListener("click", () => {
      if (["no-voice", "stop"].includes(this.sound.status)) {
        this.startRecord();
      } else if (this.sound.status === "recording") {
        this.stopRecord();
      }
    });
    //3. 播放/暂停按钮事件
    this.doms.btnPlay.addEventListener("click", () => {
      if (this.sound.status === "playing") {
        this.stop();
      } else if (this.sound.status === "stop") {
        this.play();
      }
    });
    //4. 移除录音事件
    this.doms.btnDelete.addEventListener("click", () => {
      if (!["no-voice", "recording"].includes(this.sound.status)) {
        this.remove();
      }
    });
    //5. 录音播放完成后事件
    this.doms.audio.addEventListener("ended", () => {
      this.stop();
    });
    //6. 上一步按钮事件
    this.doms.btnPrev.addEventListener("click", () => {
      toPage(0);
      this.stop();
    });
    //7. 下一步按钮事件
    this.doms.btnNext.addEventListener("click", () => {
      toPage(2);
      this.stop();
      page3.play();
    });
  },
};

page2.init();

// 第三屏
let page3 = {
  doms: {
    btnPrev: $("#page3Prev"), //上一步按钮
    btnFinish: $("#page3Finish"), //完成并分享按钮
    musicPrev: $(".page3 .arrow-left"), //上一曲按钮
    musicNext: $(".page3 .arrow-right"), //下一曲按钮
    musicText: $(".page3 .bg-music"), //背景音乐文本
    audBg: $("#audBg"), //背景音乐音频元素
  },
  // 背景音乐名称
  bgMusicNames: [
    "春节序曲（一）",
    "春节序曲（二）",
    "春节序曲（三）",
    "辞旧迎新",
    "财源滚滚",
  ],
  currentBgMusicIndex: 0, // 当前背景音乐的索引
  // 通过索引设置背景音乐
  setBgMusic(index) {
    this.currentBgMusicIndex = index;
    this.doms.musicText.innerText = `${index + 1}.${this.bgMusicNames[index]}`;
    this.doms.audBg.src = `./assets/media/${index}.mp3`;
  },
  // 播放背景音乐
  play() {
    this.doms.audBg.play();
  },
  // 停止播放背景音乐
  stop() {
    this.doms.audBg.pause();
  },
  // 收集全部页面的数据，提交到服务器
  async submit() {
    let resp = await fetch("https://bless.yuanjin.tech/api/bless", {
      // 请求配置
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        // 在这里写服务器要求的数据格式
        author: page1.doms.txtAuthor.value,
        content: page1.doms.txtContent.innerText,
        audioUrl: page2.sound.audioUrl,
        bgMusicIndex: page3.currentBgMusicIndex,
      }),
    });
    resp = await resp.json();
    return resp.data;
  },
  // 弹出分享区域
  async showShareArea() {
    showLoading();

    let divModal = $$$("div");
    divModal.className = "g-modal";
    // 得到上传的id
    let resp = await this.submit();
    // 得到要分享的网址
    let url = `${location.origin}/greeting-card/?${resp._id}`;
    // 通过自定义工具包utils.share.createImg()方法生成可分享的图片，得到图片的base64数据。
    let imgSrc = await utils.share.createImg(
      "./assets/cover-bg.jpg",
      url,
      resp.author
    );
    divModal.innerHTML = `<div class="share-container">
        <img src="${imgSrc}" alt="">
        <button class="g-btn" data-default="true">复制分享图片</button>
      </div>`;
    document.body.appendChild(divModal);

    // 点击复制图片
    divModal.querySelector(".g-btn").addEventListener("click", () => {
      this.copyShareImage();
      $(".share-container").parentElement.remove();
    });
    closeLoading();
  },
  // 复制分享图片
  async copyShareImage() {
    try {
      let imgDom = $(".share-container img");
      // 使用自定义工具包将某个img元素复制到剪切板
      await utils.share.copyImage(imgDom);
      alert("复制图片成功,可以去粘贴发送了");
    } catch {
      alert("由于您浏览器的限制，无法完成图片复制，请自行截图或用谷歌浏览器");
    }
  },
  // 初始化第3页
  init() {
    this.setBgMusic(0);
    // 1. 上一曲事件
    this.doms.musicPrev.addEventListener("click", () => {
      let newIdx = this.currentBgMusicIndex - 1;
      if (newIdx < 0) {
        newIdx = this.bgMusicNames.length - 1;
      }
      this.setBgMusic(newIdx);
      this.play();
    });
    // 2. 下一曲事件
    this.doms.musicNext.addEventListener("click", () => {
      let newIdx = this.currentBgMusicIndex + 1;
      if (newIdx > this.bgMusicNames.length - 1) {
        newIdx = 0;
      }
      this.setBgMusic(newIdx);
      this.play();
    });
    // 3. 上一步按钮事件
    this.doms.btnPrev.addEventListener("click", () => {
      toPage(1);
      this.stop();
    });
    // 4. 完成并分享按钮事件
    this.doms.btnFinish.addEventListener("click", () => {
      this.showShareArea();
    });
  },
};
page3.init();

// 显示默认的祝福信息
async function init() {
  showLoading();

  // 1. 获取远程数据
  let resp = await fetch(
    `https://bless.yuanjin.tech/api/bless?id=${location.search.replace(
      "?",
      ""
    )}`
  );
  resp = await resp.json();
  resp = resp.data;
  closeLoading();

  if (resp) {
    // 如果远程数据有值，设置默认
    page1.doms.txtAuthor.value = resp.author;
    page1.doms.txtContent.innerText = resp.content;
    page3.setBgMusic(resp.bgMusicIndex);
  }
}

init();
